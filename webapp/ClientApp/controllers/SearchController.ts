// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { SearchPage, SearchPageProps } from "../views/SearchPage";
import { MessageBox } from "../views/MessageBox";
import * as Utils from "../Utils";

export class SearchController extends MvcRouter.Controller {
    private searchPage: SearchPage;

    constructor(protected app: App) {
        super();
    }

    public load(params: MvcRouter.QueryParams): void {
        super.load(params);

        const props: SearchPageProps = {
            onSearchClick: () => this.onSearchClick(),
            onManageClick: () => this.onManageClick(),
            onFileClick: path => this.onFileClick(path),
            onFolderChanged: folder => this.onFolderChanged(folder),
            onHistoryClicked: path => this.onHistoryClicked(path)
        };
        props.ref = component => {
            if (component) {
                this.searchPage = component;
                window.setTimeout(() => this.searchPage.layout());
                this.initPage();
            }
        };
        const element = UIBuilder.createElement(SearchPage, props) as HTMLElement;
        const appBody = this.app.getAppBody();
        appBody.innerHTML = '';
        appBody.appendChild(element);
    }

    private initPage(): void {
        fetch('/eureka-service/api/searchengine/status')
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
            .then(result => {
                if (this.isLoaded()) {
                    if (result.fileCount === 0)
                        this.searchPage.displayWelcomeScreen();
                }
            })
            .catch(error => this.isLoaded() && this.searchPage.displayError(error));
    }

    private onManageClick(): void {
        this.app.navigate('/admin');
    }

    private onFileClick(path: string): void {
        // Get file contents

        fetch(`/eureka-service/api/searchengine/file?path=${encodeURIComponent(path)}`)
            .then(response => {
                if (response.status === 200) {
                    if (this.isLoaded())
                        this.searchPage.displayError('');
                    return response.text();
                }
                else {
                    throw Error("The file could not be opened.");
                }
            })
            .then(text => {
                if (this.isLoaded()) {
                    const language = Utils.getLanguageFromPath(path);
                    this.searchPage.displaySourceCode(text, language, path);
                }
            })
            .catch(error => this.isLoaded() && this.searchPage.displayError(error));

        // Get other items in folder

        const folder = Utils.getFolderFromFilePath(path);
        this.onFolderChanged(folder);
    }

    private onFolderChanged(folder: string): void {
        fetch(`/eureka-service/api/searchengine/foldercontents?path=${encodeURIComponent(folder)}`)
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
            .then(result => {
                this.searchPage.displayFolderItems(folder, result);
            })
            .catch(error => console.log(error));
    }

    private onSearchClick(): void {
        const query = this.searchPage.getQuery();
        if (!query) {
            MessageBox.show("Enter search terms then press Search.");
            return;
        }
        fetch(`/eureka-service/api/searchengine/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
            .then(result => {
                if (this.isLoaded()) {
                    this.searchPage.displayResult(result);
                }
            })
            .catch(error => this.isLoaded() && this.searchPage.displayError(error));
    }

    private onHistoryClicked(path: string): void {
        Utils.openWindow(`/search/history?path=${encodeURIComponent(path)}`, "eureka-git");
    }

    public onWindowResize(): void {
        this.searchPage.layout();
    }
}
