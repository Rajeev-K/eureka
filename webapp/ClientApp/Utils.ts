
const MaxExtLen = 4;

function isValidExtension(ext: string): boolean {
    if (ext.length < 1 || ext.length > MaxExtLen)
        return false;
    if (ext.match(/^[0-9]+$/))   // all digits?
        return false;
    return true;
}

export function getFilenameExtension(path: string): string {
    if (!path)
        return null;
    const elements = path.split('/');
    const filename = elements[elements.length - 1].toLowerCase();
    const parts = filename.split('.');
    if (parts.length === 1)
        return '';
    let ext = '';
    const ext1 = parts[parts.length - 1];
    if (isValidExtension(ext1)) {
        ext = ext1;
        if (parts.length > 2) {
            const ext2 = parts[parts.length - 2];
            if (isValidExtension(ext2)) {
                ext = ext2 + '.' + ext;
            }
        }
    }
    return ext ? ('.' + ext) : ext;
}
