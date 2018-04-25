@echo off
setlocal

title React Dev

pushd %~dp0\..

:: Configuration
set NODE_ENV=development
set ELECTRON_DEFAULT_ERROR_MODE=1
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1

:: Launch
.\node_modules\electron\dist\electron.exe --debug=5860 . %*
popd

endlocal