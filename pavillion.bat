@echo off
setlocal enabledelayedexpansion

:: Enable ANSI escape processing on Windows 10+
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

:: Capture real ESC character (0x1B) via prompt trick
for /f "delims=" %%E in ('echo prompt $E^| cmd /q') do set "ESC=%%E"

set "CMD=%~1"
set "ARG1=%~2"
set "ARG2=%~3"

set "GREEN=!ESC![32m"
set "YELLOW=!ESC![33m"
set "RED=!ESC![31m"
set "CYAN=!ESC![36m"
set "RESET=!ESC![0m"
set "BOLD=!ESC![1m"

if /i "%CMD%"=="install"  goto :cmd_install
if /i "%CMD%"=="list"     goto :cmd_list
if /i "%CMD%"=="status"   goto :cmd_status
goto :cmd_help

:: ============================================================
:: INSTALL
:: ============================================================
:cmd_install
if "%ARG1%"=="" (
    echo %RED%[pavillion] ERROR: No URL provided.%RESET%
    echo Usage: pavillion install ^<raw-github-url-to-pavillion.module.json^>
    exit /b 1
)

echo %CYAN%[pavillion] Fetching manifest...%RESET%
set "TMP_JSON=%TEMP%\pav_manifest_%RANDOM%.json"
curl -fsSL "%ARG1%" -o "%TMP_JSON%" 2>nul
if errorlevel 1 (
    echo %RED%[pavillion] ERROR: Failed to fetch manifest from:
    echo   %ARG1%%RESET%
    exit /b 1
)

:: Parse fields from the manifest
for /f "tokens=*" %%L in ('node -e "
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('%TMP_JSON%','utf8'));
console.log('MODULE_NAME='+m.module_name);
console.log('MODULE_ID='+m.module_id);
console.log('VERSION='+m.version);
console.log('AUTHOR='+m.author.join(', '));
const uses=m.uses||[];
console.log('USES='+uses.join(','));
"') do (
    set "%%L"
)

if "%MODULE_NAME%"=="" (
    echo %RED%[pavillion] ERROR: Invalid or unreadable manifest.%RESET%
    del "%TMP_JSON%" 2>nul
    exit /b 1
)

:: Derive base URL from manifest URL
:: Input:  https://raw.githubusercontent.com/<user>/<repo>/<branch>/frontend/src/module/<ModuleName>/pavillion.module.json
:: Base:   https://raw.githubusercontent.com/<user>/<repo>/<branch>/frontend/src/
set "BASE_URL=%ARG1%"
:: Strip trailing filename
for %%F in ("%BASE_URL%") do set "BASE_URL=%%~dpF"
set "BASE_URL=%BASE_URL:\=/%"
:: Walk up to frontend/src/ — strip module/<ModuleName>/ (2 levels)
call :strip_last_segment "%BASE_URL%" BASE_URL
call :strip_last_segment "%BASE_URL%" BASE_URL

echo %CYAN%[pavillion] Installing: %BOLD%%MODULE_NAME%%RESET% %CYAN%(v%VERSION%)%RESET%
echo %CYAN%[pavillion] Scopes: %USES%%RESET%

:: Process each scope in USES
set "INSTALL_OK=1"
for %%S in (%USES:,= %) do (
    call :install_scope "%%S" "%BASE_URL%" "%MODULE_NAME%"
    if errorlevel 1 set "INSTALL_OK=0"
)

:: Write pavillion.module.json into module/<ModuleName>/
set "MOD_DIR=frontend\src\app\module\%MODULE_NAME%"
if not exist "%MOD_DIR%" mkdir "%MOD_DIR%"
copy /y "%TMP_JSON%" "%MOD_DIR%\pavillion.module.json" >nul
echo %GREEN%[pavillion] Manifest saved to %MOD_DIR%\pavillion.module.json%RESET%

del "%TMP_JSON%" 2>nul

if "%INSTALL_OK%"=="1" (
    echo %GREEN%[pavillion] %MODULE_NAME% installed successfully.%RESET%
) else (
    echo %YELLOW%[pavillion] %MODULE_NAME% installed with warnings. Some files may be missing.%RESET%
)
exit /b 0


:install_scope
:: %~1 = scope (lib / utils / components)
:: %~2 = base URL
:: %~3 = module name
set "_SCOPE=%~1"
set "_BASE=%~2"
set "_NAME=%~3"

set "SRC_URL=%_BASE%%_SCOPE%/%_NAME%/"
set "DEST_DIR=frontend\src\app\%_SCOPE%\%_NAME%"

if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"

set "FETCH_ERR=0"

if /i "%_SCOPE%"=="components" (
    set "_FILES=README.md types.ts style.css index.tsx"
) else (
    set "_FILES=README.md types.ts index.ts"
)

for %%F in (%_FILES%) do (
    set "FILE_URL=%SRC_URL%%%F"
    set "FILE_DST=%DEST_DIR%\%%F"
    curl -fsSL "!FILE_URL!" -o "!FILE_DST!" 2>nul
    if errorlevel 1 (
        echo %YELLOW%[pavillion] WARN: Could not fetch %_SCOPE%/%_NAME%/%%F%RESET%
        set "FETCH_ERR=1"
        del "!FILE_DST!" 2>nul
    ) else (
        echo %GREEN%[pavillion] + %_SCOPE%\%_NAME%\%%F%RESET%
    )
)

if "%FETCH_ERR%"=="1" exit /b 1
exit /b 0


:: Helper: strip last path segment from a URL
:strip_last_segment
set "_U=%~1"
:: Remove trailing slash if present
if "%_U:~-1%"=="/" set "_U=%_U:~0,-1%"
:: Find and remove last segment
for %%X in ("%_U%") do set "%~2=%%~dpX"
set "_TMP=!%~2!"
if "%_TMP:~-1%"=="/" set "%_TMP%=%_TMP:~0,-1%"
set "%~2=%_TMP%"
exit /b 0


:: ============================================================
:: LIST
:: ============================================================
:cmd_list
echo.
echo %BOLD%%CYAN%  PAVILLION MODULE LIST%RESET%
echo  %CYAN%--------------------------------------------%RESET%

set "MOD_BASE=frontend\src\app\module"
if not exist "%MOD_BASE%" (
    echo %YELLOW%  No modules installed.%RESET%
    exit /b 0
)

set "FOUND=0"
for /d %%D in ("%MOD_BASE%\*") do (
    set "MANIFEST=%%D\pavillion.module.json"
    if exist "!MANIFEST!" (
        set "FOUND=1"
        for /f "tokens=*" %%L in ('node -e "
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('!MANIFEST!','utf8'));
console.log(m.module_id + ' | ' + m.module_name + ' | v' + m.version);
"') do (
            echo   %GREEN%%%L%RESET%
        )
    )
)

if "%FOUND%"=="0" echo %YELLOW%  No modules installed.%RESET%
echo  %CYAN%--------------------------------------------%RESET%
echo.
exit /b 0


:: ============================================================
:: STATUS
:: ============================================================
:cmd_status
if /i "%ARG1%"=="module" goto :status_module

:: ---- pavillion status  (dependency check) ----
echo.
echo %BOLD%%CYAN%  PAVILLION STATUS%RESET%
echo  %CYAN%--------------------------------------------%RESET%
printf "  %-25s %-10s %-8s %-20s  %s\n" "MODULE ID" "NAME" "VER" "AUTHOR" "STATUS" 2>nul
echo.

set "MOD_BASE=frontend\src\app\module"
if not exist "%MOD_BASE%" (
    echo %YELLOW%  No modules installed.%RESET%
    exit /b 0
)

:: Collect all installed module_name values first
set "ALL_NAMES="
for /d %%D in ("%MOD_BASE%\*") do (
    if exist "%%D\pavillion.module.json" (
        for /f "tokens=*" %%N in ('node -e "
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('%%D\\pavillion.module.json','utf8'));
process.stdout.write(m.module_name+'|');
"') do set "ALL_NAMES=!ALL_NAMES!%%N"
    )
)

for /d %%D in ("%MOD_BASE%\*") do (
    set "MANIFEST=%%D\pavillion.module.json"
    if exist "!MANIFEST!" (
        for /f "tokens=*" %%L in ('node -e "
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('!MANIFEST!','utf8'));
const all='%ALL_NAMES%';
const missing=m.depends_on.filter(d=>!all.includes(d+'|'));
if(missing.length===0){
    console.log('OK|'+m.module_id+'|'+m.module_name+'|'+m.version+'|'+m.author.join(',')+
    '|');
}else{
    console.log('MISS|'+m.module_id+'|'+m.module_name+'|'+m.version+'|'+m.author.join(',')+
    '|'+missing.join(';'));
}
"') do (
            for /f "tokens=1,2,3,4,5,6 delims=|" %%A in ("%%L") do (
                set "_ST=%%A"
                set "_ID=%%B"
                set "_NM=%%C"
                set "_VR=%%D"
                set "_AU=%%E"
                set "_MS=%%F"

                if "!_ST!"=="OK" (
                    echo   %GREEN%!_ID!  !_NM!  v!_VR!  !_AU!  GOOD%RESET%
                ) else (
                    set "_MISSING_LIST=!_MS:;=, !"
                    echo   %YELLOW%!_ID!  !_NM!  v!_VR!  !_AU!  MISSING DEPENDENCIES: !_MISSING_LIST!%RESET%
                )
            )
        )
    )
)

echo  %CYAN%--------------------------------------------%RESET%
echo.
exit /b 0


:: ---- pavillion status module  (file integrity check) ----
:status_module
echo.
echo %BOLD%%CYAN%  PAVILLION MODULE INTEGRITY CHECK%RESET%
echo  %CYAN%--------------------------------------------%RESET%

set "MOD_BASE=frontend\src\app\module"
if not exist "%MOD_BASE%" (
    echo %YELLOW%  No modules installed.%RESET%
    exit /b 0
)

for /d %%D in ("%MOD_BASE%\*") do (
    set "MANIFEST=%%D\pavillion.module.json"
    if exist "!MANIFEST!" (
        for /f "tokens=*" %%L in ('node -e "
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('!MANIFEST!','utf8'));
console.log(m.module_name+'|'+m.module_id+'|'+m.uses.join(','));
"') do (
            for /f "tokens=1,2,3 delims=|" %%A in ("%%L") do (
                set "_NM=%%A"
                set "_ID=%%B"
                set "_USES=%%C"

                set "_MOD_OK=1"
                set "_MISSING_FILES="

                for %%S in (!_USES:,= !) do (
                    set "_SCOPE_DIR=frontend\src\app\%%S\!_NM!"
                    if not exist "!_SCOPE_DIR!" (
                        set "_MOD_OK=0"
                        set "_MISSING_FILES=!_MISSING_FILES! [%%S\!_NM! MISSING]"
                    ) else (
                        if /i "%%S"=="components" (
                            set "_EXPECT=README.md types.ts style.css index.tsx"
                        ) else (
                            set "_EXPECT=README.md types.ts index.ts"
                        )
                        for %%F in (!_EXPECT!) do (
                            if not exist "!_SCOPE_DIR!\%%F" (
                                set "_MOD_OK=0"
                                set "_MISSING_FILES=!_MISSING_FILES! [%%S\!_NM!\%%F]"
                            )
                        )
                    )
                )

                if "!_MOD_OK!"=="1" (
                    echo   %GREEN%!_ID!  !_NM!  OK%RESET%
                ) else (
                    echo   %RED%!_ID!  !_NM!  MISSING:!_MISSING_FILES!%RESET%
                )
            )
        )
    )
)

echo  %CYAN%--------------------------------------------%RESET%
echo.
exit /b 0


:: ============================================================
:: HELP
:: ============================================================
:cmd_help
echo.
echo %BOLD%%CYAN%  PAVILLION Package Manager%RESET%
echo  %CYAN%--------------------------------------------%RESET%
echo.
echo   %BOLD%pavillion install ^<url^>%RESET%
echo     Install a module from a raw GitHub pavillion.module.json URL.
echo.
echo   %BOLD%pavillion list%RESET%
echo     List all installed modules ^(ID, Name, Version^).
echo.
echo   %BOLD%pavillion status%RESET%
echo     Check dependency health of all installed modules.
echo.
echo   %BOLD%pavillion status module%RESET%
echo     Check file integrity of all installed modules.
echo.
echo  %CYAN%--------------------------------------------%RESET%
echo.
exit /b 0