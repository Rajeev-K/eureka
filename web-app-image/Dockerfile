FROM eureka-base

# Install favicon
COPY webapp/wwwroot/favicon.ico /usr/local/share/tomcat/webapps/ROOT/favicon.ico

# Replace server.xml in order to enable url rewrite
COPY conf/server.xml ${TOMCAT_HOME}/conf/server.xml

# Install url rewrite settings
RUN mkdir -p ${TOMCAT_HOME}/conf/Catalina/localhost
COPY conf/rewrite.config ${TOMCAT_HOME}/conf/Catalina/localhost/rewrite.config

# Install webservice
RUN mkdir -p ${TOMCAT_HOME}/webapps/eureka-service
COPY webservice/target/eureka-service/ ${TOMCAT_HOME}/webapps/eureka-service/

# Install webapp
RUN mkdir -p ${TOMCAT_HOME}/webapps/search
COPY webapp/wwwroot/ ${TOMCAT_HOME}/webapps/search/

EXPOSE 8080

CMD /usr/local/share/tomcat/bin/catalina.sh run
