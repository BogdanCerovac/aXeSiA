@echo off
Rem number of loops
set loopEnd=1
Rem 
Rem counter for loops
set loop=0
Rem 
Rem time stamp
set start=%DATE% %TIME%
Rem 
cd ..
Rem 
Rem log
echo %DATE% %TIME% "Started" >> ./out/log.txt
node ./util/dbShowAll.js > ./out/log.tmp
rem /p to allow setting from file
set /p stats=<./out/log.tmp
echo %stats%  >> ./out/log.txt
cd out
Rem delete temp holder
del log.tmp
Rem 
Rem Make copy of audits.db before new audit
echo f | xcopy /q "audits.db" "audits_"%date%"_"%stats%"_bck.db"
cd ..
Rem ----------- LOOP START -------------
:loop
echo !!!!!!!!!!!!!!! Processing %loop% started %DATE% %TIME%
node index.js mainURL=https://cerovac.com/a11y/sitemap.xml
node index.js mainURL=https://www.itumx.no/sitemap.xml
echo !!!!!!!!!!!!!!! Processing %loop% stopped ok echo %DATE% %TIME%
rem
echo %DATE% %TIME% "Ended loop" %loop% "of" %loopEnd% >> ./out/log.txt
node ./util/dbShowAll.js > ./out/log.tmp
rem /p to allow setting from file
set /p stats=<./out/log.tmp
echo %stats%  >> ./out/log.txt
cd out
Rem delete temp holder
del log.tmp
cd ..
rem
set /a loop=%loop%+1
if "%loop%"=="%loopEnd%" goto next
goto loop
:next
Rem ----------- LOOP END -------------
echo !!!!!!!!!!!!!!! Looped successfully %loop% times Started @ %start% ended @ %DATE% %TIME%
echo %DATE% %TIME% "Ended all" %loopEnd% "loops" >> ./out/log.txt
node ./util/dbShowAll.js > ./out/log.tmp
rem /p to allow setting from file
set /p stats2=<./out/log.tmp
cd out
Rem delete temp holder
del log.tmp
cd ..
echo %stats2%  >> ./out/log.txt
cd out
echo f | xcopy /q "audits.db" "audits_"%date%"_"%stats2%"_after.db"
