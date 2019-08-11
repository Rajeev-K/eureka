// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { AdminPage, AdminPageProps } from "../views/AdminPage";
import { MessageBox } from "../views/MessageBox";
import { ExtensionsDialog } from "../views/ExtensionsDialog";
import { FoldersDialog } from "../views/FoldersDialog";
import { IndexRequest } from "../models/IndexRequest";

export class AdminController extends MvcRouter.Controller {
    private adminPage: AdminPage;
    private extensions: string[];
    private folders: string[];

    constructor(protected app: App) {
        super();
    }

    public load(params: MvcRouter.QueryParams): void {
        super.load(params);

        const props: AdminPageProps = {
            onDeleteIndexClick: () => this.onDeleteIndexClick(),
            onAddFolderClick: () => this.onAddFolderClick(),
            onEditIndexableExtensions: () => this.onEditIndexableExtensions(),
            onEditSkippableFolders: () => this.onEditSkippableFolders(),
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
            .then(folders => this.isLoaded() && this.adminPage.setFolderSuggestions(folders));
        fetch('/eureka-service/api/engine/skippablefolders')
            .then(response => response.json())
            .then(folders => {
                if (this.isLoaded()) {
                    this.folders = folders;
                    this.adminPage.setSkippableFolders(folders);
                }
            });
        fetch('/eureka-service/api/engine/indexableextensions')
            .then(response => response.json())
            .then(extensions => {
                if (this.isLoaded()) {
                    this.extensions = extensions;
                    this.adminPage.setIndexableExtensions(extensions);
                }
            });
    }

    private onDeleteIndexClick(): void {
        const options = {
            method: 'DELETE'
        };
        MessageBox.confirm("Confirm: Delete search index?")
            .then(() => fetch('/eureka-service/api/engine/index', options))
            .then(response => response.json())
            .then(result => {
                this.adminPage.displayResult(result);
                this.displayIndexStatus();
            })
            .catch(error => {
                if (this.isLoaded()) {
                    if (!error.dialogCancelled)
                        this.adminPage.displayError(error);
                }
            });
    }

    private displayIndexStatus(): void {
        fetch('/eureka-service/api/engine/status')
            .then(response => response.json())
            .then(result => {
                if (this.isLoaded()) {
                    if (result.indexingInProgress)
                        this.displayIndexingProgress();
                    else
                        this.adminPage.displayCount(`There are ${result.fileCount} files in the index.`);
                }
            });
    }

    private displayIndexingProgress(): void {
        this.adminPage.displayCount('(pending)');
        this.adminPage.displayResult('Indexing is in progress.');
        if (window['EventSource']) {
            const es = new EventSource('/eureka-service/api/engine/progress');
            es.addEventListener('message', ev => {
                this.isLoaded() && this.adminPage.displayProgress('Currently indexing ' + ev.data);
            });
            es.addEventListener('error', (ev) => {
                if (this.isLoaded()) {
                    this.displayIndexStatus();
                    this.adminPage.displayProgress('');
                    this.adminPage.displayResult('');
                }
                es.close();
            });
        }
    }

    private onAddFolderClick(): void {
        const folder = this.adminPage.getFolder();
        if (!folder) {
            MessageBox.show('Specify a folder to index.');
            return;
        }
        const indexRequest: IndexRequest = {
            path: folder,
            indexableExtensions: this.extensions,
            skippableFolders: this.folders
        };
        const options = {
            method: 'POST',
            body: JSON.stringify(indexRequest),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        fetch('/eureka-service/api/engine/index', options)
            .then(response => response.json())
            .then(result => {
                if (this.isLoaded()) {
                    if (result.error)
                        this.adminPage.displayError(result);
                    else
                        this.displayIndexingProgress();
                }
            })
            .catch(error => this.isLoaded() && this.adminPage.displayError(error));
    }

    private onEditIndexableExtensions(): void {
        const dialog = new ExtensionsDialog();
        dialog.extensions = this.extensions;
        dialog.showDialog()
            .then(() => {
                this.extensions = dialog.extensions;
                this.adminPage.setIndexableExtensions(this.extensions);
            }).catch(() => null);
    }

    private onEditSkippableFolders(): void {
        const dialog = new FoldersDialog();
        dialog.folders = this.folders;
        dialog.showDialog()
            .then(() => {
                this.folders = dialog.folders;
                this.adminPage.setSkippableFolders(this.folders);
            }).catch(() => null);
    }
}
