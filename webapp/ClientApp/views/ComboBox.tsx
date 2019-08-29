// Copyright (c) 2019-present, Rajeev-K.

import { addClassExclusively, concatClasses, isVisible, getOffset } from "./ViewUtils";
import { KeyCodes } from "./KeyCodes";

export interface ComboBoxProps extends UIBuilder.Props<ComboBox> {
    /** The current value displayed by the ComboBox */
    value?: any;
    /** The label displayed above the ComboBox */
    prompt?: string;
    /** The watermark to display */
    placeholder?: string;
    /** Additional CSS class names */
    className?: string;
    /** Items to display in the dropdown */
    suggestions?: any[];
    /** If constrained then the value typed in by the user must match one of the suggestions. */
    constrain?: boolean;
    /** Method to call when user edits text in the text input. */
    onTextEdited?: (text: string) => void;
    /** Method to call when an item is selected */
    onItemSelected?: (item: any) => void;
    getItemIcon?: (item: any) => JSX.Element;
}

export class ComboBox extends UIBuilder.Component<ComboBoxProps> {
    private root: HTMLElement;
    private textInput: HTMLInputElement;
    private dropDown: HTMLElement;
    private outerRect: HTMLElement;
    private prevText: string;   // Text input value when keydown event is received
    private filter: string;
    private value: any;
    private suggestions: any[];
    private whenScrolled = 0;

    constructor(props) {
        super(props);
        this.suggestions = this.props.suggestions;
    }

    public setText(text: string): void {
        this.textInput.value = text;
    }

    public getText(): string {
        return this.textInput.value;
    }

    public getValue(): any {
        return this.value;
    }

    public setValue(value: any): void {
        this.value = value;
        this.setText(this.value.toString());
    }

    public setPlaceholder(placeholder: string): void {
        this.textInput.placeholder = placeholder;
    }

    public setSuggestions(suggestions: any[]): void {
        this.suggestions = suggestions;
        const chevron = this.root.querySelector(".combo-chevron") as HTMLElement;
        chevron.style.visibility = (suggestions && suggestions.length) ? "visible" : "hidden";
    }

    private getItemIcon(item: any): JSX.Element {
        if (this.props.getItemIcon)
            return this.props.getItemIcon(item);
        else
            return null;
    }

    private populateDropDown(filter: string): void {
        if (this.filter === filter) {
            return;   // Don't open dropdown if filter hasn't changed.
        }
        this.dropDown.innerHTML = '';
        if (this.suggestions) {
            let count = 0;
            const f = filter.toLowerCase();
            for (const item of this.suggestions) {
                const itemStr = item.toString();
                if (itemStr.toLowerCase().indexOf(f) !== -1) {
                    const icon = this.getItemIcon(item);
                    const itemElement = <div className="combo-dropdown-item">{icon}{itemStr}</div>;
                    itemElement.dataset.val = item;
                    this.dropDown.appendChild(itemElement);
                    ++count;
                }
            }
            if (count)
                this.showDropDown();
            else
                this.hideDropDown();
            this.filter = filter;
        }
    }

    private hideDropDown(): void {
        this.dropDown.style.display = "none";
    }

    private showDropDown(): void {
        this.dropDown.style.display = null;
        this.dropDown.style.minWidth = this.outerRect.offsetWidth + 'px';
        this.dropDown.scrollTop = 0;
    }

    private isDropDownVisible() {
        return isVisible(this.dropDown);
    }

    private onChevronMouseDown(ev: MouseEvent): void {
        if (this.isDropDownVisible()) {
            this.hideDropDown();
        }
        else {
            this.filter = null;
            this.textInput.blur();
            setTimeout(() => {
                this.populateDropDown('');
                this.textInput.focus();
            });
        }
    }

    private onDropDownMouseDown(ev: MouseEvent): void {
        const element = ev.target as HTMLElement;
        if (element.classList.contains('combo-dropdown-item')) {
            this.onItemSelected(element);
            setTimeout(() => this.textInput.focus());
        }
    }

    private onDropDownBlur(ev: FocusEvent): void {
        if (document.activeElement !== this.textInput)
            this.hideDropDown();
    }

    private onDropDownMouseOver(ev: MouseEvent): void {
        if ((new Date()).getTime() < this.whenScrolled + 250) {
            // We automatically get a hover event when we scroll, ignore it in order to keep our current highlight.
            return;
        }
        const element = ev.target as HTMLElement;
        if (element.classList.contains('combo-dropdown-item')) {
            addClassExclusively(element, 'combo-highlighted');
        }
    }

    private scrollSelectedItemIntoView() {
        const first = this.dropDown.querySelector('.combo-dropdown-item') as HTMLElement;
        const item = this.dropDown.querySelector('.combo-highlighted') as HTMLElement;
        const itemTop = getOffset(item).top;
        const itemBottom = itemTop + item.offsetHeight;
        const dropdownTop = getOffset(this.dropDown).top;
        const dropdownBottom = dropdownTop + this.dropDown.offsetHeight;
        if (itemTop < dropdownTop) {
            this.dropDown.scrollTop = itemTop - getOffset(first).top;
            this.whenScrolled = (new Date()).getTime();
        }
        else if (itemBottom > dropdownBottom) {
            this.dropDown.scrollTop = itemBottom - getOffset(first).top - this.dropDown.offsetHeight;
            this.whenScrolled = (new Date()).getTime();
        }
    }

    private onItemSelected(item: HTMLElement): void {
        this.hideDropDown();
        if (item) {
            this.value = item.dataset.val;
            this.textInput.value = this.value.toString();
            this.onValueSelected(this.value);
        }
    }

    private onValueSelected(value: any): void {
        if (this.props.onItemSelected)
            this.props.onItemSelected(value);
        const event = new CustomEvent('itemselected', { detail: value });
        this.root.dispatchEvent(event);
    }

    private onTextBoxKeyDown(ev: KeyboardEvent): void {
        this.prevText = this.textInput.value;
        switch (ev.which) {
            case KeyCodes.Escape:
                this.hideDropDown();
                break;
            case KeyCodes.UpArrow:
            case KeyCodes.DownArrow:
                if (this.isDropDownVisible()) {
                    const items = Array.from(this.dropDown.querySelectorAll('.combo-dropdown-item'));
                    const highlighted = this.dropDown.querySelector('.combo-highlighted');
                    const index = items.indexOf(highlighted);
                    let newIndex: number;
                    if (ev.which == KeyCodes.UpArrow)
                        newIndex = (index === -1 || index === 0) ? items.length - 1 : index - 1;
                    else
                        newIndex = (index === -1 || index === items.length - 1) ? 0 : index + 1;
                    const item = items[newIndex] as HTMLElement;
                    this.value = item.dataset.val;
                    this.textInput.value = this.value.toString();
                    addClassExclusively(item, 'combo-highlighted');
                    this.scrollSelectedItemIntoView();
                }
                else {
                    this.filter = null;
                    this.populateDropDown('');
                }
                ev.preventDefault();
                break;
            case KeyCodes.Tab:
            case KeyCodes.Enter:
                if (this.isDropDownVisible()) {
                    let selected = this.dropDown.querySelector('.combo-highlighted') as HTMLElement;
                    if (selected) {
                        this.onItemSelected(selected);
                        this.filter = selected.innerText;
                        ev.stopPropagation();
                        break;
                    }
                }
                if (this.props.constrain) {
                    const value = this.textInput.value.toLowerCase();
                    if (this.suggestions) {
                        const matchingItem = this.suggestions.find(s => s && s.toString().toLowerCase() === value);
                        if (matchingItem) {
                            this.onValueSelected(matchingItem);
                        }
                    }
                }
                else {
                    // If not constrained the result does not have to match one of the displayed choices.
                    this.onValueSelected(this.textInput.value);
                }
                ev.stopPropagation();
                break;
        }
    }

    private onTextBoxKeyUp(ev: KeyboardEvent): void {
        const newText = this.textInput.value;
        if (ev.which !== KeyCodes.DownArrow && ev.which !== KeyCodes.UpArrow && newText !== this.prevText) {
            this.value = newText;
            this.populateDropDown(this.value);
        }
    }

    private onTextBoxFocus(ev: FocusEvent): void {
        this.outerRect.classList.add('combo-focus-style');
    }

    private onTextBoxInput(): void {
        if (this.props.onTextEdited) {
            this.props.onTextEdited(this.textInput.value);
        }
    }

    private onTextBoxBlur(ev: FocusEvent): void {
        this.outerRect.classList.remove('combo-focus-style');
        if (document.activeElement !== this.dropDown)
            this.hideDropDown();
    }

    public render(): JSX.Element {
        const val = this.props.value ? this.props.value.toString() : '';
        const classes = concatClasses("combo-box", this.props.className);
        const chevronStyle = { visibility: this.suggestions && this.suggestions.length ? 'visible' : 'hidden' };
        return (
            <div className={classes} ref={el => this.root = el}>
                {!!this.props.prompt && <div className="combo-prompt">{this.props.prompt}</div>}
                <div className="combo-rect" ref={el => this.outerRect = el}>
                    <input type="text" className="combo-textbox"ref={el => this.textInput = el}
                        placeholder={this.props.placeholder} spellcheck={false}
                        onKeyDown={ev => this.onTextBoxKeyDown(ev)} onKeyUp={ev => this.onTextBoxKeyUp(ev)}
                        onFocus={ev => this.onTextBoxFocus(ev)} onBlur={ev => this.onTextBoxBlur(ev)}
                        onInput={ev => this.onTextBoxInput()} defaultValue={val} />
                    <div className="combo-chevron" style={chevronStyle} onMouseDown={ev => this.onChevronMouseDown(ev)}>
                       <i className="fa fa-chevron-down"></i>
                    </div>
                </div>
                <div className="combo-dropdown" style={{ display: "none" }}
                    ref={el => this.dropDown = el} onMouseDown={ev => this.onDropDownMouseDown(ev)}
                    onMouseOver={ev => this.onDropDownMouseOver(ev)} onBlur={ev => this.onDropDownBlur(ev)}>
                </div>
            </div>
        );
    }
}
