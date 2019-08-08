// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { AdminPage, AdminPageProps } from "../views/AdminPage";

export class AdminController extends MvcRouter.Controller {
    private adminPage: AdminPage;

    constructor(protected app: App) {
        super();
    }

    public load(params: MvcRouter.QueryParams): void {
        super.load(params);

        const props: AdminPageProps = {
            onDeleteIndexClick: () => this.onDeleteIndexClick(),
            onAddFolderClick: () => this.onAddFolderClick(),
            folderSuggestions: [ "/projects" ]
        };
        props.ref = component => {
            if (component) {
                this.adminPage = component;
                this.initPage();
            }
        };
        const element = UIBuilder.createElement(AdminPage, props) as HTMLElement;
        const appBody = this.app.getAppBody();
        appBody.innerHTML = '';
        appBody.appendChild(element);
    }

    private initPage(): void {
        this.displayIndexStatus();
        fetch('/eureka-service/api/engine/folders')
            .then(response => response.json())
            .then(folders => this.adminPage.setFolderSuggestions(folders));
    }

    private onDeleteIndexClick(): void {
        const options = {
            method: 'DELETE'
        };
        fetch('/eureka-service/api/engine/index', options)
            .then(response => response.json())
            .then(result => {
                this.adminPage.displayResult(result);
                this.displayIndexStatus();
            })
            .catch(error => this.adminPage.displayError(error));
    }

    private displayIndexStatus(): void {
        fetch('/eureka-service/api/engine/status')
            .then(response => response.json())
            .then(result => this.adminPage.displayCount(`There are ${result.count} files in the index.`));
    }

    private displayIndexingProgress(): void {
        if (window['EventSource']) {
            const es = new EventSource('/eureka-service/api/engine/progress');
            es.addEventListener('message', ev => {
                this.adminPage.displayProgress('Currently indexing ' + ev.data);
            });
            es.addEventListener('error', (ev) => {
                this.displayIndexStatus();
                this.adminPage.displayProgress('');
                this.adminPage.displayResult('');
                es.close();
            });
        }
    }

    private onAddFolderClick(): void {
        const folder = this.adminPage.getFolder();
        if (!folder) {
            alert('Specify a folder to index');
            return;
        }
        const options = {
            method: 'POST'
        };
        fetch(`/eureka-service/api/engine/index?path=${encodeURIComponent(folder)}`, options)
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    this.adminPage.displayError(result);
                }
                else {
                    this.adminPage.displayResult(result);
                    this.displayIndexingProgress();
                }
            })
            .catch(error => this.adminPage.displayError(error));
    }
}
