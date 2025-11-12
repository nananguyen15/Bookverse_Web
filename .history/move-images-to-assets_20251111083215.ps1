# Move Images from public/img to src/assets/img
# Script: move-images-to-assets.ps1
# Purpose: Relocate image files to work with /src/assets/img/ path format in DB

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Move Images to src/assets/img/" -ForegroundColor Cyan  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = "front-end\public\img"
$targetDir = "front-end\src\assets\img"

# Check if source exists
if (-Not (Test-Path $sourceDir)) {
    Write-Host "❌ Source directory not found: $sourceDir" -ForegroundColor Red
    Write-Host "Images might already be moved or path is incorrect." -ForegroundColor Yellow
    exit 1
}

# Check if target already exists
if (Test-Path $targetDir) {
    Write-Host "⚠️  Target directory already exists: $targetDir" -ForegroundColor Yellow
    $response = Read-Host "Do you want to merge/overwrite? (y/n)"
    if ($response -ne "y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "📁 Source: $sourceDir" -ForegroundColor White
Write-Host "📁 Target: $targetDir" -ForegroundColor White
Write-Host ""

# Create target directory
Write-Host "Creating target directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Get all subdirectories and files
$items = Get-ChildItem -Path $sourceDir -Recurse
$fileCount = ($items | Where-Object { -Not $_.PSIsContainer }).Count
$folderCount = ($items | Where-Object { $_.PSIsContainer }).Count

Write-Host "Found:" -ForegroundColor White
Write-Host "  📂 $folderCount folders" -ForegroundColor Cyan
Write-Host "  📄 $fileCount files" -ForegroundColor Cyan
Write-Host ""

# Confirm before moving
$confirm = Read-Host "Continue with move operation? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Moving files..." -ForegroundColor Yellow

try {
    # Copy all items (keeps original as backup)
    Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force
    
    Write-Host "✅ Files copied successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Ask if user wants to delete original
    Write-Host "Original files are still in $sourceDir" -ForegroundColor Yellow
    $deleteOriginal = Read-Host "Do you want to delete the original public/img folder? (y/n)"
    
    if ($deleteOriginal -eq "y") {
        Remove-Item -Path $sourceDir -Recurse -Force
        Write-Host "✅ Original folder deleted!" -ForegroundColor Green
    } else {
        # Rename to backup
        $backupDir = "front-end\public\img.backup"
        if (Test-Path $backupDir) {
            Remove-Item -Path $backupDir -Recurse -Force
        }
        Rename-Item -Path $sourceDir -NewName "img.backup"
        Write-Host "✅ Original folder renamed to: public/img.backup" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Migration Complete! 🎉" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Show summary
    Write-Host "Summary:" -ForegroundColor White
    Write-Host "  ✅ $fileCount files moved" -ForegroundColor Green
    Write-Host "  ✅ $folderCount folders created" -ForegroundColor Green
    Write-Host "  📁 New location: $targetDir" -ForegroundColor Cyan
    Write-Host ""
    
    # List subdirectories
    Write-Host "Subdirectories in target:" -ForegroundColor White
    Get-ChildItem -Path $targetDir -Directory | ForEach-Object {
        $count = (Get-ChildItem -Path $_.FullName -File -Recurse).Count
        Write-Host "  📂 $($_.Name) - $count files" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Start frontend: cd front-end && npm run dev" -ForegroundColor White
    Write-Host "  2. Test image display on all pages" -ForegroundColor White
    Write-Host "  3. Try uploading a new image" -ForegroundColor White
    Write-Host "  4. Verify DB path format: /src/assets/img/..." -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
