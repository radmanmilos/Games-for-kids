# Auto-check script for starting tools
# Add to your shell profile or just run before starting aider/goose

param(
    [ValidateSet("aider","goose","both")]
    [string] = "both"
)

Push-Location "E:\GitHub\Games for kids"
# Load env
foreach ($line in Get-Content ".\.env") {
  if ($line -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
  }
}

if ($Tool -eq "aider" -or $Tool -eq "both") {
    Write-Host "
=== Aider Check ===" -ForegroundColor Cyan
    .\tools\check-free-models.ps1 -Tool aider
}

if ($Tool -eq "goose" -or $Tool -eq "both") {
    Write-Host "
=== Goose Check ===" -ForegroundColor Cyan
    .\tools\check-free-models.ps1 -Tool goose
}

Pop-Location
