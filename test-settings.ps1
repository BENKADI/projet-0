# Script de test pour la page Settings
# Usage: .\test-settings.ps1

Write-Host "🔍 Diagnostic de la Page Settings" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier les fichiers créés
Write-Host "📁 Vérification des fichiers..." -ForegroundColor Yellow

$files = @(
    "frontend\src\lib\axios.ts",
    "frontend\src\components\settings\GeneralSettings.tsx",
    "frontend\src\components\settings\ProfileSettings.tsx",
    "frontend\src\components\settings\AppearanceSettings.tsx",
    "frontend\src\components\settings\NotificationSettings.tsx",
    "frontend\src\components\settings\SecuritySettings.tsx",
    "frontend\src\components\settings\SystemSettings.tsx",
    "frontend\src\pages\SettingsPage.tsx",
    "backend\src\controllers\settings.controller.ts",
    "backend\src\routes\settingsRoutes.ts"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MANQUANT" -ForegroundColor Red
        $allExist = $false
    }
}

Write-Host ""

# 2. Vérifier la configuration
Write-Host "⚙️ Vérification configuration..." -ForegroundColor Yellow

if (Test-Path "frontend\.env") {
    $envContent = Get-Content "frontend\.env" -Raw
    if ($envContent -match "VITE_API_URL=http://localhost:3000") {
        Write-Host "  ✅ VITE_API_URL configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ VITE_API_URL pas sur :3000" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ .env manquant" -ForegroundColor Red
}

Write-Host ""

# 3. Vérifier les processus Node
Write-Host "🚀 Vérification des serveurs..." -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  ✅ Processus Node actifs: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Aucun processus Node actif" -ForegroundColor Yellow
    Write-Host "     Démarrez backend et frontend!" -ForegroundColor Gray
}

Write-Host ""

# 4. Tester les ports
Write-Host "🔌 Test des ports..." -ForegroundColor Yellow

function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

if (Test-Port 3000) {
    Write-Host "  ✅ Port 3000 (Backend) actif" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 3000 (Backend) inactif" -ForegroundColor Red
}

if (Test-Port 3001) {
    Write-Host "  ✅ Port 3001 (Frontend) actif" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 3001 (Frontend) inactif" -ForegroundColor Red
}

Write-Host ""

# 5. Vérifier l'instance axios
Write-Host "📦 Vérification axios..." -ForegroundColor Yellow

if (Test-Path "frontend\src\lib\axios.ts") {
    $axiosContent = Get-Content "frontend\src\lib\axios.ts" -Raw
    if ($axiosContent -match "import\.meta\.env\.VITE_API_URL") {
        Write-Host "  ✅ Instance axios configurée" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Configuration axios incomplète" -ForegroundColor Yellow
    }
    
    if ($axiosContent -match "localStorage\.getItem\('token'\)") {
        Write-Host "  ✅ Intercepteur JWT configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Intercepteur JWT manquant" -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. Résumé
Write-Host "📊 Résumé" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan

if ($allExist) {
    Write-Host "✅ Tous les fichiers nécessaires sont présents" -ForegroundColor Green
} else {
    Write-Host "❌ Certains fichiers manquent" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Si les serveurs ne sont pas actifs:" -ForegroundColor Gray
Write-Host "     Terminal 1: cd backend; npm run dev" -ForegroundColor Gray
Write-Host "     Terminal 2: cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Ouvrir dans le navigateur:" -ForegroundColor Gray
Write-Host "     http://localhost:3001/settings" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Consulter la documentation:" -ForegroundColor Gray
Write-Host "     SETTINGS_FIX.md" -ForegroundColor Gray
Write-Host ""

# Test connexion API (optionnel)
Write-Host "🌐 Test connexion API (optionnel)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ API Backend répond" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        Write-Host "     Status: $($json.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️ API Backend ne répond pas" -ForegroundColor Yellow
    Write-Host "     Demarrez le backend avec: cd backend; npm run dev" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Diagnostic termine!" -ForegroundColor Green
