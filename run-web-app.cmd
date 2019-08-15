for %%i in ("%~dp0..") do set "projects=%%~fi"
docker run --rm -it -v %projects%:/projects -p 8888:8080 --name eurekasearch eurekasearch
