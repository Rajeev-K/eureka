// Copyright (c) 2019-present, Rajeev-K.

package eureka;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;

public class Utils {
    /**
     * StandardAnalyzer does not consider '.' to be a token separator. This works around that problem.
     */
    public static InputStreamReader substituteChars(InputStreamReader reader) throws IOException {
        ByteArrayOutputStream outs = new ByteArrayOutputStream();
        int ch;
        while ((ch = reader.read()) != -1) {
            if (ch == '.')
                ch = ' ';
            outs.write(ch);
        }
        byte[] bytes = outs.toByteArray();
        InputStream inputStream = new ByteArrayInputStream(bytes);
        return new InputStreamReader(inputStream);
    }
}

