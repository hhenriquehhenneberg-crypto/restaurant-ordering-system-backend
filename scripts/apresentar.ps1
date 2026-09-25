# One-command startup for the Tech Challenge demonstration on Windows.
# Run inside the repository: powershell -ExecutionPolicy Bypass -File .\scripts\apresentar.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Instale Node.js 20 ou superior antes de continuar: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$major = [int]((node --version).TrimStart("v").Split(".")[0])
if ($major -lt 20) {
    Write-Host "Node.js muito antigo. E necessario Node.js 20+." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path ".env")) {
    Write-Host "Primeira execucao: configurar conexao privada do Supabase." -ForegroundColor Yellow
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\setup-windows.ps1"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path ".env")) { throw "A configuracao .env nao foi concluida." }
}
Write-Host "Instalando as dependencias..." -ForegroundColor Cyan
& npm install
if ($LASTEXITCODE -ne 0) { throw "Falha no npm install." }
Write-Host "Validando conexao REAL com PostgreSQL..." -ForegroundColor Cyan
& npm run doctor
if ($LASTEXITCODE -ne 0) {
    Write-Host "O Express ainda nao consegue acessar o banco. Corrija a DATABASE_URL no .env local." -ForegroundColor Red
    exit 1
}
Write-Host "API pronta. No Postman, base_url = http://localhost:3000" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para desligar o servidor." -ForegroundColor Gray
& npm run dev
