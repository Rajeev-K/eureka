// Copyright (c) 2019-present, Rajeev-K.

// Usage examples:
// GET    http://localhost:8888/eureka-service/api/git/history?path=/foo/bar
// GET    http://localhost:8888/eureka-service/api/git/fileAtRevision?path=/foo/bar&revision=123fedc

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
import java.nio.charset.StandardCharsets;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.api.LogCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevCommitList;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.PersonIdent;

// jgit documentation:
// https://download.eclipse.org/jgit/site/5.0.3.201809091024-r/apidocs/index.html
// https://github.com/centic9/jgit-cookbook

@Path("/git")
public class GitService {
    private CommitHeader getCommitHeader(RevCommit commit) {
        PersonIdent author = commit.getAuthorIdent();
        return new CommitHeader(
            commit.getName(),
            commit.getCommitTime(),
            author.getName(),
            author.getEmailAddress(),
            commit.getShortMessage(),
            commit.getFullMessage()
        );
    }

    /** Given full path to a file, returns git repo and path relative to the repo. */
    private GitData getGitRepoAndPath(String fullPath) throws IOException {
        File sourceCodeFile = new File(fullPath);

        FileRepositoryBuilder repositoryBuilder = new FileRepositoryBuilder().findGitDir(sourceCodeFile);
        File gitDir = repositoryBuilder.getGitDir();
        if (gitDir == null)
            throw new BadRequestException("This file is not in a git repository.");

        GitData gitData = new GitData();
        gitData.repo = repositoryBuilder.build();

        java.nio.file.Path gitDirPath = gitDir.toPath();
        java.nio.file.Path repoRelativePath = gitDirPath.getParent().relativize(sourceCodeFile.toPath());
        gitData.relativePath = repoRelativePath.toString();

        return gitData;
    }

    @GET
    @Path("/history")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHistory(@QueryParam("path") String path) {
        if (path == null || path.length() == 0) {
            throw new BadRequestException("Missing query parameter: path");
        }
        try {
            GitData gitData = getGitRepoAndPath(path);

            Git git = new Git(gitData.repo);
            ObjectId head = gitData.repo.resolve(Constants.HEAD);
            Iterable<RevCommit> commits = git.log().add(head).addPath(gitData.relativePath).call();

            List<CommitHeader> headers = new ArrayList<CommitHeader>();
            for (RevCommit revCommit : commits) {
                headers.add(getCommitHeader(revCommit));
            }

            return Response.ok(headers).build();
        }
        catch (IOException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
        catch (org.eclipse.jgit.api.errors.GitAPIException ex) {
            throw new InternalServerErrorException(ex.getMessage());
        }
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/fileAtRevision")
    public String getFileContents(@QueryParam("path") String path, @QueryParam("revision") String revision) {
        if (path == null)
            throw new BadRequestException("Path must be specified");
        if (!path.startsWith("/projects"))
            throw new BadRequestException("Path must start with /projects");
        if (revision == null)
            throw new BadRequestException("Revision must be specified");
        try {
            GitData gitData = getGitRepoAndPath(path);
            byte[] data = fetchBlob(gitData.repo, revision, gitData.relativePath);
            return new String(data, StandardCharsets.UTF_8);
        }
        catch (IOException ex) {
            throw new BadRequestException("The file could not be opened.");
        }
    }

    private byte[] fetchBlob(Repository repo, String revSpec, String path) throws IOException {
        final ObjectId revision = repo.resolve(revSpec);
        try (ObjectReader reader = repo.newObjectReader()) {
            // Get the commit object corresponding to revision.
            RevWalk walk = new RevWalk(reader);
            RevCommit commit = walk.parseCommit(revision);

            // Get a reference to this commit's tree.
            RevTree tree = commit.getTree();
            // Open a tree walk and filter to exactly one path.
            TreeWalk treewalk = TreeWalk.forPath(reader, path, tree);
            if (treewalk == null)
                throw new BadRequestException("File was not found in git commit tree.");

            return reader.open(treewalk.getObjectId(0)).getBytes();
        }
    }
}

class GitData {
    public Repository repo;
    public String relativePath;
}
