@ECHO off
cls

pushd %~dp0 || GOTO :ERROR

REM get latest commit message
set commitMessage=
FOR /F "tokens=* USEBACKQ" %%F IN (`git log -n 1 --oneline`) DO (
SET commitMessage=%%F
)

cd ..\themepuzzler || GOTO :ERROR

REM double check on gh-pages branch
git checkout gh-pages || GOTO :ERROR

REM make sure all files are included
git add -A || GOTO :ERROR

REM  commit changes


git commit -am "%date% %time% %commitMessage%" || GOTO :ERROR
REM echo %date% %time% %commitMessage%

REM push to server
git push origin gh-pages || GOTO :ERROR

GOTO :FINISH

:ERROR
pause

:FINISH
popd