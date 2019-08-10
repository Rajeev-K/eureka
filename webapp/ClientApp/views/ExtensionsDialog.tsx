import { DialogBase } from "./DialogBase";

export class ExtensionsDialog extends DialogBase {
    constructor() {
        super();
    }

    protected render(): void {
        this.el.appendChild(
            <div className="extensions-dialog">
                <div className="dialog-row">
                </div>
                {this.renderButtonPanel()}
            </div>
        );
        super.render();
    }

    protected init(): void {
        super.init();
    }

    protected onOK(): void {
        super.onOK();
    }
}
