// Copyright (c) 2019-present, Rajeev-K.

import { CommonHeader } from "./CommonHeader";
import { SplitterControl } from "./SplitterControl";
import { addClassExclusively } from "./ViewUtils";
import * as Utils from "../Utils";

export interface HistoryPageProps extends UIBuilder.Props<HistoryPage> {
    path?: string;
}

export class HistoryPage extends UIBuilder.Component<HistoryPageProps> {
    private root: HTMLElement;
    private commitListElement: HTMLElement;
    private errorDisplay: HTMLElement;

    constructor(props) {
        super(props);
    }

    public displayError(error: any): void {
        let message: string;
        if (typeof error === 'string')
            message = error;
        else if (error.message)
            message = error.message;
        else
            message = JSON.stringify(error);
        this.errorDisplay.innerText = message;
    }

    public displayHistory(history: any[]): void {
        const itemsElements = history.map(commit => {
            const time = new Date(commit.time * 1000);
            return (
                <tr title={commit.fullMessage}>
                    <td>{commit.hashCode.substr(0, 10)}</td>
                    <td title={`${time.toDateString()} ${time.toTimeString()}`}>{time.toDateString()}</td>
                    <td>{commit.authorName}</td>
                    <td>{commit.shortMessage}</td>
                </tr>
            );
        });
        const table = (
            <table>
                <tbody>
                    {itemsElements}
                </tbody>
            </table>
        );        
        this.commitListElement.innerHTML = '';
        this.commitListElement.appendChild(table as HTMLElement);
    }

    public render(): JSX.Element {
        return (
            <div className="history-page" ref={el => this.root = el}>
                <h1>Commit log</h1>
                <div className="commit-path">{this.props.path}</div>
                <div className="error-message" ref={el => this.errorDisplay = el}></div>
                <div ref={el => this.commitListElement = el}></div>
            </div>
        )
    }
}
