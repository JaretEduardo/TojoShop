@echo off
REM =============================================================
REM RUN.bat - Levanta Laravel, Node (MQTT) y Angular (multi-ventana)
REM NOTA: Ejecuta este .bat con doble clic (NO con el boton Run Code de VSCode)
REM       porque ese boton redirige stdin/stdout y causa errores con START.
REM =============================================================

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
echo ROOT=%ROOT%

REM Comprobaciones mínimas
where php >nul 2>&1 || echo [WARNING] php no en PATH
where npm >nul 2>&1 || echo [WARNING] npm no en PATH
where ng >nul 2>&1 || echo [WARNING] ng CLI no en PATH

REM -------- Laravel --------
if exist "%ROOT%\TojoBack\artisan" (
	echo [Laravel] Iniciando...
	start "Laravel Backend" /D "%ROOT%\TojoBack" cmd /k php artisan serve
) else (
	echo [Laravel] FALTA: %ROOT%\TojoBack\artisan
)
timeout /t 2 >nul

REM -------- Node MQTT ------
if exist "%ROOT%\Adafruit\package.json" (
	echo [Node MQTT] Iniciando...
	set "INGEST_URL=http://localhost:8000/api/ingest"
	REM set "INGEST_TOKEN=TU_TOKEN_OPCIONAL"
	start "Node MQTT" /D "%ROOT%\Adafruit" cmd /k "set INGEST_URL=%INGEST_URL% && npm run dev"
) else (
	echo [Node MQTT] FALTA: %ROOT%\Adafruit\package.json
)
timeout /t 2 >nul

REM -------- Angular --------
if exist "%ROOT%\TojoFront\angular.json" (
	echo [Angular] Iniciando...
	start "Angular Front" /D "%ROOT%\TojoFront" cmd /k ng serve --open
) else (
	echo [Angular] FALTA: %ROOT%\TojoFront\angular.json
)

echo -------------------------------------------------------------
echo Lanzado. Cierra cada ventana para terminar.
echo Si deseas una version de UNA sola ventana, usa RUN_SINGLE.bat.
echo -------------------------------------------------------------
exit /b 0
