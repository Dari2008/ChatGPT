@ECHO OFF
Title Scan a folder and store all files names in an array variables
SET "ROOT=%~dp0"
SET "EXT=js html css jpg png svg ico"
SET "Count=0"
Set "LogFile=%~dp0%~n0.txt"
SETLOCAL enabledelayedexpansion
REM Iterates throw the files on this current folder and its subfolders.
REM And Populate the array with existent files in this folder and its subfolders
For %%a in (%EXT%) Do ( 
    Call :Scanning "*.%%a" & timeout /T 2 /Nobreak>nul
    FOR /f "delims=" %%f IN ('dir /b /s "%ROOT%\*.%%a"') DO (
        Call :Scanning "%%f"
        SET /a "Count+=1"
        set "list[!Count!]=%%~nxf"
        set "listpath[!Count!]=%%~dpFf"
    )
)
::***************************************************************
:Display_Results
cls & color 0B
echo wscript.echo Len("%ROOT%"^) + 20 >"%tmp%\length.vbs"
for /f %%a in ('Cscript /nologo "%tmp%\length.vbs"') do ( set "cols=%%a")
If %cols% LSS 50 set /a cols=%cols% + 15
set /a lines=%Count% + 10
Mode con cols=%cols% lines=%lines%
ECHO  **********************************************************
ECHO  Folder:"%ROOT%"
ECHO  **********************************************************
If Exist "%LogFile%" Del "%LogFile%"
rem Display array elements and save results into the LogFile
for /L %%i in (1,1,%Count%) do (
    echo [%%i] : !list[%%i]!
    echo [%%i] : !list[%%i]! -- "!listpath[%%i]!" >> "%LogFile%"     
)

( ECHO. & ECHO Total of [%EXT%] files(s^) : %Count% file(s^) )>> "%LogFile%"
ECHO(
ECHO Total of [%EXT%] files(s) : %Count% file(s)
echo(
echo    Type the number of file did you want to explore ?
set /p "Input="
For /L %%i in (1,1,%Count%) Do (
    If "%INPUT%" EQU "%%i" (
        Call :Explorer "!listpath[%%i]!"
    )
)   
Goto:Display_Results
::**************************************************************
:Scanning <file>
mode con cols=75 lines=3
Cls & Color 0E
echo(
echo Scanning for "%~1" ...
goto :eof
::*************************************************************
:Explorer <file>
explorer.exe /e,/select,"%~1"
Goto :EOF
::*************************************************************