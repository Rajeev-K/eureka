// Copyright (c) 2019-present, Rajeev-K.

package eureka;

public class IndexRequest {
    private String path;
    private String[] indexableExtensions;
    private String[] skippableFolders;

    public IndexRequest() {
        this.path = null;
        this.indexableExtensions = null;
        this.skippableFolders = null;
    }

    public String getPath() {
        return this.path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }

    public String[] getIndexableExtensions() {
        return this.indexableExtensions;
    }
    
    public void setIndexableExtensions(String[] indexableExtensions) {
        this.indexableExtensions = indexableExtensions;
    }

    public String[] getSkippableFolders() {
        return this.skippableFolders;
    }

    public void setSkippableFolders(String[] skippableFolders) {
        this.skippableFolders = skippableFolders;
    }
}
