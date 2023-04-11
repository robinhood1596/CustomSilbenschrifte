@echo off
start http-server . -c-1
start "" "http://localhost:8080/index.html"