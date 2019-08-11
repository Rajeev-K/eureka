import { DialogBase } from "./DialogBase";
import { MessageBox } from "./MessageBox";

export class FoldersDialog extends DialogBase {
    public folders: string[];
    private listEditor: HTMLTextAreaElement;

    constructor() {
        super();
    }

    protected render(): void {
        this.el.appendChild(
            <div className="folders-dialog">
                <div className="folders-prompt">Enter folders separated by commas:</div>
                <textarea spellcheck={false} ref={el => this.listEditor = el}></textarea>
                {this.renderButtonPanel()}
            </div>
        );
        super.render();
    }

    protected init(): void {
        super.init();
        this.listEditor.value = this.folders.join(', ');
    }

    protected onOK(): void {
        const folders = this.listEditor.value.split(',').map(s => s.trim()).filter(s => s);
        this.folders = folders.map(e => e[0] === '/' ? e : '/' + e);
        super.onOK();
    }
}
