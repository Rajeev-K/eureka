// Copyright (c) 2019-present, Rajeev-K.

// Usage examples:
// GET    http://localhost:8888/eureka-service/api/git/history?path=/foo/bar

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
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.api.LogCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevCommitList;
import org.eclipse.jgit.lib.ObjectId;

// https://download.eclipse.org/jgit/site/5.0.3.201809091024-r/apidocs/index.html

@Path("/git")
public class GitService {
    @GET
    @Path("/history")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHistory(@QueryParam("path") String path) {
        if (path == null || path.length() == 0) {
            throw new BadRequestException("Missing query parameter: path");
        }
        try {
            File sourceCodeFile = new File(path);
            FileRepositoryBuilder repositoryBuilder = new FileRepositoryBuilder().findGitDir(sourceCodeFile);
            File gitDir = repositoryBuilder.getGitDir();
            if (gitDir == null)
                throw new BadRequestException("No git repository found");
            Repository repository = repositoryBuilder.build();

            java.nio.file.Path gitDirPath = gitDir.toPath();
            java.nio.file.Path sourceFilePath = Paths.get(path);
            java.nio.file.Path sourceRelativePath = gitDirPath.getParent().relativize(sourceFilePath);

            Git git = new Git(repository);
            ObjectId head = repository.resolve(Constants.HEAD);
            Iterable<RevCommit> commits = git.log().add(head).addPath(sourceRelativePath.toString()).call();

            List<String> messages = new ArrayList<String>();
            for (RevCommit revCommit : commits) {
                messages.add(revCommit.getFullMessage());
            }

            return Response.ok(messages).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
        catch (org.eclipse.jgit.api.errors.GitAPIException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }
}
