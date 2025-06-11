# Script PowerShell pour gérer l'application GMP Digital Print
# Menu interactif numéroté pour faciliter l'utilisation

$backendPath = "D:\project\gmpdigitalprint\backend"
$frontendPath = "D:\project\gmpdigitalprint\frontend"
$backendPort = 3000
$frontendPort = 3001
$dbStudioPort = 5555

# Fonction pour vérifier si un port est occupé
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
                  Where-Object { $_.LocalPort -eq $Port }
    
    if ($connections) {
        return $true
    }
    else {
        return $false
    }
}

# Fonction pour arrêter un processus sur un port spécifique
function Stop-ProcessOnPort {
    param (
        [int]$Port,
        [string]$ServiceName
    )
    
    Write-Host "Arrêt de $ServiceName sur le port $Port..." -ForegroundColor Yellow
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
                  Where-Object { $_.LocalPort -eq $Port }
    
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Arrêt du processus $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force
                Write-Host "$ServiceName arrêté avec succès." -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "$ServiceName n'est pas en cours d'exécution sur le port $Port." -ForegroundColor Cyan
    }
}

# Fonction pour démarrer le serveur backend
function Start-Backend {
    Write-Host "Démarrage du serveur backend..." -ForegroundColor Cyan
    
    if (Test-PortInUse -Port $backendPort) {
        Write-Host "Le port $backendPort est déjà utilisé. Arrêt du processus actuel..." -ForegroundColor Yellow
        Stop-ProcessOnPort -Port $backendPort -ServiceName "Backend"
    }
    
    Push-Location $backendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
    Pop-Location
    
    Write-Host "Serveur backend démarré sur http://localhost:$backendPort" -ForegroundColor Green
}

# Fonction pour démarrer le serveur frontend
function Start-Frontend {
    Write-Host "Démarrage du serveur frontend..." -ForegroundColor Cyan
    
    if (Test-PortInUse -Port $frontendPort) {
        Write-Host "Le port $frontendPort est déjà utilisé. Arrêt du processus actuel..." -ForegroundColor Yellow
        Stop-ProcessOnPort -Port $frontendPort -ServiceName "Frontend"
    }
    
    Push-Location $frontendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
    Pop-Location
    
    Write-Host "Serveur frontend démarré sur http://localhost:$frontendPort" -ForegroundColor Green
}

# Fonction pour démarrer Prisma Studio
function Start-DbStudio {
    Write-Host "Démarrage de Prisma Studio..." -ForegroundColor Cyan
    
    if (Test-PortInUse -Port $dbStudioPort) {
        Write-Host "Le port $dbStudioPort est déjà utilisé. Arrêt du processus actuel..." -ForegroundColor Yellow
        Stop-ProcessOnPort -Port $dbStudioPort -ServiceName "Prisma Studio"
    }
    
    Push-Location $backendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npx prisma studio" -WindowStyle Normal
    Pop-Location
    
    Write-Host "Prisma Studio démarré sur http://localhost:$dbStudioPort" -ForegroundColor Green
}

# Fonction pour afficher le menu
function Show-Menu {
    Clear-Host
    Write-Host "========== Application GMP Digital Print ==========" -ForegroundColor Cyan
    Write-Host "1. Démarrer l'application (Backend + Frontend)" -ForegroundColor Green
    Write-Host "2. Arrêter l'application" -ForegroundColor Red
    Write-Host "3. Redémarrer l'application" -ForegroundColor Yellow
    Write-Host "4. Démarrer Prisma Studio (interface BDD)" -ForegroundColor Magenta
    Write-Host "5. Quitter" -ForegroundColor Gray
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host
}

# Boucle principale du menu
do {
    Show-Menu
    $choice = Read-Host "Entrez votre choix (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host "Démarrage de l'application complète..." -ForegroundColor Blue
            Start-Backend
            Start-Sleep -Seconds 2
            Start-Frontend
            Write-Host "Application démarrée avec succès !" -ForegroundColor Green
            Write-Host "Backend: http://localhost:$backendPort" -ForegroundColor Green
            Write-Host "Frontend: http://localhost:$frontendPort" -ForegroundColor Green
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "2" {
            Write-Host "Arrêt de l'application complète..." -ForegroundColor Blue
            Stop-ProcessOnPort -Port $backendPort -ServiceName "Backend"
            Stop-ProcessOnPort -Port $frontendPort -ServiceName "Frontend"
            Stop-ProcessOnPort -Port $dbStudioPort -ServiceName "Prisma Studio"
            Write-Host "Application arrêtée avec succès !" -ForegroundColor Green
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "3" {
            Write-Host "Redémarrage de l'application complète..." -ForegroundColor Blue
            Stop-ProcessOnPort -Port $backendPort -ServiceName "Backend"
            Stop-ProcessOnPort -Port $frontendPort -ServiceName "Frontend"
            Start-Sleep -Seconds 2
            Start-Backend
            Start-Sleep -Seconds 2
            Start-Frontend
            Write-Host "Application redémarrée avec succès !" -ForegroundColor Green
            Write-Host "Backend: http://localhost:$backendPort" -ForegroundColor Green
            Write-Host "Frontend: http://localhost:$frontendPort" -ForegroundColor Green
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "4" {
            Start-DbStudio
            Write-Host "Prisma Studio démarré sur http://localhost:$dbStudioPort" -ForegroundColor Green
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "5" {
            Write-Host "Au revoir !" -ForegroundColor Cyan
            exit
        }
        default {
            Write-Host "Option invalide. Veuillez choisir un numéro entre 1 et 5." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
