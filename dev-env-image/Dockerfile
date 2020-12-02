FROM eureka-base

# Versions
ENV MAVEN_VERSION 3.6.3

# Maven locations
ENV MAVEN_HOME /usr/local/share/maven

# Install maven
RUN set -xe \
  && cd /tmp \
  && wget http://mirrors.ocf.berkeley.edu/apache/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
  && tar -zxvf apache-maven-${MAVEN_VERSION}-bin.tar.gz \
  && rm *.gz \
  && mkdir -p `dirname ${MAVEN_HOME}` \
  && mv apache-maven-${MAVEN_VERSION} ${MAVEN_HOME}

ENV PATH "$PATH:/usr/local/share/maven/bin"

# Do a build to make mvn download everything it needs
COPY webservice/ /tmp/webservice/
RUN set -xe \
  && cd /tmp/webservice \
  && mvn clean package

CMD /bin/bash
