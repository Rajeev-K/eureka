// Copyright (c) 2019-present, Rajeev-K.

import { ComboBox } from "./ComboBox";

export interface SourceCodeViewerProps extends UIBuilder.Props<SourceCodeViewer> {
    onFileSelected: (path: string) => void;
}

export class SourceCodeViewer extends UIBuilder.Component<SourceCodeViewerProps> {
    private sourceDisplay: HTMLElement;
    private editor: monaco.IEditor;
    private filePicker: ComboBox;

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

    public displayFolderItems(items: string[]): void {
        this.filePicker.setSuggestions(items);
    }

    public render(): JSX.Element {
        return (
            <div className="source-code-viewer">
                <ComboBox className="file-picker" ref={el => this.filePicker = el}
                          onItemSelected={item => this.props.onFileSelected(item)} />
                <div className="source-display" ref={el => this.sourceDisplay = el}></div>
            </div>
        );
    }
}
