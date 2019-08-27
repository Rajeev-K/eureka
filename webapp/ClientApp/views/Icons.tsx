
export function InfoIcon(): JSX.Element {
    return <i class="info-icon fas fa-info-circle"></i>;
}

export class LoadingAnimation extends UIBuilder.Component<any> {
    private root: HTMLElement;

    public render(): JSX.Element {
        return (
            <div class="loading-animation" ref={el => this.root = el}>
                <i class="fas fa-sync-alt fa-spin"></i>
            </div>
        );
    }

    public remove(): void {
        this.root.remove();
    }
}
