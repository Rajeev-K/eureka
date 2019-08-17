// Copyright (c) 2019-present, Rajeev-K.

import { ComboBox } from "./ComboBox";
import * as Utils from "../Utils";

export interface SourceCodeViewerProps extends UIBuilder.Props<SourceCodeViewer> {
    onFileSelected: (path: string) => void;
    onFolderChanged: (newFolder: string) => void;
}

export class SourceCodeViewer extends UIBuilder.Component<SourceCodeViewerProps> {
    private sourceDisplay: HTMLElement;
    private editor: monaco.IEditor;
    private filePicker: ComboBox;
    private backButton: HTMLButtonElement;
    private forwardButton: HTMLButtonElement;
    private folder: string;
    private backStack: string[] = [];   // Note: currently displayed file is at the top of this stack.
    private forwardStack: string[] = [];
    private childFolders = new Set();

    constructor(props: SourceCodeViewerProps) {
        super(props);
    }

    public layout(): void {
        if (this.editor)
            this.editor.layout();
        this.enableDisableButtons();
    }

    private enableDisableButtons(): void {
        this.backButton.disabled = this.backStack.length < 2;
        this.forwardButton.disabled = this.forwardStack.length < 1;
    }

    public displaySourceCode(sourceCode: string, language: string, path: string): void {
        this.sourceDisplay.innerHTML = '';
        require(['vs/editor/editor.main'], monaco => {
            this.editor = monaco.editor.create(this.sourceDisplay, {
                language: language,
                readOnly: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: false,
                value: sourceCode
            });
        });
        this.filePicker.setValue(path);

        if (this.backStack.length === 0 || this.backStack[this.backStack.length - 1] !== path) {
            this.backStack.push(path);
            this.forwardStack = [];
            this.enableDisableButtons();
        }
    }

    /** Paths that end with '/' are folders. We remove the trailing '/' and keep track of which paths represent folders.  */
    private processFolderItems(items: string[]): string[] {
        this.childFolders = new Set();
        return items.map(item => {
            if (item.endsWith('/')) {
                const folder = item.substr(0, item.length - 1);
                this.childFolders.add(folder);
                return folder;
            }
            else {
                return item;
            }
        });
    }

    public displayFolderItems(folder: string, items: string[]): void {
        this.folder = folder;
        this.filePicker.setSuggestions(this.processFolderItems(items));
    }

    private onPathEdited(path: string): void {
        const newFolder = Utils.getFolderFromFilePath(path);
        if (newFolder !== this.folder) {
            if (this.props.onFolderChanged) {
                this.props.onFolderChanged(newFolder);
            }
        }
    }

    private onItemSelected(item: string): void {
        if (!this.childFolders.has(item)) {
            if (this.props.onFileSelected) {
                this.props.onFileSelected(item);
            }
        }
    }

    private onBackClick(): void {
        if (this.backStack.length > 1) {
            this.forwardStack.push(this.backStack.pop());
            if (this.props.onFileSelected) {
                this.props.onFileSelected(this.backStack[this.backStack.length - 1]);
            }
            this.enableDisableButtons();
        }
    }

    private onForwardClick(): void {
        if (this.forwardStack.length > 0) {
            this.backStack.push(this.forwardStack.pop());
            if (this.props.onFileSelected) {
                this.props.onFileSelected(this.backStack[this.backStack.length - 1]);
            }
            this.enableDisableButtons();
        }
    }

    private getItemIcon(item: string): JSX.Element {
        if (this.childFolders.has(item))
            return <i className="combo-item-icon fas fa-folder"></i>;
        else
            return <i className="combo-item-icon far fa-file"></i>;
    }

    public render(): JSX.Element {
        return (
            <div className="source-code-viewer">
                <div className="source-code-toolbar">
                    <button ref={el => this.backButton = el}
                            onClick={() => this.onBackClick()}><i className="fas fa-arrow-left"></i></button>
                    <button ref={el => this.forwardButton = el}
                            onClick={() => this.onForwardClick()}><i className="fas fa-arrow-right"></i></button>
                    <ComboBox className="file-picker" constrain={true} ref={el => this.filePicker = el}
                              getItemIcon={item => this.getItemIcon(item)}
                              onTextEdited={text => this.onPathEdited(text)}
                              onItemSelected={item => this.onItemSelected(item)} />
                </div>
                <div className="source-display" ref={el => this.sourceDisplay = el}></div>
            </div>
        );
    }
}
