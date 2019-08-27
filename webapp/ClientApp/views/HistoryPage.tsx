// Copyright (c) 2019-present, Rajeev-K.

import { CommonHeader } from "./CommonHeader";
import { SplitterControl } from "./SplitterControl";
import { addClassExclusively } from "./ViewUtils";
import { CommitHeader } from "../models/CommitHeader";
import { LoadingAnimation } from "./Icons";
import * as Utils from "../Utils";

export interface HistoryPageProps extends UIBuilder.Props<HistoryPage> {
    path?: string;
    onHistoryClick?: (index: number) => void;
}

export class HistoryPage extends UIBuilder.Component<HistoryPageProps> {
    private root: HTMLElement;
    private commitsDisplay: HTMLElement;
    private errorDisplay: HTMLElement;
    private loadingAnimation: LoadingAnimation;

    constructor(props) {
        super(props);
    }

    private removeLoadingAnimation(): void {
        if (this.loadingAnimation) {
            this.loadingAnimation.remove();
            this.loadingAnimation = null;
        }
    }

    public displayError(error: any): void {
        this.removeLoadingAnimation();
        this.errorDisplay.innerText = Utils.getErrorMessageFrom(error);
    }

    private onHistoryTableClick(ev): void {
        const row = ev.target.closest(".history-row");
        addClassExclusively(row, "selected-row", Array.from(this.commitsDisplay.querySelectorAll(".history-row")));
        const index = row.dataset.index;
        if (typeof index === 'string') {
            this.props.onHistoryClick(parseInt(index, 10));
        }
    }

    public displayHistory(history: CommitHeader[]): void {
        this.removeLoadingAnimation();
        const itemsElements = history.map((commit, index) => {
            const time = new Date(commit.time * 1000);
            return (
                <tr title={commit.fullMessage} className="history-row" data-index={index}>
                    <td>{commit.hashCode.substr(0, 10)}</td>
                    <td title={`${time.toDateString()} ${time.toTimeString()}`}>{time.toDateString()}</td>
                    <td>{commit.authorName}</td>
                    <td>{commit.shortMessage}</td>
                </tr>
            );
        });
        const table = (
            <table onClick={ev => this.onHistoryTableClick(ev)}>
                <tbody>
                    {itemsElements}
                </tbody>
            </table>
        );        
        this.commitsDisplay.innerHTML = '';
        this.commitsDisplay.appendChild(table as HTMLElement);
    }

    public render(): JSX.Element {
        return (
            <div className="history-page" ref={el => this.root = el}>
                <h1>Commit log</h1>
                <div className="commit-path">{this.props.path}</div>
                <div className="error-message" ref={el => this.errorDisplay = el}></div>
                <div ref={el => this.commitsDisplay = el}></div>
                <LoadingAnimation ref={el => this.loadingAnimation = el} />
            </div>
        )
    }
}
