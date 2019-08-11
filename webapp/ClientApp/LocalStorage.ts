/** Save value in local storage. */
export function set(key: string, value: any): void {
    try {
        if (window.localStorage) {
            const json = JSON.stringify(value);
            window.localStorage.setItem(key, json);
        }
    }
    catch (ex) {
        console.log(ex);
    }
}

/** Load value from local storage. */
export function get(key: string): any {
    try {
        if (window.localStorage) {
            const json = window.localStorage.getItem(key);
            if (json)
                return JSON.parse(json);
        }
    }
    catch (ex) {
        console.log(ex);
    }
    return null;
}

/** Remove token from storage. */
export function remove(key: string): void {
    try {
        if (window.localStorage) {
            window.localStorage.removeItem(key);
        }
    }
    catch (ex) {
        console.log(ex);
    }
    return null;
}
