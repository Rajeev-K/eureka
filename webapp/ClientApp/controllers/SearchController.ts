// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { SearchPage, SearchPageProps } from "../views/SearchPage";
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
            onFileClick: path => this.onFileClick(path)
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
        fetch('/eureka-service/api/engine/status')
            .then(response => response.json())
            .then(result => {
                if (result.count === 0)
                    this.searchPage.displayWelcomeScreen();
            });
    }

    private onManageClick(): void {
        this.app.navigate('/admin');
    }

    private getLanguageFromPath(path: string): string {
        return Utils.getLanguageFromExtension(Utils.getFilenameExtension(path, true));
    }

    private onFileClick(path: string): void {
        fetch(`/eureka-service/api/engine/file?path=${encodeURIComponent(path)}`)
            .then(response => {
                if (response.status === 200) {
                    this.searchPage.displayError('');
                    return response.text();
                }
                else {
                    this.searchPage.displayError("The file could not be opened.");
                    return '';
                }
            })
            .then(text => {
                const language = this.getLanguageFromPath(path);
                this.searchPage.displaySourceCode(text, language);
            })
            .catch(error => this.searchPage.displayError(error));
    }

    private onSearchClick(): void {
        const query = this.searchPage.getQuery();
        if (!query) {
            alert("Enter search terms then press Search");
            return;
        }
        fetch(`/eureka-service/api/engine/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(result => this.searchPage.displayResult(result))
            .catch(error => this.searchPage.displayError(error));
    }

    public onWindowResize(): void {
        this.searchPage.layout();
    }
}
