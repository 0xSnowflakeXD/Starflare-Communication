@echo off
cd ../
pkg index.js -t node18-win -o server
echo Sucessful build!
pause