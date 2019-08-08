
const MaxExtLen = 4;

function isValidExtension(ext: string): boolean {
    if (ext.length < 1 || ext.length > MaxExtLen)
        return false;
    if (ext.match(/^[0-9]+$/))   // all digits?
        return false;
    return true;
}

/**
 * Gets filename extension such as .java or .tsx
 * Allows multi-segmented extensions such as .d.ts unless oneSegmentOnly is set to true.
 * Returns null if path is null. Returns empty string if path has no extension.
 */
export function getFilenameExtension(path: string, oneSegmentOnly?: boolean): string {
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
        if (!oneSegmentOnly && parts.length > 2) {
            const ext2 = parts[parts.length - 2];
            if (isValidExtension(ext2)) {
                ext = ext2 + '.' + ext;
            }
        }
    }
    return ext ? ('.' + ext) : ext;
}

const extensionMap = {
    ".txt":     "plaintext",
    ".json":    "json",
    ".cmd":     "bat",
    ".c":       "c",
    ".h":       "c",
    ".cpp":     "cpp",
    ".hpp":     "cpp",
    ".cs":      "csharp",
    ".css":     "css",
    ".go":      "go",
    ".html":    "html",
    ".xhtml":   "html",
    ".jsp":     "html",
    ".asp":     "html",
    ".aspx":    "html",
    ".java":    "java",
    ".js":      "javascript",
    ".jsx":     "javascript",
    ".less":    "less",
    ".lua":     "lua",
    ".md":      "markdown",
    ".m":       "objective-c",
    ".php":     "php",
    ".ps1":     "powershell",
    ".py":      "python",
    ".cshtml":  "razor",
    ".rb":      "ruby",
    ".rs":      "rust",
    ".scss":    "scss",
    ".sql":     "sql",
    ".swift":   "swift",
    ".ts":      "typescript",
    ".tsx":     "typescript",
    ".xml":     "xml",
    ".yml":     "yaml",
    ".yaml":    "yaml",
    ".clj":     "clojure",
    ".sh":      "shell",
    ".pl":      "perl"
};

export function getLanguageFromPath(path: string): string {
    if (!path)
        return "plaintext";
    const extensions = Object.keys(extensionMap);
    for (const extension of extensions) {
        if (path.endsWith(extension))
            return extensionMap[extension];
    }
    return "plaintext";
}
