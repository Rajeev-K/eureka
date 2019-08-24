declare namespace monaco {
    export interface IEditor {
        layout(): void;
        focus();
    }

    export interface IDiffEditor {
        layout(): void;
        focus();
        setModel({ original: any, modified: any });
    }
}
