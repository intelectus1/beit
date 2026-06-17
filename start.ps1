Write-Host "Iniciando AulaVirtual..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Servidores iniciados:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Presiona ENTER para cerrar esta ventana..." -ForegroundColor Gray
Read-Host
