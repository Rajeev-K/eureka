// Copyright (c) 2019-present, Rajeev-K.

import { Mouse } from "./ViewUtils";
import { concatClasses } from "./ViewUtils";

/**
 * Children must be set to boxSizing = borderBox, and should not have margins.
 */
export interface SplitterControlProps extends UIBuilder.Props<SplitterControl> {
    className?: string;
    firstChild: HTMLElement;
    secondChild: HTMLElement;
    onSplitterMoved?: () => void;
}

export class SplitterControl extends UIBuilder.Component<SplitterControlProps> {
    private root: HTMLElement;
    private divider: HTMLElement;
    private firstChild: HTMLElement;
    private secondChild: HTMLElement;
    private dividerGhost: HTMLElement;

    constructor(props: SplitterControlProps) {
        super(props);
        this.firstChild = props.firstChild;
        this.secondChild = props.secondChild;
    }

    private availableHeight(): number {
        return this.root.clientHeight - this.divider.offsetHeight;
    }

    public layout(): void {
        const firstChildHeight = this.availableHeight() / 2;
        this.firstChild.style.height = firstChildHeight + 'px';
        this.makeSecondChildFillRemainingHeight();
    }

    private makeSecondChildFillRemainingHeight(): void {
        const firstChildHeight = this.firstChild.offsetHeight;
        const secondChildHeight = this.availableHeight() - firstChildHeight;
        this.secondChild.style.height = secondChildHeight + 'px';
    }

    private addDividerGhost(): void {
        const top = this.divider.getBoundingClientRect().top + window.pageYOffset;
        this.dividerGhost = <div className="splitter-divider splitter-divider-ghost"></div> as HTMLElement;
        this.dividerGhost.style.left = "0px";
        this.dividerGhost.style.top = top + "px";
        document.body.appendChild(this.dividerGhost);
    }

    private onMouseDown(e: MouseEvent): void {
        e.preventDefault();
        this.addDividerGhost();
        const firstChildHeight = parseInt(this.firstChild.style.height, 10);
        const availableHeight = this.availableHeight();
        let dist: number;
        Mouse.setCapture(e, ev => {
            dist = ev.clientY - Mouse.getMouseDownY();
            if (-dist > firstChildHeight)
                dist = -firstChildHeight;
            if (firstChildHeight + dist > availableHeight)
                dist = availableHeight - firstChildHeight;
            this.dividerGhost.style.marginTop = dist + "px";
        }, ev => {
            const newFirstChildHeight = firstChildHeight + dist;
            this.firstChild.style.height = newFirstChildHeight + 'px';
            this.makeSecondChildFillRemainingHeight();
            if (this.dividerGhost) {
                this.dividerGhost.remove();
                this.dividerGhost = null;
            }
            if (this.props.onSplitterMoved) {
                window.setTimeout(() => this.props.onSplitterMoved());
            }
        });
    }

    public render(): JSX.Element {
        const classNames = concatClasses("splitter-control", this.props.className);
        return (
            <div className={classNames} ref={el => this.root = el}>
                {this.firstChild}
                <div className="splitter-divider" ref={el => this.divider = el} onMouseDown={ev => this.onMouseDown(ev)}>
                    <div className="splitter-handle"></div>
                </div>
                {this.secondChild}
            </div>
        );
    }
}
