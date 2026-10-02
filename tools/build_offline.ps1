# tools/build_offline.ps1
# Generates the two service-worker inventories:
#   game/sw-cache-list.json    (what the worker pre-caches)
#   game/offline-manifest.json (sha256 + size for exactly those entries)
# Produces no archive. The ZIP step was removed 2026-10-02 by user decision:
# offline is the service worker, so there is nothing to hand-unpack.

Set-StrictMode -Version Latest
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Push-Location $scriptDir

Write-Output "[build_offline] regenerating sw-cache-list.json"
# run node generator (assumes node is on PATH)
node ./generate_sw_list.js

$gameDir = Join-Path $repoRoot 'game'

# Build offline manifest with SHA256 and size for files listed in sw-cache-list.json
$swListPath = Join-Path $gameDir 'sw-cache-list.json'
if (-Not (Test-Path $swListPath)) { Write-Error "Missing $swListPath"; Exit 2 }

$swList = Get-Content $swListPath -Raw | ConvertFrom-Json
$manifest = @{}
$failed = 0
foreach ($entry in $swList) {
    $rel = $entry -replace '^/', ''
    $abs = Join-Path $gameDir $rel
    if (-not (Test-Path -LiteralPath $abs)) {
        Write-Warning "Skipping missing file: $entry"
        $failed++
        continue
    }
    # Get-FileHash can come back empty when a file is briefly locked (e.g. right
    # after the parallel smoke battery released Chrome). Under Set-StrictMode an
    # undefined $hash would abort the whole loop and silently publish an empty
    # manifest, so retry and fail loudly instead.
    # .NET hashing instead of the Get-FileHash cmdlet: when this script is
    # spawned by check_all.js the child inherits a PSModulePath that cannot
    # auto-load Microsoft.PowerShell.Utility, so the cmdlet is simply missing
    # and the manifest would come out empty. SHA256 via the BCL always works.
    $hash = $null
    $hashErr = ''
    for ($try = 1; $try -le 5 -and $null -eq $hash; $try++) {
        if ($try -gt 1) { Start-Sleep -Milliseconds (200 * $try) }
        try {
            $sha = [System.Security.Cryptography.SHA256]::Create()
            $stream = [System.IO.File]::Open($abs, 'Open', 'Read', 'Read')
            try {
                $hex = ([System.BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '')
            } finally {
                $stream.Dispose()
                $sha.Dispose()
            }
            if ($hex) { $hash = $hex }
        } catch { $hash = $null; $hashErr = $_.Exception.Message }
    }
    if ($null -eq $hash) {
        Write-Error "Could not hash file: $entry ($hashErr)"
        $failed++
        continue
    }
    $size = (Get-Item -LiteralPath $abs).Length
    $manifest[$entry] = @{ sha256 = $hash; size = $size }
}

# An empty or incomplete manifest breaks the service worker's update check and
# ships a broken offline pack, so never write one.
if ($manifest.Count -eq 0) { Write-Error "Refusing to write an empty offline manifest"; Exit 2 }
if ($failed -gt 0) { Write-Error "Offline manifest incomplete: $failed of $($swList.Count) entries failed"; Exit 2 }

$outPath = Join-Path $gameDir 'offline-manifest.json'
$manifest | ConvertTo-Json -Depth 4 | Out-File -Encoding UTF8 $outPath
Write-Output "[build_offline] wrote $outPath ($($manifest.Count) entries)"

# No archive step. See the header: offline delivery is the service worker.

Write-Output "[build_offline] done (service-worker inventories only; no archive is produced)."

Pop-Location
