@echo off
setlocal EnableDelayedExpansion

for /f "delims=" %%I in ('wsl.exe wslpath -a "%~dp0.."') do set "WSL_PROJECT_ROOT=%%I"

set "ARGS="

:next
if "%~1"=="" goto run
set "ARG=%~1"
if not "%ARG:~0,1%"=="-" set "ARG=!ARG:\=/!"
set "ARGS=!ARGS! "!ARG!""
shift
goto next

:run
wsl.exe --cd "%WSL_PROJECT_ROOT%" "%WSL_PROJECT_ROOT%/node_modules/hermes-compiler/hermesc/linux64-bin/hermesc" %ARGS%
