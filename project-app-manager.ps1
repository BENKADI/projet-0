# Script PowerShell pour gérer l'application Projet-0
# Menu interactif numéroté pour faciliter l'utilisation

if ($PSVersionTable.PSEdition -eq "Desktop") {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} else {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $PSStyle.OutputRendering = "Ansi"
}

$backendPath = "c:\project\projet-0\backend"
$frontendPath = "c:\project\projet-0\frontend"
$rootPath = "c:\project\projet-0"
$backupPath = "c:\project\projet-0\backups"
$backendPort = 3000
$frontendPort = 3001
$dbStudioPort = 5555

# Couleurs pour les messages
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Primary = "Blue"
    Secondary = "Magenta"
    Muted = "Gray"
}

# Fonction pour afficher un message avec couleur et icône
function Write-Message {
    param(
        [string]$Message,
        [string]$Type = "Info",
        [string]$Icon = ""
    )

    $color = $Colors[$Type]
    if ($Icon) {
        Write-Host "$Icon $Message" -ForegroundColor $color
    } else {
        Write-Host $Message -ForegroundColor $color
    }
}

# Fonction pour vérifier si un port est occupé
function Test-PortInUse {
    param (
        [int]$Port
    )

    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
                  Where-Object { $_.LocalPort -eq $Port }

    return $connections -ne $null
}

# Fonction pour vérifier les dépendances Node.js
function Test-Dependencies {
    param(
        [string]$Path,
        [string]$ServiceName
    )

    Write-Message "Vérification des dépendances pour $ServiceName..." "Info" "🔍"

    if (-not (Test-Path "$Path\node_modules")) {
        Write-Message "Les dépendances ne sont pas installées pour $ServiceName" "Warning" "⚠️"
        $install = Read-Host "Voulez-vous installer les dépendances ? (O/n)"
        if ($install -eq "" -or $install -eq "O" -or $install -eq "o") {
            Push-Location $Path
            Write-Message "Installation des dépendances..." "Info" "📦"
            npm install
            Pop-Location
            Write-Message "Dépendances installées avec succès !" "Success" "✅"
        }
    } else {
        Write-Message "Dépendances OK pour $ServiceName" "Success" "✅"
    }
}

# Fonction pour nettoyer les caches
function Clear-ProjectCache {
    Write-Message "Nettoyage des caches..." "Info" "🧹"

    # Nettoyage frontend
    if (Test-Path "$frontendPath\node_modules\.vite") {
        Remove-Item -Recurse -Force "$frontendPath\node_modules\.vite"
        Write-Message "Cache Vite nettoyé" "Success" "✅"
    }

    if (Test-Path "$frontendPath\dist") {
        Remove-Item -Recurse -Force "$frontendPath\dist"
        Write-Message "Dossier dist nettoyé" "Success" "✅"
    }

    # Nettoyage backend
    if (Test-Path "$backendPath\dist") {
        Remove-Item -Recurse -Force "$backendPath\dist"
        Write-Message "Dossier dist backend nettoyé" "Success" "✅"
    }

    Write-Message "Nettoyage terminé !" "Success" "🎉"
}

# Fonction pour détecter PostgreSQL
function Test-PostgreSQL {
    # Vérifier si pg_dump est disponible dans le PATH
    $pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
    if ($pgDump) {
        return @{
            Available = $true
            Path = $pgDump.Source
            Version = (pg_dump --version 2>&1 | Out-String).Trim()
        }
    }

    # Chercher dans les emplacements courants
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe",
        "C:\Program Files (x86)\PostgreSQL\16\bin\pg_dump.exe",
        "C:\Program Files (x86)\PostgreSQL\15\bin\pg_dump.exe"
    )

    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            # Ajouter temporairement au PATH
            $pgBinPath = Split-Path $path
            $env:Path = "$pgBinPath;$env:Path"

            return @{
                Available = $true
                Path = $path
                Version = (& $path --version 2>&1 | Out-String).Trim()
                AddedToPath = $true
            }
        }
    }

    return @{
        Available = $false
        Path = $null
        Version = $null
    }
}

# Fonction pour faire un backup JSON de la base de données avec Prisma
function Backup-DatabaseJSON {
    param(
        [string]$OutputPath
    )

    Write-Message "Export JSON de la base de données avec Prisma..." "Info" "📊"

    Push-Location $backendPath

    try {
        # Créer un script Node.js temporaire pour exporter les données
        $exportScript = @"
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
    try {
        const data = {
            users: await prisma.user.findMany({ include: { permissions: true } }),
            permissions: await prisma.permission.findMany(),
            exportDate: new Date().toISOString()
        };

        fs.writeFileSync('$($OutputPath -replace '\\', '\\')', JSON.stringify(data, null, 2), 'utf-8');
        console.log('Export JSON réussi');
    } catch (error) {
        console.error('Erreur export:', error);
        process.exit(1);
    } finally {
        await prisma.`$disconnect();
    }
}

exportData();
"@

        # Créer le script dans le dossier backend pour avoir accès à node_modules
        $tempScriptPath = Join-Path $backendPath "export-db-temp.js"
        $exportScript | Out-File -FilePath $tempScriptPath -Encoding utf8

        # Exécuter le script depuis le dossier backend
        node $tempScriptPath

        Remove-Item $tempScriptPath -ErrorAction SilentlyContinue

        if (Test-Path $OutputPath) {
            $size = [Math]::Round((Get-Item $OutputPath).Length / 1KB, 2)
            Write-Message "Export JSON réussi ! (${size} KB)" "Success" "✅"
            return $true
        }
    } catch {
        Write-Message "Erreur lors de l'export JSON : $_" "Error" "❌"
        return $false
    } finally {
        Pop-Location
    }

    return $false
}

# Fonction pour afficher les logs des services
function Show-ServiceLogs {
    Write-Message "=== Logs des Services ===" "Info"
    Write-Host "1. Logs Backend" -ForegroundColor $Colors.Warning
    Write-Host "2. Logs Frontend" -ForegroundColor $Colors.Warning
    Write-Host "3. Logs Base de données" -ForegroundColor $Colors.Warning
    Write-Host "4. Retour au menu principal" -ForegroundColor $Colors.Muted
    Write-Message "========================" "Info"

    $logChoice = Read-Host "`nEntrez votre choix (1-4)"

    switch ($logChoice) {
        "1" {
            if (Test-Path "$backendPath\logs") {
                Get-ChildItem "$backendPath\logs" -Name | ForEach-Object {
                    Write-Host "📄 $_" -ForegroundColor $Colors.Info
                }
            } else {
                Write-Message "Aucun fichier de log trouvé pour le backend" "Warning" "⚠️"
            }
        }
        "2" {
            Write-Message "Les logs du frontend sont affichés dans la console de développement" "Info" "ℹ️"
        }
        "3" {
            # Afficher les dernières migrations
            if (Test-Path "$backendPath\prisma\migrations") {
                Write-Message "Dernières migrations :" "Info" "📊"
                Get-ChildItem "$backendPath\prisma\migrations" -Directory |
                Sort-Object CreationTime -Descending |
                Select-Object -First 5 |
                ForEach-Object {
                    Write-Host "  📁 $($_.Name)" -ForegroundColor $Colors.Info
                }
            }
        }
        "4" {
            return
        }
    }

    Read-Host "`nAppuyez sur Entrée pour continuer"
}

# Fonction pour arrêter un processus sur un port spécifique
function Stop-ProcessOnPort {
    param (
        [int]$Port,
        [string]$ServiceName
    )

    Write-Message "Arrêt de $ServiceName sur le port $Port..." "Warning" "🛑"
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
                  Where-Object { $_.LocalPort -eq $Port }

    if ($connections) {
        foreach ($conn in $connections) {
            try {
                $owningProcess = $conn.OwningProcess
                if ($owningProcess) {
                    $process = Get-Process -Id $owningProcess -ErrorAction SilentlyContinue

                    # Liste des processus système à ignorer
                    $systemProcesses = @("Idle", "System", "Registry", "smss", "csrss", "wininit", "services", "lsass")

                    # Vérifier si ce n'est pas un processus système protégé
                    if ($process -and $process.Id -gt 4 -and $systemProcesses -notcontains $process.ProcessName) {
                        Write-Message "Arrêt du processus $($process.ProcessName) (PID: $($process.Id))" "Warning" "⏹️"
                        try {
                            Stop-Process -Id $process.Id -Force -ErrorAction Stop
                            Write-Message "$ServiceName arrêté avec succès." "Success" "✅"
                        } catch {
                            Write-Message "Impossible d'arrêter le processus $($process.ProcessName) (PID: $($process.Id)): $($_.Exception.Message)" "Error" "❌"
                        }
                    } else {
                        Write-Message "Processus système détecté ($($process.ProcessName), PID: $($process.Id)), ignoré." "Secondary" "🔒"
                    }
                }
            } catch {
                Write-Message "Erreur lors de l'identification du processus: $($_.Exception.Message)" "Error" "❌"
            }
        }
    }
    else {
        Write-Message "$ServiceName n'est pas en cours d'exécution sur le port $Port." "Info" "ℹ️"
    }
}

# Fonction pour démarrer le serveur backend
function Start-Backend {
    Write-Message "Démarrage du serveur backend..." "Info" "🚀"

    # Vérifier les dépendances
    Test-Dependencies -Path $backendPath -ServiceName "Backend"

    if (Test-PortInUse -Port $backendPort) {
        Write-Message "Le port $backendPort est déjà utilisé. Arrêt du processus actuel..." "Warning" "⚠️"
        Stop-ProcessOnPort -Port $backendPort -ServiceName "Backend"
        Start-Sleep -Seconds 2
    }

    Push-Location $backendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal
    Pop-Location

    Write-Message "Serveur backend démarré sur http://localhost:$backendPort" "Success" "🌐"
}

# Fonction pour démarrer le serveur frontend
function Start-Frontend {
    Write-Message "Démarrage du serveur frontend..." "Info" "🚀"

    # Vérifier les dépendances
    Test-Dependencies -Path $frontendPath -ServiceName "Frontend"

    if (Test-PortInUse -Port $frontendPort) {
        Write-Message "Le port $frontendPort est déjà utilisé. Arrêt du processus actuel..." "Warning" "⚠️"
        Stop-ProcessOnPort -Port $frontendPort -ServiceName "Frontend"
        Start-Sleep -Seconds 2
    }

    Push-Location $frontendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
    Pop-Location

    Write-Message "Serveur frontend démarré sur http://localhost:$frontendPort" "Success" "🌐"
}

# Fonction pour ouvrir le navigateur
function Open-Browser {
    param (
        [string]$Url = "http://localhost:$frontendPort"
    )

    Write-Message "Ouverture du navigateur..." "Info" "🌐"
    Start-Sleep -Seconds 5  # Attendre que le serveur soit prêt
    Start-Process $Url
    Write-Message "Navigateur ouvert sur $Url" "Success" "✅"
}

# Fonction pour démarrer Prisma Studio
function Start-DbStudio {
    Write-Message "Démarrage de Prisma Studio..." "Info" "🚀"

    if (Test-PortInUse -Port $dbStudioPort) {
        Write-Message "Le port $dbStudioPort est déjà utilisé. Arrêt du processus actuel..." "Warning" "⚠️"
        Stop-ProcessOnPort -Port $dbStudioPort -ServiceName "Prisma Studio"
        Start-Sleep -Seconds 2
    }

    Push-Location $backendPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npx prisma studio" -WindowStyle Normal
    Pop-Location

    Write-Message "Prisma Studio démarré sur http://localhost:$dbStudioPort" "Success" "🌐"
}

# Fonction pour gérer la base de données
function Manage-Database {
    Write-Message "`n=== Gestion de la Base de Données ===" "Info"
    Write-Host "1. Appliquer les migrations" -ForegroundColor $Colors.Warning
    Write-Host "2. Réinitialiser la base de données" -ForegroundColor $Colors.Warning
    Write-Host "3. Générer le client Prisma" -ForegroundColor $Colors.Warning
    Write-Host "4. Voir le statut des migrations" -ForegroundColor $Colors.Warning
    Write-Host "5. Créer une nouvelle migration" -ForegroundColor $Colors.Warning
    Write-Host "6. Retour au menu principal" -ForegroundColor $Colors.Muted
    Write-Message "=================================" "Info"

    $dbChoice = Read-Host "`nEntrez votre choix (1-6)"

    switch ($dbChoice) {
        "1" {
            Push-Location $backendPath
            Write-Message "Application des migrations..." "Info" "📊"
            npx prisma migrate deploy
            Write-Message "Migrations appliquées !" "Success" "✅"
            Pop-Location
        }
        "2" {
            $confirm = Read-Host "⚠️  Êtes-vous sûr de vouloir réinitialiser la base de données ? (tapez 'OUI' pour confirmer)"
            if ($confirm -eq "OUI") {
                Push-Location $backendPath
                Write-Message "Réinitialisation de la base de données..." "Warning" "🔄"
                npx prisma migrate reset --force
                Write-Message "Base de données réinitialisée !" "Success" "✅"
                Pop-Location
            }
        }
        "3" {
            Push-Location $backendPath
            Write-Message "Génération du client Prisma..." "Info" "⚙️"
            npx prisma generate
            Write-Message "Client Prisma généré !" "Success" "✅"
            Pop-Location
        }
        "4" {
            Push-Location $backendPath
            Write-Message "Statut des migrations :" "Info" "📊"
            npx prisma migrate status
            Pop-Location
        }
        "5" {
            $migrationName = Read-Host "Nom de la migration"
            if ($migrationName) {
                Push-Location $backendPath
                Write-Message "Création de la migration '$migrationName'..." "Info" "📝"
                npx prisma migrate dev --name $migrationName
                Write-Message "Migration créée !" "Success" "✅"
                Pop-Location
            }
        }
        "6" {
            return
        }
        default {
            Write-Message "Option invalide" "Error" "❌"
        }
    }

    Read-Host "`nAppuyez sur Entrée pour continuer"
}

# Fonction pour gérer les ports
function Manage-Ports {
    Write-Message "`n=== Gestion des Ports ===" "Info"
    Write-Host "1. Vérifier les ports utilisés" -ForegroundColor $Colors.Warning
    Write-Host "2. Libérer un port spécifique" -ForegroundColor $Colors.Warning
    Write-Host "3. Libérer tous les ports de l'application" -ForegroundColor $Colors.Warning
    Write-Host "4. Retour au menu principal" -ForegroundColor $Colors.Muted
    Write-Message "=========================" "Info"

    $portChoice = Read-Host "`nEntrez votre choix (1-4)"

    switch ($portChoice) {
        "1" {
            Write-Message "`nÉtat des ports :" "Info" "🔍"

            $ports = @(
                @{Name="Backend"; Port=3000},
                @{Name="Frontend"; Port=3001},
                @{Name="Prisma Studio"; Port=5555}
            )

            foreach ($portInfo in $ports) {
                $isUsed = Test-PortInUse -Port $portInfo.Port
                if ($isUsed) {
                    $conn = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
                           Where-Object { $_.LocalPort -eq $portInfo.Port } | Select-Object -First 1
                    $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    Write-Message "$($portInfo.Name) ($($portInfo.Port)) : Utilisé par $($process.ProcessName) (PID: $($process.Id))" "Error" "🔴"
                } else {
                    Write-Message "$($portInfo.Name) ($($portInfo.Port)) : Libre" "Success" "🟢"
                }
            }
        }
        "2" {
            $portToFree = Read-Host "Entrez le numéro du port à libérer"
            try {
                $portToFree = [int]$portToFree
                Stop-ProcessOnPort -Port $portToFree -ServiceName "Port $portToFree"
            } catch {
                Write-Message "Port invalide" "Error" "❌"
            }
        }
        "3" {
            Write-Message "Libération de tous les ports de l'application..." "Warning" "🧹"
            Stop-ProcessOnPort -Port 3000 -ServiceName "Backend"
            Stop-ProcessOnPort -Port 3001 -ServiceName "Frontend"
            Stop-ProcessOnPort -Port 5555 -ServiceName "Prisma Studio"
            Write-Message "Tous les ports ont été libérés !" "Success" "✅"
        }
        "4" {
            return
        }
        default {
            Write-Message "Option invalide" "Error" "❌"
        }
    }

    Read-Host "`nAppuyez sur Entrée pour continuer"
}

# Fonction pour gérer Git
function Manage-Git {
    Write-Message "`n=== Gestion Git ===" "Info"
    Write-Host "1. Statut Git (git status)" -ForegroundColor $Colors.Warning
    Write-Host "2. Voir les derniers commits (git log)" -ForegroundColor $Colors.Warning
    Write-Host "3. Créer un commit (git add + commit)" -ForegroundColor $Colors.Warning
    Write-Host "4. Push vers GitHub (git push)" -ForegroundColor $Colors.Warning
    Write-Host "5. Pull depuis GitHub (git pull)" -ForegroundColor $Colors.Warning
    Write-Host "6. Voir les branches (git branch)" -ForegroundColor $Colors.Warning
    Write-Host "7. Créer une nouvelle branche" -ForegroundColor $Colors.Warning
    Write-Host "8. Changer de branche (git checkout)" -ForegroundColor $Colors.Warning
    Write-Host "9. Différences (git diff)" -ForegroundColor $Colors.Warning
    Write-Host "10. Retour au menu principal" -ForegroundColor $Colors.Muted
    Write-Message "==================" "Info"

    $gitChoice = Read-Host "`nEntrez votre choix (1-10)"

    Push-Location $rootPath

    switch ($gitChoice) {
        "1" {
            Write-Message "Statut Git :" "Info" "📊"
            git status
        }
        "2" {
            Write-Message "Derniers commits :" "Info" "📝"
            git log --oneline -10 --decorate --graph
        }
        "3" {
            Write-Message "Fichiers modifiés :" "Info" "📝"
            git status --short
            Write-Host ""
            $addAll = Read-Host "Ajouter tous les fichiers modifiés ? (O/n)"

            if ($addAll -eq "" -or $addAll -eq "O" -or $addAll -eq "o") {
                git add .
                Write-Message "Tous les fichiers ajoutés" "Success" "✅"
            } else {
                $files = Read-Host "Entrez le(s) fichier(s) à ajouter (séparés par des espaces)"
                if ($files) {
                    git add $files.Split(" ")
                    Write-Message "Fichiers ajoutés" "Success" "✅"
                }
            }

            $commitMsg = Read-Host "Message du commit"
            if ($commitMsg) {
                git commit -m $commitMsg
                Write-Message "Commit créé avec succès !" "Success" "✅"
            }
        }
        "4" {
            Write-Message "Push vers GitHub..." "Info" "🚀"
            $branch = git rev-parse --abbrev-ref HEAD
            Write-Message "Branche actuelle : $branch" "Info" "🌿"
            $confirm = Read-Host "Confirmer le push vers origin/$branch ? (O/n)"

            if ($confirm -eq "" -or $confirm -eq "O" -or $confirm -eq "o") {
                git push origin $branch
                Write-Message "Push effectué avec succès !" "Success" "✅"
            }
        }
        "5" {
            Write-Message "Pull depuis GitHub..." "Info" "⬇️"
            $branch = git rev-parse --abbrev-ref HEAD
            Write-Message "Branche actuelle : $branch" "Info" "🌿"
            git pull origin $branch
            Write-Message "Pull effectué avec succès !" "Success" "✅"
        }
        "6" {
            Write-Message "Branches Git :" "Info" "🌿"
            git branch -a
        }
        "7" {
            $branchName = Read-Host "Nom de la nouvelle branche"
            if ($branchName) {
                git checkout -b $branchName
                Write-Message "Branche '$branchName' créée et activée !" "Success" "✅"
            }
        }
        "8" {
            Write-Message "Branches disponibles :" "Info" "🌿"
            git branch
            Write-Host ""
            $branchName = Read-Host "Nom de la branche à activer"
            if ($branchName) {
                git checkout $branchName
                Write-Message "Branche '$branchName' activée !" "Success" "✅"
            }
        }
        "9" {
            Write-Message "Différences (non commitées) :" "Info" "📊"
            git diff
        }
        "10" {
            Pop-Location
            return
        }
        default {
            Write-Message "Option invalide" "Error" "❌"
        }
    }

    Pop-Location
    Read-Host "`nAppuyez sur Entrée pour continuer"
}

# Fonction pour créer un backup complet
function Create-Backup {
    Write-Message "`n=== Création de Backup ===" "Info"

    # Créer le dossier de backup s'il n'existe pas
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath | Out-Null
        Write-Message "Dossier de backup créé : $backupPath" "Success" "📁"
    }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = "projet0_backup_$timestamp"
    $backupFolder = Join-Path $backupPath $backupName

    Write-Host "1. Backup complet (Application + Base de données)" -ForegroundColor $Colors.Warning
    Write-Host "2. Backup Application uniquement (ZIP)" -ForegroundColor $Colors.Warning
    Write-Host "3. Backup Base de données uniquement (SQL)" -ForegroundColor $Colors.Warning
    Write-Host "4. Retour au menu principal" -ForegroundColor $Colors.Muted
    Write-Message "==============================================" "Info"

    $backupChoice = Read-Host "`nEntrez votre choix (1-4)"

    switch ($backupChoice) {
        "1" {
            Write-Message "Création d'un backup complet..." "Primary" "💾"

            # Créer le dossier de backup
            New-Item -ItemType Directory -Path $backupFolder | Out-Null

            # 1. Backup de l'application (ZIP)
            Write-Message "Compression de l'application..." "Info" "📦"
            $appZipPath = Join-Path $backupFolder "application.zip"

            $excludePaths = @(
                "node_modules",
                "dist",
                ".vite",
                "logs",
                "backups",
                ".git"
            )

            # Utiliser 7zip si disponible, sinon Compress-Archive
            if (Get-Command 7z -ErrorAction SilentlyContinue) {
                $excludeArgs = $excludePaths | ForEach-Object { "-xr!$_" }
                & 7z a -tzip $appZipPath "$rootPath\*" $excludeArgs
            } else {
                # Fallback avec Compress-Archive (copie temporaire puis compression)
                Write-Message "Préparation des fichiers à compresser (ignorant node_modules, dist, etc.)..." "Info" "🔍"

                $tempFolder = Join-Path $env:TEMP "projet0_backup_temp_$(Get-Date -Format 'yyyyMMddHHmmss')"
                New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null

                try {
                    # Fonction de copie récursive avec exclusions
                    function Copy-WithExclusions {
                        param($Source, $Destination, $Excludes)

                        # Copier les fichiers du dossier actuel
                        Get-ChildItem -Path $Source -File -ErrorAction SilentlyContinue | ForEach-Object {
                            Copy-Item -Path $_.FullName -Destination $Destination -Force
                        }

                        # Copier les sous-dossiers (sauf ceux exclus)
                        Get-ChildItem -Path $Source -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                            if ($Excludes -notcontains $_.Name) {
                                $destSubFolder = Join-Path $Destination $_.Name
                                New-Item -ItemType Directory -Path $destSubFolder -Force | Out-Null
                                Copy-WithExclusions -Source $_.FullName -Destination $destSubFolder -Excludes $Excludes
                            } else {
                                Write-Host "  ⏭️  Ignoré : $($_.Name)" -ForegroundColor DarkGray
                            }
                        }
                    }

                    # Copier les fichiers en excluant les dossiers non désirés
                    Copy-WithExclusions -Source $rootPath -Destination $tempFolder -Excludes $excludePaths

                    Write-Message "Compression du dossier temporaire..." "Info" "📦"
                    Compress-Archive -Path "$tempFolder\*" -DestinationPath $appZipPath -CompressionLevel Optimal -Force

                } finally {
                    # Nettoyer le dossier temporaire
                    if (Test-Path $tempFolder) {
                        Remove-Item -Path $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
                    }
                }
            }
            Write-Message "Application compressée !" "Success" "✅"

            # 2. Backup de la base de données
            Write-Message "Export de la base de données..." "Info" "🗄️"

            # Détecter PostgreSQL
            $pgStatus = Test-PostgreSQL
            $sqlExportSuccess = $false
            $jsonExportSuccess = $false

            if ($pgStatus.Available) {
                Write-Message "PostgreSQL détecté : $($pgStatus.Version)" "Success" "✅"

                if ($pgStatus.AddedToPath) {
                    Write-Message "pg_dump ajouté temporairement au PATH" "Info" "ℹ️"
                }

                # Export SQL
                Push-Location $backendPath
                $dbSqlPath = Join-Path $backupFolder "database_dump.sql"
                $env:PGPASSWORD = "TOUFIK90"

                try {
                    pg_dump -h localhost -U postgres -d PROJECT_0 -f $dbSqlPath 2>$null

                    if ((Test-Path $dbSqlPath) -and (Get-Item $dbSqlPath).Length -gt 0) {
                        $sqlSize = [Math]::Round((Get-Item $dbSqlPath).Length / 1KB, 2)
                        Write-Message "Base de données exportée (SQL) ! (${sqlSize} KB)" "Success" "✅"
                        $sqlExportSuccess = $true
                    }
                } catch {
                    Write-Message "Erreur lors de l'export SQL : $_" "Error" "❌"
                }

                Pop-Location
            } else {
                Write-Message "PostgreSQL non détecté dans le PATH" "Warning" "⚠️"
                Write-Message "Utilisation du backup JSON alternatif..." "Info" "💡"
            }

            # Export JSON alternatif (toujours effectué comme backup de secours)
            $dbJsonDataPath = Join-Path $backupFolder "database_data.json"
            $jsonExportSuccess = Backup-DatabaseJSON -OutputPath $dbJsonDataPath

            # Export schéma Prisma
            Push-Location $backendPath
            $dbSchemaPath = Join-Path $backupFolder "database_schema.prisma"

            if (Test-Path "prisma\schema.prisma") {
                Copy-Item "prisma\schema.prisma" $dbSchemaPath
                Write-Message "Schéma Prisma copié !" "Success" "✅"
            }

            Pop-Location

            # Afficher un résumé de l'export
            if ($sqlExportSuccess -and $jsonExportSuccess) {
                Write-Message "Backup base de données complet : SQL + JSON !" "Success" "🎉"
            } elseif ($sqlExportSuccess) {
                Write-Message "Backup base de données : SQL uniquement" "Success" "✅"
            } elseif ($jsonExportSuccess) {
                Write-Message "Backup base de données : JSON uniquement (alternative)" "Warning" "⚠️"
            } else {
                Write-Message "Échec du backup de la base de données" "Error" "❌"
            }

            # 3. Créer un fichier d'information
            $infoPath = Join-Path $backupFolder "backup_info.txt"
            $backupInfo = @"
Projet-0 - Backup Complet
====================================
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Version: $timestamp

Contenu du backup:
- application.zip : Code source complet (sans node_modules, dist, .git)
- database_schema.prisma : Schéma Prisma
"@

            if ($sqlExportSuccess) {
                $backupInfo += "`n- database_dump.sql : Export SQL complet de la base de données"
            }

            if ($jsonExportSuccess) {
                $backupInfo += "`n- database_data.json : Export JSON des données (toutes les tables)"
            }

            $backupInfo += @"

- backup_info.txt : Ce fichier

====================================
RESTAURATION
====================================

📦 Étape 1 : Extraire l'application
--------------------------------------
1. Décompresser application.zip dans un nouveau dossier
2. Ouvrir PowerShell/Terminal dans ce dossier

📚 Étape 2 : Installer les dépendances
--------------------------------------
cd backend
npm install

cd ../frontend
npm install

🗄️ Étape 3 : Restaurer la base de données
--------------------------------------

"@

            if ($sqlExportSuccess) {
                $backupInfo += @"
MÉTHODE A : Restauration SQL (recommandée)
-------------------------------------------
# Créer la base de données si elle n'existe pas
psql -U postgres -c "CREATE DATABASE PROJECT_0;"

# Restaurer les données
psql -U postgres -d PROJECT_0 -f database_dump.sql

# Appliquer les migrations
cd backend
npx prisma generate
npx prisma migrate deploy

"@
            }

            if ($jsonExportSuccess) {
                $backupInfo += @"
MÉTHODE B : Restauration JSON (alternative)
--------------------------------------------
# Si pg_dump n'est pas disponible, utilisez le fichier JSON

# 1. Créer la structure de la base
cd backend
npx prisma migrate deploy

# 2. Créer un script de restauration (restore-data.js) :
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function restoreData() {
    const data = JSON.parse(fs.readFileSync('path/to/database_data.json', 'utf-8'));

    // Restaurer dans l'ordre pour respecter les contraintes
    await prisma.permission.createMany({ data: data.permissions, skipDuplicates: true });
    await prisma.role.createMany({ data: data.roles, skipDuplicates: true });
    // ... continuer pour chaque table

    console.log('Restauration terminée');
    await prisma.`$disconnect();
}

restoreData();

# 3. Exécuter le script
node restore-data.js

"@
            }

            $backupInfo += @"

⚙️ Étape 4 : Configuration
--------------------------------------
1. Copier les fichiers .env si nécessaire
2. Vérifier la configuration de connexion PostgreSQL
3. Ajuster les ports si nécessaire

🚀 Étape 5 : Démarrer l'application
--------------------------------------
cd backend
npm run dev

# Dans un autre terminal
cd frontend
npm run dev

====================================
NOTES IMPORTANTES
====================================
"@

            if (-not $sqlExportSuccess -and $jsonExportSuccess) {
                $backupInfo += @"

⚠️  ATTENTION : Ce backup utilise le format JSON alternatif
   PostgreSQL n'était pas disponible lors de la création du backup.
   La restauration nécessitera l'écriture d'un script Node.js personnalisé.

   Recommandation : Installer PostgreSQL et refaire un backup SQL pour
   une restauration plus simple.

"@
            }

            $backupInfo += @"

📊 Statistiques du backup
- SQL disponible : $sqlExportSuccess
- JSON disponible : $jsonExportSuccess
- Schéma Prisma : Oui

====================================
"@

            $backupInfo | Out-File -FilePath $infoPath -Encoding utf8

            # Compresser tout le dossier de backup
            $finalBackupZip = "$backupFolder.zip"
            Compress-Archive -Path $backupFolder -DestinationPath $finalBackupZip
            Remove-Item -Recurse -Force $backupFolder

            Write-Message "Backup complet créé avec succès !" "Success" "🎉"
            Write-Message "Emplacement : $finalBackupZip" "Success" "📍"
            Write-Message "Taille : $([Math]::Round((Get-Item $finalBackupZip).Length / 1MB, 2)) MB" "Info" "💾"
        }
        "2" {
            Write-Message "Création d'un backup de l'application..." "Primary" "💾"

            $appZipPath = Join-Path $backupPath "$backupName.zip"

            $excludePaths = @("node_modules", "dist", ".vite", "logs", "backups", ".git")

            Write-Message "Compression en cours (cela peut prendre quelques minutes)..." "Info" "📦"

            if (Get-Command 7z -ErrorAction SilentlyContinue) {
                $excludeArgs = $excludePaths | ForEach-Object { "-xr!$_" }
                & 7z a -tzip $appZipPath "$rootPath\*" $excludeArgs
            } else {
                # Fallback avec Compress-Archive (copie temporaire puis compression)
                Write-Message "Préparation des fichiers à compresser (ignorant node_modules, dist, etc.)..." "Info" "🔍"

                $tempFolder = Join-Path $env:TEMP "projet0_backup_temp_$(Get-Date -Format 'yyyyMMddHHmmss')"
                New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null

                try {
                    # Fonction de copie récursive avec exclusions
                    function Copy-WithExclusions {
                        param($Source, $Destination, $Excludes)

                        # Copier les fichiers du dossier actuel
                        Get-ChildItem -Path $Source -File -ErrorAction SilentlyContinue | ForEach-Object {
                            Copy-Item -Path $_.FullName -Destination $Destination -Force
                        }

                        # Copier les sous-dossiers (sauf ceux exclus)
                        Get-ChildItem -Path $Source -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                            if ($Excludes -notcontains $_.Name) {
                                $destSubFolder = Join-Path $Destination $_.Name
                                New-Item -ItemType Directory -Path $destSubFolder -Force | Out-Null
                                Copy-WithExclusions -Source $_.FullName -Destination $destSubFolder -Excludes $Excludes
                            } else {
                                Write-Host "  ⏭️  Ignoré : $($_.Name)" -ForegroundColor DarkGray
                            }
                        }
                    }

                    # Copier les fichiers en excluant les dossiers non désirés
                    Copy-WithExclusions -Source $rootPath -Destination $tempFolder -Excludes $excludePaths

                    Write-Message "Compression du dossier temporaire..." "Info" "📦"
                    Compress-Archive -Path "$tempFolder\*" -DestinationPath $appZipPath -CompressionLevel Optimal -Force

                } finally {
                    # Nettoyer le dossier temporaire
                    if (Test-Path $tempFolder) {
                        Remove-Item -Path $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
                    }
                }
            }

            Write-Message "Backup application créé avec succès !" "Success" "🎉"
            Write-Message "Emplacement : $appZipPath" "Success" "📍"
            Write-Message "Taille : $([Math]::Round((Get-Item $appZipPath).Length / 1MB, 2)) MB" "Info" "💾"
        }
        "3" {
            Write-Message "Création d'un backup de la base de données..." "Primary" "💾"

            Push-Location $backendPath

            # Export JSON (Prisma schema)
            $dbJsonPath = Join-Path $backupPath "$backupName`_schema.prisma"
            Copy-Item "prisma\schema.prisma" $dbJsonPath
            Write-Message "Schéma Prisma exporté !" "Success" "✅"

            # Export SQL
            $dbSqlPath = Join-Path $backupPath "$backupName`_dump.sql"
            $env:PGPASSWORD = "TOUFIK90"

            Write-Message "Export SQL en cours..." "Info" "🗄️"
            pg_dump -h localhost -U postgres -d PROJECT_0 -f $dbSqlPath 2>$null

            if (Test-Path $dbSqlPath) {
                Write-Message "Backup base de données créé avec succès !" "Success" "🎉"
                Write-Message "Schéma : $dbJsonPath" "Success" "📍"
                Write-Message "Dump SQL : $dbSqlPath" "Success" "📍"
                Write-Message "Taille : $([Math]::Round((Get-Item $dbSqlPath).Length / 1MB, 2)) MB" "Info" "💾"
            } else {
                Write-Message "Erreur lors de l'export SQL. Vérifiez que PostgreSQL est installé et accessible." "Error" "❌"
            }

            Pop-Location
        }
        "4" {
            return
        }
        default {
            Write-Message "Option invalide" "Error" "❌"
        }
    }

    Read-Host "`nAppuyez sur Entrée pour continuer"
}

# Fonction pour lister et restaurer les backups
function Restore-Backup {
    Write-Message "`n=== Restauration de Backup ===" "Info"

    if (-not (Test-Path $backupPath)) {
        Write-Message "Aucun dossier de backup trouvé." "Warning" "⚠️"
        Read-Host "Appuyez sur Entrée pour continuer"
        return
    }

    $backups = Get-ChildItem -Path $backupPath -Filter "projet0_backup_*.zip" | Sort-Object LastWriteTime -Descending

    if ($backups.Count -eq 0) {
        Write-Message "Aucun backup trouvé dans $backupPath" "Warning" "⚠️"
        Read-Host "Appuyez sur Entrée pour continuer"
        return
    }

    Write-Message "Backups disponibles :" "Info" "📦"
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        $size = [Math]::Round($backup.Length / 1MB, 2)
        Write-Host "  $($i + 1). $($backup.Name) - ${size} MB - $(Get-Date $backup.LastWriteTime -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor $Colors.Info
    }

    Write-Host "  0. Retour au menu principal" -ForegroundColor $Colors.Muted

    $choice = Read-Host "`nSélectionnez un backup à restaurer (0-$($backups.Count))"

    if ($choice -eq "0") {
        return
    }

    try {
        $choiceNum = [int]$choice
        if ($choiceNum -lt 1 -or $choiceNum -gt $backups.Count) {
            Write-Message "Choix invalide" "Error" "❌"
            return
        }

        $selectedBackup = $backups[$choiceNum - 1]

        Write-Message "⚠️  ATTENTION : La restauration écrasera les données actuelles !" "Warning" "⚠️"
        $confirm = Read-Host "Tapez 'OUI' pour confirmer la restauration"

        if ($confirm -ne "OUI") {
            Write-Message "Restauration annulée." "Info" "ℹ️"
            return
        }

        Write-Message "Restauration en cours..." "Primary" "🔄"

        # Extraire le backup dans un dossier temporaire
        $tempRestore = Join-Path $env:TEMP "projet0_restore_$(Get-Date -Format 'yyyyMMddHHmmss')"
        Expand-Archive -Path $selectedBackup.FullName -DestinationPath $tempRestore -Force

        Write-Message "Backup extrait. Consultez le fichier backup_info.txt pour les instructions de restauration." "Success" "✅"
        Write-Message "Emplacement : $tempRestore" "Info" "📍"

        # Ouvrir l'explorateur
        Start-Process explorer.exe $tempRestore

    } catch {
        Write-Message "Erreur lors de la restauration : $_" "Error" "❌"
    }

    Read-Host "`nAppuyez sur Entrée pour continuer"
}

# Fonction pour afficher le menu principal
function Show-Menu {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor $Colors.Primary
    Write-Host "║             🚀 Projet-0 Manager                 ║" -ForegroundColor $Colors.Primary
    Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor $Colors.Primary
    Write-Host
    Write-Host "🟢 1.  Démarrer l'application (Backend + Frontend)" -ForegroundColor $Colors.Success
    Write-Host "🔴 2.  Arrêter l'application" -ForegroundColor $Colors.Error
    Write-Host "🔄 3.  Redémarrer l'application" -ForegroundColor $Colors.Warning
    Write-Host "🗄️  4.  Démarrer Prisma Studio (interface BDD)" -ForegroundColor $Colors.Secondary
    Write-Host "🌐 5.  Gérer les ports" -ForegroundColor $Colors.Info
    Write-Host "🗃️  6.  Gérer la base de données" -ForegroundColor $Colors.Secondary
    Write-Host "🧹 7.  Nettoyer les caches" -ForegroundColor $Colors.Warning
    Write-Host "📋 8.  Afficher les logs" -ForegroundColor $Colors.Info
    Write-Host "🌿 9.  Gestion Git (status, commit, push, pull)" -ForegroundColor $Colors.Success
    Write-Host "💾 10. Créer un backup (ZIP + Database)" -ForegroundColor $Colors.Warning
    Write-Host "📦 11. Restaurer un backup" -ForegroundColor $Colors.Info
    Write-Host "❌ 12. Quitter" -ForegroundColor $Colors.Muted
    Write-Host
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Colors.Primary
}

# Boucle principale du menu
do {
    Show-Menu
    $choice = Read-Host "Entrez votre choix (1-12)"

    switch ($choice) {
        "1" {
            Write-Message "Démarrage de l'application complète..." "Primary" "🚀"
            Start-Backend
            Start-Sleep -Seconds 3
            Start-Frontend
            Open-Browser
            Write-Message "Application démarrée avec succès !" "Success" "🎉"
            Write-Message "Backend: http://localhost:$backendPort" "Success" "🌐"
            Write-Message "Frontend: http://localhost:$frontendPort" "Success" "🌐"
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "2" {
            Write-Message "Arrêt de l'application complète..." "Primary" "🛑"
            Stop-ProcessOnPort -Port $backendPort -ServiceName "Backend"
            Stop-ProcessOnPort -Port $frontendPort -ServiceName "Frontend"
            Stop-ProcessOnPort -Port $dbStudioPort -ServiceName "Prisma Studio"
            Write-Message "Application arrêtée avec succès !" "Success" "✅"
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "3" {
            Write-Message "Redémarrage de l'application complète..." "Primary" "🔄"
            Stop-ProcessOnPort -Port $backendPort -ServiceName "Backend"
            Stop-ProcessOnPort -Port $frontendPort -ServiceName "Frontend"
            Start-Sleep -Seconds 3
            Start-Backend
            Start-Sleep -Seconds 3
            Start-Frontend
            Open-Browser
            Write-Message "Application redémarrée avec succès !" "Success" "🎉"
            Write-Message "Backend: http://localhost:$backendPort" "Success" "🌐"
            Write-Message "Frontend: http://localhost:$frontendPort" "Success" "🌐"
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "4" {
            Start-DbStudio
            Write-Message "Prisma Studio démarré sur http://localhost:$dbStudioPort" "Success" "🌐"
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "5" {
            Manage-Ports
        }
        "6" {
            Manage-Database
        }
        "7" {
            Clear-ProjectCache
            Read-Host "Appuyez sur Entrée pour continuer"
        }
        "8" {
            Show-ServiceLogs
        }
        "9" {
            Manage-Git
        }
        "10" {
            Create-Backup
        }
        "11" {
            Restore-Backup
        }
        "12" {
            Write-Message "Au revoir ! 👋" "Info" "🎯"
            exit
        }
        default {
            Write-Message "Option invalide. Veuillez choisir un numéro entre 1 et 12." "Error" "❌"
            Start-Sleep -Seconds 2
        }
    }
} while ($true)
