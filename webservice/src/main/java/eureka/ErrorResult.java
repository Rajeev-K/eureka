// Copyright (c) 2019-present, Rajeev-K.

package eureka;

public class ErrorResult {
    public boolean error = true;
    public String message;
    
    public ErrorResult(String message) {
        this.message = message;
    }
}
