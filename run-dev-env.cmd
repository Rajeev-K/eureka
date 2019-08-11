for %%i in ("%~dp0..") do set "projects=%%~fi"
docker run -it -v %projects%:/projects eureka-dev-env /bin/bash
