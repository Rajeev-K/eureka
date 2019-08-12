# eureka!
Lucene-based search engine for your source code.

## What it is

eureka is a web application that harnesses the power of Lucene to index and search your source code. The web application runs locally on your desktop in a docker container, so there is nothing to install (other than Docker itself). You must give eureka access to your source code folder using the -v option of Docker command-line.

## How to run

First install [Docker Desktop](https://docs.docker.com/docker-for-windows/install/) if you haven't already. Then in Docker Settings screen [share the drive](https://docs.docker.com/docker-for-windows/#shared-drives) containing files you want to index and search.

Then open Command Prompt and type the following command. Make sure to replace ```<path>``` with the path to your source code folder, for example ```c:\repos```.

```
docker run -it -v <path>:/projects -p 8888:8080 --name eurekasearch eurekasearch/eurekasearch:latest
```

That's it! You are now running eureka! In your web browser go to http://localhost:8888/search/ to index and search your source code.

## Key features
* Configurable indexing: Specify file extensions that are indexable and folders to skip. Other search tools just start indexing as soon as they are installed, and they choke when they come to large folders such as node_modules which should not even be indexed in the first place.
* Filter search results, for example to exclude test folders and only show certain file types.
* Use the integrated full-fledged source code viewer (Monaco editor from VSCode) to view your source code.
* Feedback during the indexing process. In the web interface you can see what is being indexed. Other tools just disappear for hours, leaving you to wonder what it is doing, or whether it is doing anything at all.

## How to build
If you would like to build the Docker image on your machine follow the [build](Build.md) instructions.

![Screenshot of search page](/images/eureka_search_screen.png?raw=true)
