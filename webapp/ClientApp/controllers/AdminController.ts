// Copyright (c) 2019-present, Rajeev-K.

import { App } from "../App";
import { AdminPage, AdminPageProps } from "../views/AdminPage";
import { MessageBox } from "../views/MessageBox";
import { ExtensionsDialog } from "../views/ExtensionsDialog";
import { FoldersDialog } from "../views/FoldersDialog";
import { IndexRequest } from "../models/IndexRequest";
import * as LocalStorage from "../LocalStorage";
import * as Utils from "../Utils";

const SkippableFoldersKey = "skippablefolders";
const IndexableExtensionsKey = "indexableextensions";

export class AdminController extends MvcRouter.Controller {
    private adminPage: AdminPage;
    private indexableExtensions: string[] = [];
    private skippableFolders: string[] = [];

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

    private extractFolders(items: string[]): string[] {
        return items.filter(s => s.endsWith("/")).map(s => s.substr(0, s.length - 1));
    }

    private initPage(): void {
        this.displayIndexStatus();

        const path = "/projects";
        fetch(`/eureka-service/api/searchengine/foldercontents?path=${encodeURIComponent(path)}`)
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
            .then(result => {
                if (this.isLoaded()) {
                    this.adminPage.setFolderSuggestions(this.extractFolders(result));
                }
            })
            .catch(error => this.isLoaded() && this.adminPage.displayError(error));

        this.skippableFolders = LocalStorage.get(SkippableFoldersKey);
        if (this.skippableFolders) {
            this.adminPage.setSkippableFolders(this.skippableFolders);
        }
        else {
            fetch('/eureka-service/api/searchengine/skippablefolders')
                .then(response => response.json())
                .then(result => Utils.validateResult(result))
                .then(folders => {
                    if (this.isLoaded()) {
                        this.skippableFolders = folders;
                        this.adminPage.setSkippableFolders(folders);
                    }
                })
                .catch(error => this.isLoaded() && this.adminPage.displayError(error));
        }

        this.indexableExtensions = LocalStorage.get(IndexableExtensionsKey);
        if (this.indexableExtensions) {
            this.adminPage.setIndexableExtensions(this.indexableExtensions);
        }
        else {
            fetch('/eureka-service/api/searchengine/indexableextensions')
                .then(response => response.json())
                .then(result => Utils.validateResult(result))
                .then(extensions => {
                    if (this.isLoaded()) {
                        this.indexableExtensions = extensions;
                        this.adminPage.setIndexableExtensions(extensions);
                    }
                })
                .catch(error => this.isLoaded() && this.adminPage.displayError(error));
        }
    }

    private onDeleteIndexClick(): void {
        MessageBox.confirm("Confirm: Delete search index?")
            .then(() => fetch('/eureka-service/api/searchengine/index', { method: 'DELETE' }))
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
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
        fetch('/eureka-service/api/searchengine/status')
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
            .then(result => {
                if (this.isLoaded()) {
                    if (result.indexingInProgress)
                        this.displayIndexingProgress();
                    else
                        this.adminPage.displayCount(`There are ${result.fileCount} files in the index.`);
                }
            })
            .catch(error => this.isLoaded() && this.adminPage.displayError(error));
    }

    private displayIndexingProgress(): void {
        this.adminPage.displayCount('(pending)');
        this.adminPage.displayResult('Indexing is in progress.');
        if (window['EventSource']) {
            const es = new EventSource('/eureka-service/api/searchengine/progress');
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
            indexableExtensions: this.indexableExtensions,
            skippableFolders: this.skippableFolders
        };
        const options = {
            method: 'POST',
            body: JSON.stringify(indexRequest),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        fetch('/eureka-service/api/searchengine/index', options)
            .then(response => response.json())
            .then(result => Utils.validateResult(result))
            .then(result => {
                if (this.isLoaded()) {
                    this.displayIndexingProgress();
                }
            })
            .catch(error => this.isLoaded() && this.adminPage.displayError(error));
    }

    private onEditIndexableExtensions(): void {
        const dialog = new ExtensionsDialog();
        dialog.extensions = [...this.indexableExtensions];
        dialog.showDialog()
            .then(() => {
                this.indexableExtensions = dialog.extensions;
                this.adminPage.setIndexableExtensions(this.indexableExtensions);
                LocalStorage.set(IndexableExtensionsKey, this.indexableExtensions);
            }).catch(() => {});
    }

    private onEditSkippableFolders(): void {
        const dialog = new FoldersDialog();
        dialog.folders = [...this.skippableFolders];
        dialog.showDialog()
            .then(() => {
                this.skippableFolders = dialog.folders;
                this.adminPage.setSkippableFolders(this.skippableFolders);
                LocalStorage.set(SkippableFoldersKey, this.skippableFolders);
            }).catch(() => {});
    }
}
