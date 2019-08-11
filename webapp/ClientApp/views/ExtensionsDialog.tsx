import { DialogBase } from "./DialogBase";
import { MessageBox } from "./MessageBox";

export class ExtensionsDialog extends DialogBase {
    public extensions: string[];
    private listEditor: HTMLTextAreaElement;

    constructor() {
        super();
    }

    protected render(): void {
        this.el.appendChild(
            <div className="extensions-dialog">
                <div className="extensions-prompt">Enter extensions separated by commas:</div>
                <textarea spellcheck={false} ref={el => this.listEditor = el}></textarea>
                {this.renderButtonPanel()}
            </div>
        );
        super.render();
    }

    protected init(): void {
        super.init();
        this.listEditor.value = this.extensions.join(', ');
    }

    protected onOK(): void {
        const extensions = this.listEditor.value.split(',').map(s => s.trim()).filter(s => s);
        if (extensions.length === 0) {
            MessageBox.show("Specify one or more extensions then press OK");
            return;
        }
        this.extensions = extensions.map(e => e[0] === '.' ? e : '.' + e);
        super.onOK();
    }
}
