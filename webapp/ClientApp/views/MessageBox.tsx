import { DialogBase } from "./DialogBase";

export class MessageBox extends DialogBase {
    public message: string;
    private options: MessageBoxOptions;

    constructor(options: MessageBoxOptions) {
        super();
        this.options = { ...DefaultMessageBoxOptions, ...options };
    }

    protected render(): void {
        let cancelButton: JSX.Element;
        if (!this.options.hideCancelButton)
            cancelButton = <button type="button" className="cancel-button">{this.options.cancelButtonLabel}</button>;
        const element = (
            <div className="message-box">
                <div className="message-box-message">{this.message}</div>
                <div className="dialog-button-panel">
                    <button type="button" className="ok-button default-button">{this.options.okButtonLabel}</button>
                    {cancelButton}
                </div>
            </div>
        );
        this.el.appendChild(element);
        super.render();
    }

    protected init(): void {
        // Call base class method to complete initialization.
        super.init();
    }

    /** Static method for displaying a simple message. */
    public static show(message: string): Promise<any> {
        const mb = new MessageBox({ hideCancelButton: true });
        mb.message = message;
        return mb.showDialog();
    }

    /** Static method for displaying a confirmation message, with OK/Cancel buttons. */
    public static confirm(message: string): Promise<any> {
        const mb = new MessageBox({});
        mb.message = message;
        return mb.showDialog();
    }

    /** Static method for asking the user a yes/no question. OK/Cancel buttons are relabeled to Yes/No. */
    public static ask(message: string): Promise<any> {
        const mb = new MessageBox({ okButtonLabel: "Yes", cancelButtonLabel: "No" });
        mb.message = message;
        return mb.showDialog();
    }
}

export interface MessageBoxOptions {
    hideCancelButton?: boolean;
    okButtonLabel?: string;
    cancelButtonLabel?: string;
}

const DefaultMessageBoxOptions: MessageBoxOptions = {
    hideCancelButton: false,
    okButtonLabel: 'OK',
    cancelButtonLabel: 'Cancel'
};
