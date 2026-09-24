# Execute dentro do repositorio: powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
# O script nao envia credenciais ao GitHub ou ao ChatGPT.
param()
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
if (Test-Path -LiteralPath $envPath) {
    Write-Host "O .env ja existe. Preservado sem alteracoes." -ForegroundColor Yellow
    Write-Host "Para revisar a conexao, edite esse arquivo localmente."
    exit 0
}
Write-Host "=== Configuracao da API no Supabase ==="
Write-Host "Abra o projeto no Supabase > Connect > Connection string > Session pooler."
Write-Host "Cole a URI completa. A entrada ficara oculta na tela."
function Read-SecretText([string] $message) {
    $secure = Read-Host $message -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}
$dbUri = Read-SecretText "URI PostgreSQL privada"
if ([string]::IsNullOrWhiteSpace($dbUri)) { throw "A URI nao pode ser vazia." }
$placeholders = @('[YOUR-PASSWORD]', '[PASSWORD]', '<PASSWORD>', 'YOUR_PASSWORD')
foreach ($placeholder in $placeholders) {
    if ($dbUri.Contains($placeholder)) {
        $dbPass = Read-SecretText "Senha do banco Supabase"
        if ([string]::IsNullOrEmpty($dbPass)) { throw "Senha vazia. Nenhum arquivo criado." }
        $dbUri = $dbUri.Replace($placeholder, [Uri]::EscapeDataString($dbPass))
        $dbPass = $null
    }
}
[uri]$parsedUri = $null
if (-not [uri]::TryCreate($dbUri, [UriKind]::Absolute, [ref]$parsedUri)) {
    throw "URI invalida. Copie a Connection string do Supabase, nao a URL da API."
}
if ($parsedUri.Scheme -notin @('postgres', 'postgresql') -or [string]::IsNullOrWhiteSpace($parsedUri.UserInfo) -or $dbUri.Contains('[YOUR-')) {
    throw "URI PostgreSQL incompleta ou invalida. Nenhum arquivo criado."
}
if ($parsedUri.Host -match '(^|\.)supabase\.(co|com)$' -and $dbUri -notmatch '(?i)(\?|&)sslmode=') {
    $separator = if ($dbUri.Contains('?')) { '&' } else { '?' }
    $dbUri += $separator + 'sslmode=require'
}
[byte[]]$keyBytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($keyBytes) } finally { $rng.Dispose() }
$adminKey = [Convert]::ToBase64String($keyBytes).TrimEnd('=').Replace('+','-').Replace('/','_')
# Cria um arquivo UTF-8 sem BOM, com newline compativel com dotenv.
$contents = "PORT=3000" + [Environment]::NewLine +
    "DATABASE_URL=" + $dbUri + [Environment]::NewLine +
    "ADMIN_API_KEY=" + $adminKey + [Environment]::NewLine
$encoding = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($envPath, $contents, $encoding)
$dbUri = $null
$adminKey = $null
Write-Host "Arquivo .env criado SOMENTE neste computador." -ForegroundColor Green
Write-Host "Agora execute: npm run doctor"
Write-Host "Depois execute: npm run dev"
Write-Host "Para o Postman, obtenha o valor x-admin-key diretamente do .env local."
