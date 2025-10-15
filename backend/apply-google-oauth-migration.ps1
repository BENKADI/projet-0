# Script pour appliquer la migration Google OAuth
# Ce script applique automatiquement la migration pour ajouter les champs Google OAuth

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Migration Google OAuth - Backend Setup   " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cette migration va ajouter les champs suivants à la table User:" -ForegroundColor Yellow
Write-Host "  - googleId (String?, unique) : ID Google de l'utilisateur" -ForegroundColor White
Write-Host "  - provider (String, default 'local') : Type d'authentification" -ForegroundColor White
Write-Host "  - password devient optionnel (String?)" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Voulez-vous continuer? (O/N)"
if ($confirmation -ne 'O' -and $confirmation -ne 'o') {
    Write-Host "Migration annulée." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Génération du client Prisma..." -ForegroundColor Cyan
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la génération du client Prisma" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Application de la migration..." -ForegroundColor Cyan
Write-Host "Nom de la migration suggéré: add_google_oauth_fields" -ForegroundColor Yellow
Write-Host ""

# Utiliser --name pour spécifier le nom de la migration directement
$migrationName = "add_google_oauth_fields"
$env:MIGRATION_NAME = $migrationName

# Créer un processus interactif pour la migration
$process = Start-Process -FilePath "npm" -ArgumentList "run", "prisma:migrate" -NoNewWindow -PassThru -Wait

if ($process.ExitCode -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  Migration appliquée avec succès! ✓       " -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Configurer Google Cloud Console (voir GOOGLE_OAUTH_SETUP.md)" -ForegroundColor White
    Write-Host "2. Mettre à jour le fichier .env avec vos clés Google" -ForegroundColor White
    Write-Host "3. Redémarrer le serveur: npm run dev" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "La migration a été annulée ou a échoué." -ForegroundColor Red
    Write-Host "Vous pouvez l'appliquer manuellement avec: npm run prisma:migrate" -ForegroundColor Yellow
    Write-Host ""
}
