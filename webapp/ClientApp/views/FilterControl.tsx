// Copyright (c) 2019-present, Rajeev-K.

export interface FilterControlProps {
    extensions?: string[];
    onFilterChanged?: (extensions: string[]) => void;
}

export class FilterControl extends UIBuilder.Component<FilterControlProps> {
    private root: HTMLElement;

    constructor(props: FilterControlProps) {
        super(props);
    }

    private onChange(ev): void {
        const checkBoxes = Array.from(this.root.querySelectorAll("input"));
        let selectedExtensions = checkBoxes.filter(cb => cb.checked).map(cb => cb.dataset.ext);
        if (selectedExtensions.length === 0)
            selectedExtensions = null;
        if (this.props.onFilterChanged)
            this.props.onFilterChanged(selectedExtensions);
    }

    public render(): JSX.Element {
        let i = 0;
        const controls = this.props.extensions.map(ext => {
            const id = `filter-ext-${++i}`;
            return (
                <div className="ext-checkbox">
                    <input type="checkbox" id={id} data-ext={ext} />
                    <label for={id}>{ext}</label>
                </div>
            );
        });
        return (
            <div className="filter-control" onChange={ev => this.onChange(ev)} ref={el => this.root = el}>
                {controls}
            </div>
        );
    }
}
