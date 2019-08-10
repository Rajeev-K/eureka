import * as ViewUtils from "./ViewUtils";

/** Base class for modal dialogs. */
export class DialogBase {
    protected el: HTMLElement;
    private mask: HTMLElement;
    private okButton: HTMLElement;
    private cancelButton: HTMLElement;
    private closeButton: HTMLElement;
    private resolve: (result: any) => void;
    private reject: (error: any) => void;

    private renderRootElement(): void {
        if (!this.mask) {
            this.mask = <div class="dialog-mask"></div> as HTMLElement;
            document.body.appendChild(this.mask);
        }
        if (!this.el) {
            this.el = <div class="dialog"></div> as HTMLElement;
            this.mask.appendChild(this.el);
        }
    }

    private removeRootElement(): void {
        this.el.remove();
        this.mask.remove();
    }

    /**
     * Render the contents of the dialog. Subclasses should override this method.
     * Note: After the dialog elements have been added to the DOM you must call the super.render().
     */
    protected render(): void {
        this.init();
    }

    protected init(): void {
        this.okButton = this.el.querySelector(".ok-button");
        this.cancelButton = this.el.querySelector(".cancel-button");
        this.closeButton = this.el.querySelector(".close-button");
        this.centerDialog();
        this.addEventListeners();
        window.setTimeout(() => this.setInitialFocus(), 0);
    }

    protected addEventListeners(): void {
        if (this.okButton)
            this.okButton.addEventListener('click', () => this.onOK());
        if (this.cancelButton)
            this.cancelButton.addEventListener('click', () => this.onCancel());
        if (this.closeButton)
            this.closeButton.addEventListener('click', () => this.onCancel());
        this.el.addEventListener('keydown', ev => this.onKeyDown(ev));
    }

    protected onKeyDown(ev: KeyboardEvent): void {
        switch (ev.key) {
            case "Enter":
                if ((ev.target as HTMLElement).tagName === 'TEXTAREA')
                    break;
                this.onEnterKeyPressed();
                ev.preventDefault();
                break;
            case "Escape":
                if (ViewUtils.isVisible(this.cancelButton)) {
                    this.onEscapeKeyPressed();
                }
                ev.preventDefault();
                break;
            case "Tab":
                if (!this.onTabKeyPressed(ev)) {
                    ev.preventDefault();
                }
                break;
        }
    }

    /** Handles enter key. May be overridden to change default behavior. */
    protected onEnterKeyPressed(): void {
        this.onOK();
    }

    /** Handles escape key. May be overridden to change default behavior. */
    protected onEscapeKeyPressed(): void {
        this.onCancel();
    }

    private centerDialog(): void {
        let top = (window.innerHeight - this.el.offsetHeight) / 3;
        let left = (window.innerWidth - this.el.offsetWidth) / 2;
        top = Math.max(0, top);
        left = Math.max(0, left);
        this.el.style.top = top + 'px';
        this.el.style.left = left + 'px';
    }

    protected setInitialFocus(): void {
        const focusables = ViewUtils.focusableChildren(this.el);
        console.log(focusables);
        if (focusables.length > 0)
            focusables[0].focus();
    }

    /** Handles tab key. Returns true if default action should be allowed. */
    private onTabKeyPressed(ev: KeyboardEvent): boolean {
        const focusables = ViewUtils.focusableChildren(this.el);
        if (focusables.length < 2)
            return true;
        if (ev.target === focusables[focusables.length - 1] && !ev.shiftKey) {
            focusables[0].focus();
            return false;
        }
        else if (ev.target === focusables[0] && ev.shiftKey) {
            focusables[focusables.length - 1].focus();
            return false;
        }
        return true;
    }

    /**
     * Displays the dialog.
     * You can call showDialog() multiple times on an instance of Dialog and it will only be displayed once.
     */
    public showDialog(): Promise<any> {
        document.body.classList.add('no-scroll');
        this.renderRootElement();
        this.render();
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    protected closeDialog(): void {
        this.removeRootElement();
        document.body.classList.remove('no-scroll');
    }

    protected onCancel(): void {
        this.closeDialog();
        this.reject({ dialogCancelled: true });
    }

    /** Handles OK button. Override this method and get user input, then call this base class method. */
    protected onOK(): void {
        this.closeDialog();
        this.resolve({});
    }

    protected renderDefaultButtonPanel(labels?: {okButtonLabel?: string, cancelButtonLabel?: string}): JSX.Element {
        if (!labels)
            labels = {};
        if (!labels.okButtonLabel)
            labels.okButtonLabel = "OK";
        if (!labels.cancelButtonLabel)
            labels.cancelButtonLabel = "Cancel";
        return (
            <div className="dialog-button-panel">
                <button type="button" className="ok-button default-button">{labels.okButtonLabel}</button>
                <button type="button" className="cancel-button">{labels.cancelButtonLabel}</button>
            </div>
        );
    }
}
