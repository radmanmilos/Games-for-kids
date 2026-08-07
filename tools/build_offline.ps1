# tools/build_offline.ps1
# Generates game/sw-cache-list.json (via node script), produces docs/game-offline.zip,
# and writes game/offline-manifest.json with SHA256 and size for each asset.

Set-StrictMode -Version Latest
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Push-Location $scriptDir

Write-Output "[build_offline] regenerating sw-cache-list.json"
# run node generator (assumes node is on PATH)
node ./generate_sw_list.js

$gameDir = Join-Path $repoRoot 'game'
$docs = Join-Path $repoRoot 'docs'
if (-Not (Test-Path $docs)) { New-Item -ItemType Directory -Path $docs | Out-Null }

# Build offline manifest with SHA256 and size for files listed in sw-cache-list.json
$swListPath = Join-Path $gameDir 'sw-cache-list.json'
if (-Not (Test-Path $swListPath)) { Write-Error "Missing $swListPath"; Exit 2 }

$swList = Get-Content $swListPath -Raw | ConvertFrom-Json
$manifest = @{}
foreach ($entry in $swList) {
    $rel = $entry -replace '^/', ''
    $abs = Join-Path $repoRoot $rel
    if (Test-Path $abs) {
        $hash = Get-FileHash -Algorithm SHA256 -Path $abs
        $size = (Get-Item $abs).Length
        $manifest[$entry] = @{ sha256 = $hash.Hash; size = $size }
    } else {
        Write-Warning "Skipping missing file: $entry"
    }
}
$outPath = Join-Path $gameDir 'offline-manifest.json'
$manifest | ConvertTo-Json -Depth 4 | Out-File -Encoding UTF8 $outPath
Write-Output "[build_offline] wrote $outPath"

# Package after generating the manifest so the ZIP contains the exact manifest
# used by the service worker's update check.
$zipPath = Join-Path $docs 'game-offline.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Write-Output "[build_offline] creating ZIP: $zipPath"
Compress-Archive -Path (Join-Path $gameDir '*') -DestinationPath $zipPath -Force

Write-Output "[build_offline] done. ZIP: $zipPath" 

Pop-Location
