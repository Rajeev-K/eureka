# eureka!
Lucene-based search engine for your source code

# What it is

eureka is a web application that harnesses the power of Lucene to index and search your source code. The web application runs locally on your desktop in a docker container, so there is nothing to install (other than Docker itself). You must give eureka access to your source code folder using the -v option of Docker command-line.

# How to run

First install [Docker Desktop](https://docs.docker.com/docker-for-windows/install/) if you haven't already. Then in Docker Settings screen [share the drive](https://docs.docker.com/docker-for-windows/#shared-drives) containing files you want to index and search.

Then open Command Prompt and type the following command. Make sure to replace *<path>* with the path to your source code folder, for example *c:\repos*.

```
docker run -it -v <path>:/projects -p 8888:8080 --name eurekasearch eurekasearch/eurekasearch:latest
```

That's it! You are now running eureka! In your web browser go to http://localhost:8888/search/ to index and search your source code.
