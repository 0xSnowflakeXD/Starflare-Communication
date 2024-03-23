@echo off
cd ../
pkg index.js -t node18-win -o client
echo Sucessful build!
pause