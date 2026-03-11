# Run this from inside your "files (2)" folder
# PS> .\fix-structure.ps1

$base = Get-Location

# Create missing folders
$dirs = @(
    "components\dashboard",
    "components\corporate",
    "lib",
    "prisma"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path "$base\$dir" | Out-Null
}

# Move component files
Move-Item -Force "$base\DashboardClient.tsx"  "$base\components\dashboard\DashboardClient.tsx"
Move-Item -Force "$base\CorporateClient.tsx"  "$base\components\corporate\CorporateClient.tsx"

# Move lib files
Move-Item -Force "$base\prisma.ts"   "$base\lib\prisma.ts"
Move-Item -Force "$base\tokens.ts"   "$base\lib\tokens.ts"

# Move prisma files
Move-Item -Force "$base\schema.prisma"  "$base\prisma\schema.prisma"
Move-Item -Force "$base\seed.ts"        "$base\prisma\seed.ts"

# Move app-level pages (already in app/ subfolder from zip, but root copies need removing)
# Move root page.tsx into app/ only if app\page.tsx doesn't already exist
if (!(Test-Path "$base\app\page.tsx") -and (Test-Path "$base\page.tsx")) {
    Move-Item -Force "$base\page.tsx" "$base\app\page.tsx"
} elseif (Test-Path "$base\page.tsx") {
    Remove-Item "$base\page.tsx"
}

# Move root route.ts — this is likely a stray, remove it
if (Test-Path "$base\route.ts") {
    Remove-Item "$base\route.ts"
}

# Remove stray popup.html from root (belongs to extension only)
if (Test-Path "$base\popup.html") {
    Remove-Item "$base\popup.html"
}

Write-Host ""
Write-Host "✅ Structure fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run these commands in order:" -ForegroundColor Cyan
Write-Host "  1. copy .env.example .env" -ForegroundColor White
Write-Host "  2. Edit .env — fill in DATABASE_URL and AUTH_SECRET" -ForegroundColor White
Write-Host "  3. npm install" -ForegroundColor White
Write-Host "  4. npx prisma db push" -ForegroundColor White
Write-Host "  5. npm run dev" -ForegroundColor White
