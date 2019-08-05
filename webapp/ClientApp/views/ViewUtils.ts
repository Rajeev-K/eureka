// Copyright (c) 2019-present, Rajeev-K.

export class Mouse {
    private static dragHandler: (ev: MouseEvent) => void;
    private static upHandler: (ev: MouseEvent) => void;
    private static mouseDownX: number;
    private static mouseDownY: number;

    public static setCapture(ev: MouseEvent, dragHandler_: (ev: MouseEvent) => void, upHandler_: (ev: MouseEvent) => void): void {
        Mouse.dragHandler = dragHandler_;
        Mouse.upHandler = upHandler_;

        Mouse.mouseDownX = ev.pageX;
        Mouse.mouseDownY = ev.pageY;

        document.addEventListener("mouseup", Mouse.onMouseUp);
        document.addEventListener("mousemove", Mouse.onMouseDrag);
    }

    public static releaseCapture() {
        Mouse.dragHandler = null;
        Mouse.upHandler = null;

        document.removeEventListener("mouseup", Mouse.onMouseUp);
        document.removeEventListener("mousemove", Mouse.onMouseDrag);
    }

    private static onMouseDrag(ev: MouseEvent): void {
        if (typeof Mouse.dragHandler === 'function') {
            Mouse.dragHandler(ev);
        }
    }

    private static onMouseUp(ev: MouseEvent): void {
        if (typeof Mouse.upHandler === 'function') {
            Mouse.upHandler(ev);
        }
        Mouse.releaseCapture();
    }

    public static getMouseDownX(): number {
        return Mouse.mouseDownX;
    }

    public static getMouseDownY(): number {
        return Mouse.mouseDownY;
    }
}

/**
 * Add a class to supplied element, while removing the class from its peers.
 * @param el
 * @param className
 * @param peers peer elements; if not supplied siblings of supplied element will be the peers
 */
export function addClassExclusively(el: Element, className: string, peers?: Element[]): void {
    if (!peers)
        peers = Array.from(el.parentNode.children);
    peers.forEach(function (child: HTMLElement) {
        if (child === el)
            child.classList.add(className);
        else
            child.classList.remove(className);
    });
}
