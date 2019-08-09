// Copyright (c) 2019-present, Rajeev-K.

package eureka;

import java.util.List;
import java.util.ArrayList;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import org.apache.log4j.Logger;
import org.apache.log4j.BasicConfigurator;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig.OpenMode;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.SearcherManager;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.CollectionStatistics;
import org.apache.lucene.store.FSDirectory;

public class SearchEngine {
    final static int MAX_RESULTS = 1000;
    final static Logger log = Logger.getLogger(SearchEngine.class);
    private static volatile SearchEngine instance;
    private SearcherManager searcherManager;
    private Analyzer analyzer;   // Analyzer is thread-safe
    private IndexWriter indexWriter;   // IndexWriter is thread-safe
    private volatile String currentlyIndexing;
    private static final String IndexPath = "/projects/eureka-index";
    private static final String ContentsField = "contents";
    private static final String PathField = "path";
    private String[] indexableExtensions = {
        ".ts", ".tsx", ".js",
        ".cs", ".java", ".scala", ".cpp", ".h", ".hh", ".c", ".cc", ".cxx", ".hpp", ".hxx",
        ".go", ".lua", ".py", ".rb" /* ruby */, ".rs" /* rust */, ".swift",
        ".md", ".txt", ".html", ".xhtml", ".cshtml",
        ".asp", ".aspx", ".jsp", ".sql", ".m" /* objective-c */, ".php", ".ps1",
        ".json", ".yml", ".xml",
        ".css", ".scss", ".less",
        ".cmd", ".sh"
    };
    private String[] skippableFolders = {
        "/.git", "/obj", "/bin", "/.vs",
        "/debug", "/release", "/target",
        "/node_modules", "/pnpm-store"
    };

    private SearchEngine() {
        BasicConfigurator.configure();
    }

    public static SearchEngine getInstance() throws IOException {
        if (instance == null) {
            synchronized (SearchEngine.class) {
                if (instance == null) {
                    instance = new SearchEngine();
                    instance.bringOnline();
                }
            }
        }
        return instance;
    }

    @Override
    protected void finalize() throws Throwable {
        this.takeOffline();
        super.finalize();
    }

    private void bringOnline() throws IOException {
        analyzer = new StandardAnalyzer();

        FSDirectory directory = FSDirectory.open(Paths.get(IndexPath));
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(OpenMode.CREATE_OR_APPEND);
        indexWriter = new IndexWriter(directory, config);
        searcherManager = new SearcherManager(indexWriter, true, true, null);
    }

    private void takeOffline() throws IOException {
        if (searcherManager != null) {
            searcherManager.close();
            searcherManager = null;
        }
        if (indexWriter != null) {
            indexWriter.close();
            indexWriter = null;
        }
    }

    public String[] getIndexableExtensions() {
        return indexableExtensions;
    }

    public void setIndexableExtensions(String[] indexableExtensions) {
        this.indexableExtensions = indexableExtensions;
    }

    public String[] getSkippableFolders() {
        return skippableFolders;
    }

    public void setSkippableFolders(String[] skippableFolders) {
        this.skippableFolders = skippableFolders;
    }

    /**
     * Returns file currently being indexed, or null if no file is currently being indexed.
     */
    public String getCurrentlyIndexing() {
        return currentlyIndexing;
    }

    /**
     * addFileToIndex
     * @folder Folder of the file, as specified by the user. Used to display all indexed folders.
     * @file The full path to the file.
     */
    public void addFileToIndex(String folder, Path filePath, long lastModified) throws IOException {
        InputStream stream = null;
        try {
            stream = Files.newInputStream(filePath);
            Document doc = new Document();

            Field pathField = new StringField(PathField, filePath.toString(), Field.Store.YES);
            doc.add(pathField);

            doc.add(new LongPoint("modified", lastModified));

            // Add the contents of the file to a field. Specify a Reader, so that the text of the file is tokenized
            // and indexed, but not stored. Note that FileReader expects the file to be in UTF-8 encoding.
            // If that's not the case searching for special characters will fail.
            InputStreamReader reader = new InputStreamReader(stream, StandardCharsets.UTF_8);
            InputStreamReader replacement = Utils.substituteChars(reader);
            doc.add(new TextField(ContentsField, new BufferedReader(replacement)));

            if (indexWriter.getConfig().getOpenMode() == OpenMode.CREATE) {
                indexWriter.addDocument(doc);
            }
            else {
                // Replace old file matching the exact path, if present.
                indexWriter.updateDocument(new Term(PathField, filePath.toString()), doc);
            }
        }
        finally {
            if (stream != null)
                stream.close();
        }
    }

    private boolean isFolderSkippable(Path folderPath) {
        String folder = folderPath.toString().toLowerCase();
        for (int i = 0; i < skippableFolders.length; i++) {
            if (folder.endsWith(skippableFolders[i])) {
                return true;
            }
        }
        return false;
    }

    private boolean isFileIndexable(Path filePath) {
        String filename = filePath.toString().toLowerCase();
        for (int j = 0; j < indexableExtensions.length; j++) {
            if (filename.endsWith(indexableExtensions[j])) {
                return true;
            }
        }
        return false;
    }

    public void addFolderToIndex(String folder) throws IOException {
        try {
            final Path folderPath = Paths.get(folder);
            if (!Files.isDirectory(folderPath)) {
                log.error(folderPath + " does not exist or is not a directory");
                throw new IllegalArgumentException("Supplied string does not point to a folder");
            }
            Files.walkFileTree(folderPath, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path path, BasicFileAttributes attrs) throws IOException {
                    if (isFolderSkippable(path)) {
                        return FileVisitResult.SKIP_SUBTREE;
                    }
                    else {
                        log.info("visiting " + path);
                        return FileVisitResult.CONTINUE;
                    }
                }

                @Override
                public FileVisitResult visitFile(Path filePath, BasicFileAttributes attrs) throws IOException {
                    try {
                        if (isFileIndexable(filePath)) {
                            currentlyIndexing = filePath.toString();
                            addFileToIndex(folder, filePath, attrs.lastModifiedTime().toMillis());
                        }
                    }
                    catch (IOException ignore) {
                        // Skip files that can't be read.
                    }
                    return FileVisitResult.CONTINUE;
                }
            });
            log.info("committing changes");
            indexWriter.commit();
            searcherManager.maybeRefresh();
        }
        finally {
            currentlyIndexing = null;
        }
    }

    public void deleteAll() throws IOException {
        log.info("deleting all documents from index");
        indexWriter.deleteAll();
        indexWriter.commit();
        searcherManager.maybeRefresh();
    }

    public void optimizeIndex() {
    }

    public long getDocCount() throws IOException {
        IndexSearcher searcher = searcherManager.acquire();
        try {
            CollectionStatistics stats = searcher.collectionStatistics(ContentsField);
            if (stats == null)
                return 0;
            return stats.docCount();
        }
        finally {
            searcherManager.release(searcher);
        }
    }

    public List<SearchResult> performSearch(String q) throws ParseException, IOException {
        log.info("searching, query=" + q);
        IndexSearcher searcher = searcherManager.acquire();
        try {
            QueryParser parser = new QueryParser(ContentsField, analyzer);
            Query query = parser.parse(q);
            TopDocs results = searcher.search(query, MAX_RESULTS);
            ScoreDoc[] hits = results.scoreDocs;

            List<SearchResult> searchResults = new ArrayList<SearchResult>();
            for (int i = 0; i < hits.length; i++) {
                Document doc = searcher.doc(hits[i].doc);
                String path = doc.get(PathField);
                searchResults.add(new SearchResult(path, hits[i].score));
            }
            return searchResults;
        }
        finally {
            searcherManager.release(searcher);
        }
    }
}
