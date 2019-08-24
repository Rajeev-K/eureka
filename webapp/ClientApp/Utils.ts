
const MaxExtLen = 5;

function isValidExtension(ext: string): boolean {
    if (ext.length < 1 || ext.length > MaxExtLen)
        return false;
    if (ext.match(/^[0-9]+$/))   // all digits?
        return false;
    return true;
}

/**
 * Gets filename extension such as .java or .tsx
 * Returns null if path is null. Returns empty string if path has no extension.
 */
export function getFilenameExtension(path: string): string {
    if (!path)
        return null;
    const lastSlashIndex = path.lastIndexOf('/');
    const filename = lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);
    const dotIndex = filename.lastIndexOf('.');
    const ext = dotIndex === -1 ? '' : filename.substring(dotIndex + 1);
    return isValidExtension(ext) ? '.' + ext : '';
}

const extensionMap = {
    ".txt":     "plaintext",
    ".json":    "json",
    ".cmd":     "bat",
    ".c":       "c",
    ".h":       "c",
    ".cc":      "cpp",
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

export function getFolderFromFilePath(path: string): string {
    const parts = path.split('/');
    return parts.slice(0, parts.length - 1).join('/');
}
