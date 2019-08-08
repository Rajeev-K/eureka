// Copyright (c) 2019-present, Rajeev-K.

package eureka;

public class IndexStatus {
    public long fileCount;
    public boolean indexingInProgress;

    public IndexStatus(long fileCount, boolean indexingInProgress) {
        this.fileCount = fileCount;
        this.indexingInProgress = indexingInProgress;
    }
}
