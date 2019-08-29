// Copyright (c) 2019-present, Rajeev-K.

export interface Filter {
    extensions?: string[];
    include?: string[];
    exclude?: string[];
}

export interface FilterControlProps {
    extensions?: string[];
    onFilterChanged?: (filter: Filter) => void;
}

export class FilterControl extends UIBuilder.Component<FilterControlProps> {
    private root: HTMLElement;
    private includeInput: HTMLInputElement;
    private excludeInput: HTMLInputElement;
    private timeoutId: number;

    constructor(props: FilterControlProps) {
        super(props);
    }

    private fireFilterChangedEvent(): void {
        if (!this.props.onFilterChanged)
            return;

        const checkBoxes = Array.from(this.root.querySelectorAll("input"));
        let selectedExtensions = checkBoxes.filter(cb => cb.checked).map(cb => cb.dataset.ext);
        if (selectedExtensions.length === 0)
            selectedExtensions = null;

        let filter: Filter = {
            extensions: selectedExtensions,
            include: this.includeInput.value.split(',').map(s => s.trim()).filter(s => s),
            exclude: this.excludeInput.value.split(',').map(s => s.trim()).filter(s => s)
        };
        if (!filter.extensions && filter.include.length === 0 && filter.exclude.length === 0)
            filter = null;

        this.props.onFilterChanged(filter);
    }

    private onChange(ev: Event): void {
        if ((ev.target as HTMLInputElement).type === "text") {
            // We'll let onInput handle this.
            return;
        }
        this.fireFilterChangedEvent();
    }

    private onInput(ev: Event): void {
        if ((ev.target as HTMLInputElement).type === "checkbox") {
            // We'll let onChange handle this.
            return;
        }
        if (this.timeoutId)
            window.clearTimeout(this.timeoutId);
        this.timeoutId = window.setTimeout(() => this.fireFilterChangedEvent(), 500);
    }

    public render(): JSX.Element {
        let i = 0;
        const checkboxes = this.props.extensions.map(ext => {
            const id = `filter-ext-${++i}`;
            return (
                <div className="ext-checkbox">
                    <input type="checkbox" id={id} data-ext={ext} />
                    <label for={id}>{ext}</label>
                </div>
            );
        });
        return (
            <div className="filter-control" onChange={(ev) => this.onChange(ev)}
                                onInput={ev => this.onInput(ev)} ref={el => this.root = el}>
                <div className="textinput-row">
                    <div className="filter-input">
                        <div className="filter-label">Only show paths that contain:</div>
                        <div><input type="text" spellcheck={false}
                                    placeholder="Enter comma-separated list" ref={el => this.includeInput = el} /></div>
                    </div>
                    <div className="filter-input">
                        <div className="filter-label">Exclude paths that contain: </div>
                        <div><input type="text" spellcheck={false}
                                    placeholder="Enter comma-separated list" ref={el => this.excludeInput = el} /></div>
                    </div>
                </div>
                <div className="checkbox-row">{checkboxes}</div>
            </div>
        );
    }
}
