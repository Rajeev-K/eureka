declare namespace JSX {
    type Element = HTMLElement | SVGAElement;
}
declare namespace UIBuilder {
    const Fragment = "--fragment--";
    class Component<P> {
        protected props: P;
        constructor(props: P);
        render(): JSX.Element;
    }
    interface Props<T> {
        children?: any;
        ref?: (instance: T) => void;
    }
    function createElement<P extends UIBuilder.Props<Component<P>>>(type: any, props: P, ...children: any[]): JSX.Element | JSX.Element[];
}
declare namespace UIBuilder {
    function clone<T>(obj: T): T;
}
