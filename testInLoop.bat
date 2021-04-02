@echo off
set loopEnd=5
set loop=1
set start=%DATE% %TIME%
:loop
echo !!!!!!!!!!!!!!! Processing %loop% started echo %DATE% %TIME%
node index.js mainURL=https://cerovac.com/a11y/sitemap.xml
node index.js mainURL=https://www.itumx.no/sitemap.xml
echo !!!!!!!!!!!!!!! Processing %loop% stopped ok echo %DATE% %TIME%
set /a loop=%loop%+1 
if "%loop%"=="%loopEnd%" goto next
goto loop

:next
echo !!!!!!!!!!!!!!! Looped successfully %loopEnd% times Started @ %start% ended @ %DATE% %TIME%