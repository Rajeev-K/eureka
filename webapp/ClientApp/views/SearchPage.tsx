// Copyright (c) 2019-present, Rajeev-K.

import { CommonHeader } from "./CommonHeader";
import { SearchResultItem } from "../models/SearchResultItem";
import { FilterControl, Filter } from "./FilterControl";
import { SplitterControl } from "./SplitterControl";
import { SourceCodeViewer } from "./SourceCodeViewer";
import { addClassExclusively } from "./ViewUtils";
import * as Utils from "../Utils";

export interface SearchPageProps extends UIBuilder.Props<SearchPage> {
    onSearchClick: () => void;
    onManageClick: () => void;
    onFileClick: (path: string) => void;
    onFolderChanged: (folder: string) => void;
    onHistoryClicked: (path: string) => void;
}

export class SearchPage extends UIBuilder.Component<SearchPageProps> {
    private root: HTMLElement;
    private splitterControl: SplitterControl;
    private input: HTMLInputElement;
    private hiddenInput: HTMLInputElement;
    private errorDisplay: HTMLElement;
    private searchDisplay: HTMLElement;
    private filterDisplay: HTMLElement;
    private sourceCodeViewer: SourceCodeViewer;

    constructor(props) {
        super(props);
    }

    private onClearClick(): void {
        this.input.value = '';
    }

    public getQuery(): string {
        return this.input.value;
    }

    public layout(): void {
        this.splitterControl.layout();
        if (this.sourceCodeViewer)
            this.sourceCodeViewer.layout();
    }

    public displayWelcomeScreen(): void {
        this.root.appendChild(
            <div className="welcome-screen">
                Welcome to <span className="welcome-logo">eureka<i>!</i></span>
                <span> Press the Manage button to add a folder to the search index.</span>
            </div>
        );
    }

    public displayResult(result: SearchResultItem[]): void {
        this.displayError('');
        this.renderResult(result, null);
        this.renderFilter(result);
    }

    private filterResults(result: SearchResultItem[], filter: Filter): SearchResultItem[] {
        const extensions: { [key: string]: any } = {};
        if (filter.extensions)
            filter.extensions.forEach(ext => extensions[ext] = true);
        return result.filter(result => {
            const path = result.path.toLowerCase();
            if (filter.extensions) {
                if (!extensions[Utils.getFilenameExtension(path)])
                    return false;
            }
            if (filter.include) {
                if (path.indexOf(filter.include) === -1)
                    return false;
            }
            if (filter.exclude && filter.exclude.length) {
                for (const ex of filter.exclude) {
                    if (path.indexOf(ex) !== -1)
                        return false;
                }
            }
            return true;
        });
    }

    private renderResult(result: SearchResultItem[], filter: Filter): void {
        const noRowsMessage = filter ? "No matching results." : "No results returned.";
        const filteredResults = filter ? this.filterResults(result, filter) : result;
        const resultDisplay = this.getRendering(filteredResults, noRowsMessage);
        this.searchDisplay.innerHTML = '';
        this.searchDisplay.appendChild(resultDisplay);
        window.setTimeout(() => {
            this.splitterControl.relayout();
            if (this.sourceCodeViewer)
                this.sourceCodeViewer.layout();
        });
    }

    public displayError(error: any): void {
        const message = Utils.getErrorMessageFrom(error);
        this.errorDisplay.title = message;
        this.errorDisplay.innerText = message.replace(/\n/g, ' ');
    }

    private onResultTableClick(ev): void {
        const row = ev.target.closest(".item-row");
        addClassExclusively(row, "selected-row", Array.from(this.searchDisplay.querySelectorAll(".item-row")));
        const path = ev.target.innerText;
        if (path) {
            this.props.onFileClick(path);
        }
    }

    public displaySourceCode(sourceCode: string, language: string, path: string): void {
        this.sourceCodeViewer.displaySourceCode(sourceCode, language, path);
    }

    public displayFolderItems(folder: string, items: string[]): void {
        this.sourceCodeViewer.displayFolderItems(folder, items);
    }

    private getRendering(result: SearchResultItem[], noRowsMessage: string): JSX.Element {
        if (!result || !result.length)
            return <div className="no-rows-message">{noRowsMessage}</div>;
        const rows = result.map(item => <tr className="item-row"><td>{item.path}</td></tr>);
        return (
            <table className="result-table" onClick={ev => this.onResultTableClick(ev)}>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }

    private onKeyPress(ev): void {
        const keyCode = ev.keyCode || ev.which;
        if (keyCode == '13') {
            this.props.onSearchClick();
        }
    }

    private static getFilenameExtensions(items: SearchResultItem[]): string[] {
        const map: { [key: string]: any } = {};
        items.forEach(item => {
            const ext = Utils.getFilenameExtension(item.path);
            if (ext)
                map[ext] = '';
        });
        return Object.keys(map).sort();
    }

    private onFilterChanged(result: SearchResultItem[], filter: Filter): void {
        this.renderResult(result, filter);
    }

    private renderFilter(result: SearchResultItem[]): void {
        const extensions = SearchPage.getFilenameExtensions(result);
        this.filterDisplay.innerHTML = '';
        const el = <FilterControl extensions={extensions} onFilterChanged={filter => this.onFilterChanged(result, filter)} />;
        this.filterDisplay.appendChild(el);
    }

    private onSplitterMoved(): void {
        if (this.sourceCodeViewer)
            this.sourceCodeViewer.layout();
    }

    public render(): JSX.Element {
        return (
            <div className="search-page" ref={el => this.root = el}>
                <div className="top-bar">
                    <CommonHeader />
                    <div className="input-panel">
                        <div className="searchbox">
                            <input type="text" className="query-input" spellcheck={false} onKeyPress={ev => this.onKeyPress(ev)}
                                   placeholder="Type search terms here" ref={el => this.input = el} />
                            <button type="button" className="clear-button" onClick={() => this.onClearClick()}>
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="result-filter" ref={el => this.filterDisplay = el}></div>
                    </div>
                    <button type="button" className="default-button" onClick={this.props.onSearchClick}>Search</button>
                    <button type="button" className="manage-button" onClick={this.props.onManageClick}>
                        <i class="fas fa-cog"></i>
                        Manage
                    </button>
                </div>
                <div className="error-message" ref={el => this.errorDisplay = el}></div>
                <SplitterControl className="result-splitter" ref={splitter => this.splitterControl = splitter}
                    onSplitterMoved={() => this.onSplitterMoved()}
                    firstChild={<div className="search-result" ref={el => this.searchDisplay = el}></div> as HTMLElement}
                    secondChild={<SourceCodeViewer ref={el => this.sourceCodeViewer = el}
                                                   onHistoryClicked={path => this.props.onHistoryClicked(path)}
                                                   onFolderChanged={folder => this.props.onFolderChanged(folder)}
                                                   onFileSelected={path => this.props.onFileClick(path)} /> as HTMLElement} />
            </div>
        )
    }
}
