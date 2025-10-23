#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de préparation pour le déploiement Coolify de Projet-0

.DESCRIPTION
    Ce script aide à préparer l'application pour un déploiement sur Coolify en :
    - Générant les secrets nécessaires
    - Créant les fichiers de configuration
    - Vérifiant les prérequis
    - Fournissant les instructions de déploiement

.EXAMPLE
    .\prepare-coolify.ps1
#>

# Configuration des couleurs pour l'affichage
$Host.UI.RawUI.ForegroundColor = "White"

# Fonction pour afficher un titre
function Show-Title {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

# Fonction pour afficher un succès
function Show-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# Fonction pour afficher une erreur
function Show-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Fonction pour afficher un avertissement
function Show-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Fonction pour afficher une info
function Show-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Fonction pour générer un secret JWT
function New-JWTSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

# Fonction pour générer un mot de passe sécurisé
function New-SecurePassword {
    param([int]$Length = 32)
    
    Add-Type -AssemblyName System.Web -ErrorAction SilentlyContinue
    return [System.Web.Security.Membership]::GeneratePassword($Length, 10)
}

# Fonction pour vérifier si Git est installé
function Test-GitInstalled {
    try {
        $null = git --version
        return $true
    }
    catch {
        return $false
    }
}

# Fonction pour vérifier si le dépôt Git est à jour
function Test-GitStatus {
    $status = git status --porcelain
    return [string]::IsNullOrEmpty($status)
}

# Fonction principale
function Main {
    Clear-Host
    
    Show-Title "Préparation du déploiement Coolify - Projet-0"
    
    # Vérification des prérequis
    Show-Info "Vérification des prérequis..."
    
    if (-not (Test-GitInstalled)) {
        Show-Error "Git n'est pas installé. Veuillez installer Git pour continuer."
        return
    }
    Show-Success "Git est installé"
    
    # Vérification de la structure du projet
    if (-not (Test-Path "docker-compose.coolify.yml")) {
        Show-Error "Le fichier docker-compose.coolify.yml n'existe pas."
        return
    }
    Show-Success "Structure du projet valide"
    
    # Menu principal
    $continue = $true
    while ($continue) {
        Show-Title "Menu de préparation Coolify"
        Write-Host "1. Générer les secrets de sécurité"
        Write-Host "2. Créer le fichier .env pour Coolify"
        Write-Host "3. Vérifier le statut Git"
        Write-Host "4. Afficher les instructions de déploiement"
        Write-Host "5. Ouvrir la documentation"
        Write-Host "6. Quitter"
        Write-Host ""
        
        $choice = Read-Host "Choisissez une option (1-6)"
        
        switch ($choice) {
            "1" {
                Show-Title "Génération des secrets"
                
                $jwtSecret = New-JWTSecret
                $postgresPassword = New-SecurePassword -Length 32
                $adminPassword = New-SecurePassword -Length 16
                
                Write-Host "`nSecrets générés avec succès :`n" -ForegroundColor Green
                Write-Host "JWT_SECRET:" -ForegroundColor Yellow
                Write-Host $jwtSecret -ForegroundColor White
                Write-Host "`nPOSTGRES_PASSWORD:" -ForegroundColor Yellow
                Write-Host $postgresPassword -ForegroundColor White
                Write-Host "`nADMIN_PASSWORD:" -ForegroundColor Yellow
                Write-Host $adminPassword -ForegroundColor White
                
                Write-Host "`n⚠ IMPORTANT: Sauvegardez ces secrets dans un endroit sûr !" -ForegroundColor Red
                Write-Host "⚠ Vous devrez les ajouter dans Coolify lors du déploiement.`n" -ForegroundColor Red
                
                # Proposer de sauvegarder dans un fichier
                $save = Read-Host "Voulez-vous sauvegarder ces secrets dans un fichier ? (O/N)"
                if ($save -eq "O" -or $save -eq "o") {
                    $secretsFile = ".secrets.txt"
                    $secretsContent = @"
# Secrets générés le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ⚠ NE COMMITEZ PAS CE FICHIER !

JWT_SECRET=$jwtSecret
POSTGRES_PASSWORD=$postgresPassword
ADMIN_PASSWORD=$adminPassword
"@
                    Set-Content -Path $secretsFile -Value $secretsContent
                    Show-Success "Secrets sauvegardés dans $secretsFile"
                    Show-Warning "N'oubliez pas d'ajouter ce fichier au .gitignore !"
                    
                    # Ajouter au .gitignore
                    if (Test-Path ".gitignore") {
                        $gitignoreContent = Get-Content ".gitignore"
                        if ($gitignoreContent -notcontains ".secrets.txt") {
                            Add-Content -Path ".gitignore" -Value "`n# Secrets générés`n.secrets.txt"
                            Show-Success "Fichier ajouté au .gitignore"
                        }
                    }
                }
            }
            
            "2" {
                Show-Title "Création du fichier .env pour Coolify"
                
                if (Test-Path ".env.coolify") {
                    Show-Warning "Le fichier .env.coolify existe déjà."
                    $overwrite = Read-Host "Voulez-vous le remplacer ? (O/N)"
                    if ($overwrite -ne "O" -and $overwrite -ne "o") {
                        continue
                    }
                }
                
                Write-Host "Configuration du déploiement Coolify`n"
                
                $frontendDomain = Read-Host "Domaine frontend (ex: app.prestacoode.com)"
                $backendDomain = Read-Host "Domaine backend (ex: api.prestacoode.com)"
                
                Show-Info "Génération des secrets..."
                $jwtSecret = New-JWTSecret
                $postgresPassword = New-SecurePassword -Length 32
                $adminPassword = New-SecurePassword -Length 16
                
                $envContent = @"
# Configuration Coolify - Projet-0
# Généré le $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# DOMAINES
FRONTEND_DOMAIN=$frontendDomain
BACKEND_DOMAIN=$backendDomain

# DATABASE
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$postgresPassword
POSTGRES_DB=projet0_db

# BACKEND
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:$postgresPassword@postgres:5432/projet0_db?schema=public

# JWT
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://$frontendDomain

# ADMIN
ADMIN_EMAIL=admin@projet0.com
ADMIN_PASSWORD=$adminPassword
ADMIN_USERNAME=admin

# GOOGLE OAUTH (Optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://$backendDomain/auth/google/callback

# CONFIGURATION AVANCÉE
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# FRONTEND
VITE_API_URL=https://$backendDomain
"@
                
                Set-Content -Path ".env.coolify" -Value $envContent
                Show-Success "Fichier .env.coolify créé avec succès !"
                
                Write-Host "`n📋 Informations importantes :" -ForegroundColor Cyan
                Write-Host "- Frontend: https://$frontendDomain"
                Write-Host "- Backend: https://$backendDomain"
                Write-Host "- Admin Email: admin@projet0.com"
                Write-Host "- Admin Password: $adminPassword`n"
                
                Show-Warning "⚠ Sauvegardez le mot de passe admin : $adminPassword"
                Show-Info "Copiez le contenu de .env.coolify dans Coolify (Environment Variables)"
            }
            
            "3" {
                Show-Title "Vérification du statut Git"
                
                if (-not (Test-GitStatus)) {
                    Show-Warning "Il y a des changements non commités :"
                    git status --short
                    
                    Write-Host "`nQue voulez-vous faire ?`n"
                    Write-Host "1. Commiter et pusher les changements"
                    Write-Host "2. Ignorer et continuer"
                    Write-Host "3. Retour au menu"
                    
                    $gitChoice = Read-Host "`nChoisissez (1-3)"
                    
                    switch ($gitChoice) {
                        "1" {
                            $commitMessage = Read-Host "Message de commit"
                            if ([string]::IsNullOrEmpty($commitMessage)) {
                                $commitMessage = "Préparation pour déploiement Coolify"
                            }
                            
                            git add .
                            git commit -m $commitMessage
                            git push
                            
                            Show-Success "Changements commités et pushés !"
                        }
                        "2" {
                            Show-Info "Statut Git ignoré."
                        }
                    }
                }
                else {
                    Show-Success "Le dépôt Git est propre (pas de changements non commités)"
                    
                    $branch = git branch --show-current
                    Show-Info "Branche actuelle : $branch"
                    
                    $remote = git remote get-url origin
                    Show-Info "Dépôt distant : $remote"
                }
            }
            
            "4" {
                Show-Title "Instructions de déploiement Coolify"
                
                Write-Host @"
📋 ÉTAPES DE DÉPLOIEMENT SUR COOLIFY
════════════════════════════════════

1️⃣  PRÉREQUIS
   ✓ Votre code doit être sur un dépôt Git (GitHub, GitLab, etc.)
   ✓ Vous avez accès à une instance Coolify
   ✓ Vos DNS pointent vers votre serveur Coolify

2️⃣  DANS COOLIFY
   • Connectez-vous à https://coolify.prestacoode.com
   • Allez dans Projects → + New Project
   • Nommez le projet : "Projet-0"
   
3️⃣  AJOUTER LE SERVICE
   • Cliquez sur + New Resource
   • Sélectionnez "Docker Compose"
   • Source : Votre dépôt Git
   • Branch : main
   • Docker Compose Location : docker-compose.coolify.yml

4️⃣  CONFIGURER LES VARIABLES D'ENVIRONNEMENT
   • Allez dans Environment Variables
   • Copiez le contenu de .env.coolify
   • Ou ajoutez manuellement chaque variable

5️⃣  CONFIGURER LES DOMAINES
   Backend :
   • Domain : api.prestacoode.com (ou votre domaine)
   • Port : 3000
   
   Frontend :
   • Domain : app.prestacoode.com (ou votre domaine)
   • Port : 80

6️⃣  DÉPLOYER
   • Cliquez sur "Deploy"
   • Attendez que les services soient "healthy"

7️⃣  INITIALISER LA BASE DE DONNÉES
   • Ouvrez le terminal du service backend
   • Exécutez :
     npx prisma generate
     npx prisma migrate deploy
     npx prisma db seed

8️⃣  TESTER L'APPLICATION
   • Frontend : https://app.prestacoode.com
   • Backend API : https://api.prestacoode.com/health
   • Documentation : https://api.prestacoode.com/api-docs

📚 Pour plus de détails, consultez COOLIFY_DEPLOYMENT.md

"@ -ForegroundColor White
            }
            
            "5" {
                Show-Title "Ouverture de la documentation"
                
                if (Test-Path "COOLIFY_DEPLOYMENT.md") {
                    Show-Info "Ouverture de COOLIFY_DEPLOYMENT.md..."
                    Start-Process "COOLIFY_DEPLOYMENT.md"
                }
                else {
                    Show-Error "Le fichier COOLIFY_DEPLOYMENT.md n'existe pas."
                }
            }
            
            "6" {
                Show-Title "Au revoir !"
                Show-Success "Bon déploiement sur Coolify ! 🚀"
                $continue = $false
            }
            
            default {
                Show-Error "Option invalide. Veuillez choisir entre 1 et 6."
            }
        }
        
        if ($continue) {
            Write-Host "`nAppuyez sur une touche pour continuer..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            Clear-Host
        }
    }
}

# Exécution du script
Main
