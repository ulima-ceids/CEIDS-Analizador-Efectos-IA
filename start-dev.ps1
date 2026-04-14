$ErrorActionPreference = "Stop"

Write-Host "Iniciando EFECTOS-IA (backend + frontend)..." -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $root "efectos-ia"

if (-not (Test-Path (Join-Path $root "src\api\main.py"))) {
  throw "No se encontro src\api\main.py. Ejecuta este script desde la raiz del repo."
}

if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
  throw "No se encontro efectos-ia\package.json."
}

$backendCmd = "Set-Location '$root'; uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000"
$frontendCmd = "Set-Location '$frontendPath'; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null

Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "API docs:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Info API:  http://localhost:8000/docs-info" -ForegroundColor Yellow
