// Copyright (c) 2019-present, Rajeev-K.

// Usage examples:
// GET    http://localhost:8888/eureka-service/api/searchengine
// GET    http://localhost:8888/eureka-service/api/searchengine/status
// GET    http://localhost:8888/eureka-service/api/searchengine/search?query=const
// GET    http://localhost:8888/eureka-service/api/searchengine/file?path=/projects/foo
// POST   http://localhost:8888/eureka-service/api/searchengine/index
// DELETE http://localhost:8888/eureka-service/api/searchengine/index
// GET    http://localhost:8888/eureka-service/api/searchengine/foldercontents
// GET    http://localhost:8888/eureka-service/api/searchengine/skippablefolders
// GET    http://localhost:8888/eureka-service/api/searchengine/indexableextensions
// GET    http://localhost:8888/eureka-service/api/searchengine/progress

package eureka;

import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.BadRequestException;
import org.glassfish.jersey.media.sse.EventOutput;
import org.glassfish.jersey.media.sse.OutboundEvent;
import org.glassfish.jersey.media.sse.SseFeature;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.FileVisitResult;
import java.nio.charset.StandardCharsets;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.io.IOException;
import org.apache.lucene.queryparser.classic.ParseException;

@Path("/searchengine")
public class SearchService {
    @GET
    public String getMessage() {
        return "Hello from eureka! " + new java.util.Date();
    }

    @GET
    @Path("/status")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStatus() {
        try {
            SearchEngine engine = SearchEngine.getInstance();
            long count = engine.getDocCount();
            boolean indexingInProgress = engine.getCurrentlyIndexing() != null;
            IndexStatus status = new IndexStatus(count, indexingInProgress);
            return Response.ok(status).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }

    @GET
    @Path("/search")
    @Produces(MediaType.APPLICATION_JSON)
    public Response search(@QueryParam("query") String query) {
        if (query == null || query.length() == 0) {
            throw new BadRequestException("query parameter must be supplied");
        }
        try {
            SearchEngine engine = SearchEngine.getInstance();
            List<SearchResult> results = engine.performSearch(query);
            return Response.ok(results).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
        catch (ParseException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }

    @DELETE
    @Path("/index")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteAll() {
        try {
            SearchEngine engine = SearchEngine.getInstance();
            engine.deleteAll();
            return Response.ok("{\"message\": \"Index deleted successfully.\"}").build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }

    @GET
    @Path("/progress")
    @Produces(SseFeature.SERVER_SENT_EVENTS)
    public EventOutput getIndexingProgress() {
        final EventOutput eventOutput = new EventOutput();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    for ( ; ; ) {
                        try { Thread.sleep(100); } catch (InterruptedException ex) {}
                        SearchEngine engine = SearchEngine.getInstance();
                        String currentFile = engine.getCurrentlyIndexing();
                        if (currentFile == null)
                            break;
                        eventOutput.write(new OutboundEvent.Builder().name("message").data(String.class, currentFile).build());
                    }
                }
                catch (org.apache.catalina.connector.ClientAbortException ex) {
                    System.out.println("getIndexingProgress: Client has closed connection.");
                }
                catch (IOException ex) {
                    throw new RuntimeException("Error occured when writing event.", ex);
                }
                finally {
                    try {
                        eventOutput.close();
                    }
                    catch (IOException ex) {
                        throw new RuntimeException("Error occured when closing event output.", ex);
                    }
                }
            }
        }).start();
        return eventOutput;
    }

    private void startIndexingThread(IndexRequest indexRequest) {
        Thread thread = new Thread() {
            public void run() {
                try {
                    SearchEngine engine = SearchEngine.getInstance();
                    engine.setIndexableExtensions(indexRequest.getIndexableExtensions());
                    engine.setSkippableFolders(indexRequest.getSkippableFolders());
                    engine.addFolderToIndex(indexRequest.getPath());
                }
                catch (IOException ex) {
                    System.out.println(ex.getMessage());
                }
            }
        };
        thread.start();
    }

    @POST
    @Path("/index")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response indexFolder(IndexRequest indexRequest) {
        if (indexRequest == null) {
            throw new BadRequestException("Index request is not valid.");
        }
        String path = indexRequest.getPath();
        if (path == null || path.length() == 0) {
            throw new BadRequestException("Index request does not have a valid path.");
        }
        final java.nio.file.Path folderPath = Paths.get(path);
        if (!Files.isDirectory(folderPath)) {
            throw new BadRequestException("Supplied path does not point to a folder.");
        }
        startIndexingThread(indexRequest);
        return Response.ok("{\"indexingStarted\": true}").build();
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/file")
    public String getFileContents(@QueryParam("path") String path) {
        if (path == null)
            throw new BadRequestException("Path must be specified");
        if (!path.startsWith("/projects"))
            throw new BadRequestException("Path must start with /projects");
        try {
            return new String(Files.readAllBytes(Paths.get(path)), StandardCharsets.UTF_8);
        }
        catch (IOException ex) {
            throw new BadRequestException("The file could not be opened.");
        }
    }

    private List<String> getItemsInFolder(String parentFolder) throws IOException {
        List<String> items = new ArrayList<String>();
        final java.nio.file.Path folderPath = Paths.get(parentFolder);
        Files.walkFileTree(folderPath, new SimpleFileVisitor<java.nio.file.Path>() {
            @Override
            public FileVisitResult preVisitDirectory(java.nio.file.Path path, BasicFileAttributes attrs) throws IOException {
                String folder = path.toString();
                items.add(folder + "/");
                return folder.equals(parentFolder) ? FileVisitResult.CONTINUE : FileVisitResult.SKIP_SUBTREE;
            }

            @Override
            public FileVisitResult visitFile(java.nio.file.Path filePath, BasicFileAttributes attrs) throws IOException {
                items.add(filePath.toString());
                return FileVisitResult.CONTINUE;
            }
        });
        return items;
    }

    @GET
    @Path("/foldercontents")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getFolderContents(@QueryParam("path") String path) {
        if (path == null)
            throw new BadRequestException("Path must be specified");
        try {
            List<String> items;
            if (!path.startsWith("/projects"))
                items = Arrays.asList("/projects/");
            else
                items = getItemsInFolder(path);
            return Response.ok(items).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }

    @GET
    @Path("/indexableextensions")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getIndexableExtensions() {
        try {
            SearchEngine engine = SearchEngine.getInstance();
            String[] extensions = engine.getIndexableExtensions();
            return Response.ok(extensions).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }

    @GET
    @Path("/skippablefolders")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSkippableFolders() {
        try {
            SearchEngine engine = SearchEngine.getInstance();
            String[] skippableFolders = engine.getSkippableFolders();
            return Response.ok(skippableFolders).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }
}
