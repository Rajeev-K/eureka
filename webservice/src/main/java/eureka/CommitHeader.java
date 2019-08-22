// Copyright (c) 2019-present, Rajeev-K.

package eureka;

public class CommitHeader {
    public String hashCode;
    public int time;
    public String authorName;
    public String authorEmail;
    public String shortMessage;
    public String fullMessage;

    public CommitHeader(String hashCode, int time, String authorName, String authorEmail, String shortMessage, String fullMessage) {
        this.hashCode = hashCode;
        this.time = time;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.shortMessage = shortMessage;
        this.fullMessage = fullMessage;
    }
}
