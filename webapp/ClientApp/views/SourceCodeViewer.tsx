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
    private folder: string;

    constructor(props: SourceCodeViewerProps) {
        super(props);
    }

    public layout(): void {
        if (this.editor)
            this.editor.layout();
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
    }

    public displayFolderItems(folder: string, items: string[]): void {
        this.folder = folder;
        this.filePicker.setSuggestions(items);
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
        if (!item.endsWith("/")) {
            if (this.props.onFileSelected) {
                this.props.onFileSelected(item);
            }
        }
    }

    public render(): JSX.Element {
        return (
            <div className="source-code-viewer">
                <ComboBox className="file-picker" isEditable={true} ref={el => this.filePicker = el}
                          onTextEdited={text => this.onPathEdited(text)}
                          onItemSelected={item => this.onItemSelected(item)} />
                <div className="source-display" ref={el => this.sourceDisplay = el}></div>
            </div>
        );
    }
}
