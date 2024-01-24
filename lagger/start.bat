@echo off
REM # | performance-test by Nullified.
REM # | You're responsible for any damage caused by this tool
REM # | Please be careful using this. We (the creators) will
REM # | NOT responsible for any damage caused by this tool.
REM # | Thanks for using. Part of tcp-toolkit
choice /M "Press A to cancel, B to start, C for README.md" /C abc /N
if %errorlevel%==3 (
    start readme.md
    exit
)
if %errorlevel%==2 (
    start "Lagg" node .
)
if %errorlevel%==1 (
    exit
)