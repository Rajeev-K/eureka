# How to build eureka!

The instructions below are for a Windows box. The instructions assume eureka source code is in C:\projects\eureka.

## Build base Docker image

Run ```build-base.cmd``` to build the base Docker image.

## Build dev-env Docker image

Run ```build-dev-env.cmd``` to build the dev-env Docker image.

## Build the web service

Run ```run-dev-env.cmd``` to start the dev-env container.

At the bash prompt type ```cd /projects/eureka/webservice```

Type ```mvn package``` to build the web service.

You can now exit the build-env container.

## Build the client web app

Go to the webapp folder by typing ```cd webapp```. Type ```npm install``` followed by ```gulp```.

## Build the Docker image

Now that the web service and web app have been built we are ready to build the Docker image. Switch to eureka folder and type ```build-web-app.cmd``` to build the image, then ```run-web-app.cmd``` to test it.

# Technologies used

We use [Apache Lucene](https://lucene.apache.org/) to index and search. We use Java and [Jersey](https://jersey.github.io/) to build the web service. The web server is [Apache Tomcat](http://tomcat.apache.org/). For the client app we use TypeScript, [UIBuilder](https://github.com/wisercoder/uibuilder) for building UI components and pages, and [MVC Router](https://github.com/Rajeev-K/mvc-router) for routing.
