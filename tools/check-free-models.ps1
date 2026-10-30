# Check OpenRouter free models availability
# Run this when starting aider or goose in this project

param(
    [string] = "all"
)

$env:OPENROUTER_API_KEY = (Get-Content ".env" | Where-Object { $_ -match "^OPENAI_API_KEY=(.+)" } | ForEach-Object { $matches[1] })
Write-Host "=== OpenRouter Free Models Availability Check ===" -ForegroundColor Cyan
Write-Host "Checking at 10/30/2026 20:14:04" -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $env:OPENROUTER_API_KEY"
        "HTTP-Referer" = "https://github.com/radmanmilos/Games-for-kids"
        "X-Title" = "Games for kids"
    }
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/models" -Headers $headers -Method Get
    $freeModels = $response.data | Where-Object { $_.id -like "*:free" -and $_.pricing.prompt -eq "0" -and $_.pricing.completion -eq "0" }
    
    Write-Host "
Currently available free models:" -ForegroundColor Green
    $freeModels | ForEach-Object { Write-Host "  - $($_.id)" -ForegroundColor White }
    
    $saved = Get-Content "tools\aider-free-models.yml" | Where-Object { $_.trim() -like "*- *" -and $_.trim() -notlike "#*" }
    Write-Host "
Checking saved models..." -ForegroundColor Cyan
    foreach ($line in $saved) {
        if ($line -match "- (.+)") {
            $model = $matches[1].Trim()
            if ($freeModels.id -contains $model) {
                Write-Host "  ✓ $model - AVAILABLE" -ForegroundColor Green
            } else {
                Write-Host "  ✗ $model - UNAVAILABLE (remove or replace)" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "Error checking models: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you have OPENROUTER_API_KEY set in .env" -ForegroundColor Yellow
}
