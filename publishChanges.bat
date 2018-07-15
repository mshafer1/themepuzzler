@ECHO off
cls

pushd %~dp0 || GOTO :ERROR

cd ..\themepuzzler || GOTO :ERROR

REM double check on gh-pages branch
git checkout gh-pages || GOTO :ERROR

REM make sure all files are included
git add -A || GOTO :ERROR

REM  commit changes
git commit -am "%date% %time%" || GOTO :ERROR

REM push to server
git push origin gh-pages || GOTO :ERROR

popd || GOTO :ERROR

GOTO :EOF
:ERROR
pause