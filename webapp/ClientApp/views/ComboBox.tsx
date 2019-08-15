// Copyright (c) 2019-present, Rajeev-K.

import { addClassExclusively, concatClasses, isVisible, getOffset } from "./ViewUtils";
import { KeyCodes } from "./KeyCodes";

export interface ComboBoxProps extends UIBuilder.Props<ComboBox> {
    value?: string;
    prompt?: string;
    placeholder?: string;
    className?: string;
    suggestions?: any[];
}

export class ComboBox extends UIBuilder.Component<ComboBoxProps> {
    private root: HTMLElement;
    private textInput: HTMLInputElement;
    private dropDown: HTMLElement;
    private outerRect: HTMLElement;
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
    }

    private populateDropDown(filter: string): void {
        if (this.filter === filter) {
            return;
        }
        this.dropDown.innerHTML = '';
        if (this.suggestions) {
            let count = 0;
            const f = filter.toLowerCase();
            for (const item of this.suggestions) {
                const itemStr = item.toString();
                if (itemStr.toLowerCase().indexOf(f) != -1) {
                    const itemElement = <div className="combo-dropdown-item">{itemStr}</div>;
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
            delete this.filter;
            this.textInput.blur();
            setTimeout(() => {
                this.populateDropDown('');
                this.textInput.focus();
            }, 0);
        }
    }

    private onDropDownMouseDown(ev: MouseEvent): void {
        const element = ev.target as HTMLElement;
        if (element.classList.contains('combo-dropdown-item')) {
            this.onItemSelected(element);
            setTimeout(() => this.textInput.focus(), 0);
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

            const event = new CustomEvent('itemselected', { detail: this.value });
            this.root.dispatchEvent(event);
        }
    }

    private onTextBoxKeyDown(ev: KeyboardEvent): void {
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
                    addClassExclusively(items[newIndex], 'combo-highlighted');
                    this.scrollSelectedItemIntoView();
                }
                else {
                    delete this.filter;
                    this.populateDropDown('');
                }
                ev.preventDefault();
                break;
            case KeyCodes.Tab:
            case KeyCodes.Enter:
                let selected = this.dropDown.querySelector('.combo-highlighted') as HTMLElement;
                if (selected) {
                    this.onItemSelected(selected);
                    this.filter = selected.innerText;
                }
                ev.stopPropagation();
                break;
        }
    }

    private onTextBoxKeyUp(ev: KeyboardEvent): void {
        if (ev.which !== KeyCodes.DownArrow && ev.which !== KeyCodes.UpArrow && ev.which !== KeyCodes.Escape) {
            this.value = this.textInput.value;
            this.populateDropDown(this.value);
        }
    }

    private onTextBoxFocus(ev: FocusEvent): void {
        this.outerRect.classList.add('combo-focus-style');
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
                        defaultValue={val} />
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
