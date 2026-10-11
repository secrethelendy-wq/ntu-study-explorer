@echo off
setlocal
cd /d "%~dp0"
set "TASK_NODE=node"
where node.exe >nul 2>nul
if errorlevel 1 set "TASK_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%TASK_NODE%" scripts\preview-server.mjs
if errorlevel 1 pause



