// Copyright (c) 2019-present, Rajeev-K.

import { CommonHeader } from "./CommonHeader";
import { InfoIcon } from "./Icons";
import { ComboBox } from "./ComboBox";

export interface AdminPageProps extends UIBuilder.Props<AdminPage> {
    onDeleteIndexClick: () => void;
    onAddFolderClick: () => void;
    folderSuggestions: string[];
    onEditIndexableExtensions: () => void;
    onEditSkippableFolders: () => void;
}

export class AdminPage extends UIBuilder.Component<AdminPageProps> {
    private resultDisplay: HTMLElement;
    private progressDisplay: HTMLElement;
    private countDisplay: HTMLElement;
    private indexableExtensionsDisplay: HTMLElement;
    private skippableFoldersDisplay: HTMLElement;
    private folderCombo: ComboBox;

    constructor(props) {
        super(props);
    }

    public getFolder(): string {
        return this.folderCombo.getValue();
    }

    public displayError(error: any): void {
        this.displayResult(error, true);
    }

    public displayResult(result: any, isError?: boolean): void {
        if (isError)
            this.resultDisplay.classList.add('error-message');
        else
            this.resultDisplay.classList.remove('error-message');
        let message: string;
        if (typeof result === 'string')
            message = result;
        else if (result.message)
            message = result.message;
        else
            message = JSON.stringify(result);
        this.resultDisplay.innerText = message;
    }

    public displayProgress(progress: any): void {
        this.progressDisplay.innerText = (typeof progress === 'string') ? progress : JSON.stringify(progress);
    }

    public displayCount(text: string): void {
        this.countDisplay.innerText = text;
    }

    public setFolderSuggestions(folders: string[]): void {
        this.folderCombo.setSuggestions(folders);
    }

    public setSkippableFolders(folders: string[]): void {
        this.skippableFoldersDisplay.innerText = folders.map(f => f && f[0] === '/' ? f.substring(1) : f).join(", ");
    }

    public setIndexableExtensions(extensions: string[]): void {
        this.indexableExtensionsDisplay.innerText = extensions.join(", ");
    }

    public render(): JSX.Element {
        return (
            <div className="admin-page">
                <CommonHeader />
                <div className="breadcrumb">
                    <a href="/" className="appnav">Search page</a> <i class="fas fa-angle-right"></i> Admin page
                </div>
                <div className="result-message" ref={el => this.resultDisplay = el}></div>
                <div className="progress-message" ref={el => this.progressDisplay = el}></div>
                <div className="layout-column">
                    <div className="add-folder-panel">
                        <h4>Index a folder</h4>
                        <div className="folder-input-section">
                            <ComboBox prompt="Folder path:" placeholder="Type folder path here"
                                      ref={el => this.folderCombo = el} suggestions={this.props.folderSuggestions} />
                            <div className="path-help">
                                <label><InfoIcon />Path is case sensitive and must start with /projects. Use / to separate folders.</label>
                            </div>
                        </div>
                        <button type="button" className="default-button" onClick={this.props.onAddFolderClick}>Add folder</button>
                    </div>
                    <div className="delete-index-panel">
                        <h4>Delete the index and start over</h4>
                        <button type="button" className="danger-button" onClick={this.props.onDeleteIndexClick}>Delete Index</button>
                    </div>
                </div>
                <div className="layout-column">
                    <div className="index-status">
                        <h4>Index Status</h4>
                        <div className="index-count" ref={el => this.countDisplay = el}></div>
                    </div>
                    <div className="settings">
                        <h4>Settings</h4>
                        <h5>Files with the following extensions will be indexed:</h5>
                        <div className="indexable-extensions" ref={el => this.indexableExtensionsDisplay = el}></div>
                        <button onClick={() => this.props.onEditIndexableExtensions()}>Edit...</button>
                        <h5>Folders with the following names will be skipped:</h5>
                        <div className="skippable-folders" ref={el => this.skippableFoldersDisplay = el}></div>
                        <button onClick={() => this.props.onEditSkippableFolders()}>Edit...</button>
                    </div>
                </div>
            </div>
        )
    }
}
