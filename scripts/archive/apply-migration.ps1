# Script PowerShell pour appliquer la migration Prisma manuellement
# Ce script utilise psql pour se connecter directement à Supabase

Write-Host "🚀 Application de la migration EduTrack-CM..." -ForegroundColor Green

# Configuration de la connexion
$env:PGPASSWORD = "PensezyC#estpossible"
$host = "aws-1-eu-west-3.pooler.supabase.com"
$port = "5432"
$database = "postgres"
$username = "postgres.vrjdglwowrileoyrhoof"

# Chemin vers le fichier de migration
$migrationFile = ".\prisma\migrations\20250125000000_add_missing_columns_and_tables\migration.sql"

Write-Host "📋 Paramètres de connexion:" -ForegroundColor Yellow
Write-Host "   Host: $host" -ForegroundColor Gray
Write-Host "   Port: $port" -ForegroundColor Gray
Write-Host "   Database: $database" -ForegroundColor Gray
Write-Host "   User: $username" -ForegroundColor Gray

# Vérifier si psql est disponible
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ psql trouvé: $psqlVersion" -ForegroundColor Green
    } else {
        throw "psql non trouvé"
    }
} catch {
    Write-Host "❌ psql n'est pas installé ou accessible." -ForegroundColor Red
    Write-Host "💡 Solutions possibles:" -ForegroundColor Yellow
    Write-Host "   1. Installer PostgreSQL: https://www.postgresql.org/download/" -ForegroundColor Gray
    Write-Host "   2. Utiliser l'éditeur SQL de Supabase Dashboard" -ForegroundColor Gray
    Write-Host "   3. Utiliser un client PostgreSQL comme pgAdmin" -ForegroundColor Gray
    exit 1
}

# Vérifier si le fichier de migration existe
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier de migration non trouvé: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Fichier de migration trouvé: $migrationFile" -ForegroundColor Green

# Appliquer la migration
Write-Host "🔄 Application de la migration..." -ForegroundColor Yellow

try {
    psql -h $host -p $port -U $username -d $database -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
        
        # Mettre à jour la table _prisma_migrations pour marquer la migration comme appliquée
        Write-Host "📝 Enregistrement de la migration dans _prisma_migrations..." -ForegroundColor Yellow
        
        $migrationName = "20250125000000_add_missing_columns_and_tables"
        $checksum = "migration_checksum_placeholder"
        $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
        
        $insertSql = @"
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES ('$migrationName', '$checksum', '$now', '$migrationName', NULL, NULL, '$now', 1)
ON CONFLICT (id) DO NOTHING;
"@
        
        $insertSql | psql -h $host -p $port -U $username -d $database
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migration enregistrée dans _prisma_migrations" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Attention: Migration appliquée mais non enregistrée dans _prisma_migrations" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Migration terminée!" -ForegroundColor Green
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Redémarrer votre application React" -ForegroundColor Gray
Write-Host "   2. Tester la connexion avec votre compte Supabase" -ForegroundColor Gray
Write-Host "   3. Vérifier que les dashboards affichent les vraies données" -ForegroundColor Gray