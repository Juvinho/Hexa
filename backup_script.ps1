# Script de Backup Automático - Hexa Dashboard
# Este script cria um backup dos arquivos críticos do projeto na pasta BKP
# Uso: .\backup_script.ps1

$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "BKP\Backup_$date"
$sourceDir = Get-Location

Write-Host "Iniciando backup em: $backupDir" -ForegroundColor Cyan

# Cria diretório do backup atual
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Lista de pastas e arquivos críticos para backup
$criticalPaths = @(
    "src",
    "server\src",
    "server\prisma",
    "public",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "server\package.json",
    "server\tsconfig.json",
    ".env.example",
    "server\.env.example"
)

foreach ($path in $criticalPaths) {
    $fullPath = Join-Path $sourceDir $path
    if (Test-Path $fullPath) {
        $destPath = Join-Path $backupDir $path
        
        # Cria a estrutura de pastas no destino se não existir
        $parentDest = Split-Path $destPath -Parent
        if (!(Test-Path $parentDest)) {
            New-Item -Path $parentDest -ItemType Directory -Force | Out-Null
        }

        Copy-Item -Path $fullPath -Destination $destPath -Recurse -Force
        Write-Host "  [OK] $path copiado." -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $path não encontrado." -ForegroundColor Yellow
    }
}

Write-Host "Backup concluído com sucesso em $backupDir" -ForegroundColor Cyan
