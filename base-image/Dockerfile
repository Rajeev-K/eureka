# Alpine is a tiny Linux, it is the distro of choice for containers
FROM openjdk:8-alpine

# Versions
ENV LUCENE_VERSION 8.7.0
ENV TOMCAT_VERSION 9.0.40

# Folder locations
ENV LUCENE_HOME /usr/local/share/lucene
ENV TOMCAT_HOME /usr/local/share/tomcat
ENV JARS_HOME /usr/local/share/jars

# Alpine does not have bash by default, so install it
RUN apk add --no-cache bash

# Install lucene
RUN set -xe \
  && cd /tmp \
  && wget http://apache.cs.utah.edu/lucene/java/${LUCENE_VERSION}/lucene-${LUCENE_VERSION}.tgz \
  && tar -zxvf lucene-${LUCENE_VERSION}.tgz \
  && rm *.tgz \
  && mkdir -p `dirname ${LUCENE_HOME}` \
  && mv lucene-${LUCENE_VERSION} ${LUCENE_HOME}

# Install tomcat
RUN set -xe \
  && cd /tmp \
  && wget http://mirror.cc.columbia.edu/pub/software/apache/tomcat/tomcat-9/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  && tar -zxvf apache-tomcat-${TOMCAT_VERSION}.tar.gz \
  && rm *.gz \
  && mkdir -p `dirname ${TOMCAT_HOME}` \
  && mv apache-tomcat-${TOMCAT_VERSION} ${TOMCAT_HOME}

# To run tomcat in background:
#    /usr/local/share/tomcat/bin/startup.sh
# To run tomcat in foreground:
#    /usr/local/share/tomcat/bin/catalina.sh run

WORKDIR /projects
