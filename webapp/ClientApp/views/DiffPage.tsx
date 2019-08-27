// Copyright (c) 2019-present, Rajeev-K.

import { CommonHeader } from "./CommonHeader";
import { SplitterControl } from "./SplitterControl";
import { addClassExclusively } from "./ViewUtils";
import { LoadingAnimation } from "./Icons";
import * as Utils from "../Utils";

export interface DiffPageProps extends UIBuilder.Props<DiffPage> {
    path?: string;
}

export class DiffPage extends UIBuilder.Component<DiffPageProps> {
    private root: HTMLElement;
    private errorDisplay: HTMLElement;
    private diffDisplay: HTMLElement;
    private diffEditor: monaco.IDiffEditor;
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

    public displayDiff(text1: string, text2: string): void {
        this.removeLoadingAnimation();
        this.diffDisplay.innerHTML = '';
        require(['vs/editor/editor.main'], monaco => {
            const modifiedModel = monaco.editor.createModel(text1, "text/plain");
            const originalModel = monaco.editor.createModel(text2, "text/plain");

            this.diffEditor = monaco.editor.createDiffEditor(this.diffDisplay);
            this.diffEditor.setModel({
	            original: originalModel,
	            modified: modifiedModel
            });
            this.diffEditor.focus();
        });
    }

    public render(): JSX.Element {
        return (
            <div className="diff-page" ref={el => this.root = el}>
                <div className="error-message" ref={el => this.errorDisplay = el}></div>
                <div className="diff-display" ref={el => this.diffDisplay = el}></div>
                <LoadingAnimation ref={el => this.loadingAnimation = el} />
            </div>
        )
    }

    public onWindowResize(): void {
        if (this.diffEditor)
            this.diffEditor.layout();
    }
}
