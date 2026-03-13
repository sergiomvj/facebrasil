@echo off
echo Iniciando Automação de Analytics Facebrasil...
cd /d %~dp0
node scripts\automate-analytics.js
echo Finalizado.
pause
