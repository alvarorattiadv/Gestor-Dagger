@echo off
title Gestor Dagger - Servidor (nao feche esta janela)
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ============================================
echo   Gestor Dagger - iniciando o programa...
echo ============================================
echo.
echo Esta janela precisa ficar aberta enquanto voce usa o app.
echo Para PARAR o programa, so fechar esta janela.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:5173/campanha'"

"C:\Program Files\nodejs\npm.cmd" run dev

echo.
echo O servidor foi encerrado. Pode fechar esta janela.
pause >nul
