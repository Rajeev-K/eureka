// Copyright (c) 2019-present, Rajeev-K.

import { CommonHeader } from "./CommonHeader";
import { InfoIcon } from "./Icons";

export interface AdminPageProps extends UIBuilder.Props<AdminPage> {
    onDeleteIndexClick: () => void;
    onAddFolderClick: () => void;
}

export class AdminPage extends UIBuilder.Component<AdminPageProps> {
    private input: HTMLInputElement;
    private resultDisplay: HTMLElement;
    private progressDisplay: HTMLElement;
    private countDisplay: HTMLElement;

    constructor(props) {
        super(props);
    }

    private onClearClick(): void {
        this.input.value = '';
    }

    public getFolder(): string {
        return this.input.value;
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

    public displayCount(result: any): void {
        this.countDisplay.innerText = `There are ${result.count} files in the index.`;
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
                            <input type="text" className="folder-input" spellcheck={false}
                                   placeholder="Paste folder path here" ref={el => this.input = el} />
                            <div><label><InfoIcon />Path is case sensitive and must start with /projects. Use / to separate folders.</label></div>
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
                </div>
            </div>
        )
    }
}
