# AI startup helper for Little Play
# Reads PROJECT_TASKS.md, shows the next non-DONE task, and prompts whether to continue.
# If the user confirms, marks the task IN PROGRESS with an optional note and timestamp.

$projectRoot = Split-Path -Parent $PSScriptRoot
$tasksPath = Join-Path $projectRoot 'PROJECT_TASKS.md'

if (-not (Test-Path $tasksPath)) {
    Write-Host "PROJECT_TASKS.md not found at $tasksPath" -ForegroundColor Red
    exit 1
}

$lines = Get-Content -Path $tasksPath -Encoding UTF8
$taskLines = $lines | Where-Object { $_ -match '^\s*\d+\.' }

$nextTask = $null
foreach ($line in $taskLines) {
    $parts = if ($line -match '—') { $line -split '—' } else { $line -split '-' }
    $titlePart = $parts[0].Trim()
    $status = if ($parts.Count -gt 1) { $parts[1].Trim() } else { '' }
    # Normalize status to uppercase words (take first token)
    $statusToken = ($status -split '\s+')[0].ToUpper()
    if ($statusToken -ne 'DONE') {
        $nextTask = @{ Line = $line; Title = $titlePart; Status = $status }
        break
    }
}

if (-not $nextTask) {
    Write-Host "No pending tasks found. All tasks DONE or none found." -ForegroundColor Green
    exit 0
}

Write-Host "Next task found:`n$($nextTask.Line)`" -ForegroundColor Cyan

$choice = Read-Host "Continue with this task? (Y=yes, S=show full list, N=no) [Y/S/N]"

switch ($choice.ToUpper()) {
    'Y' {
        $note = Read-Host "Optional short note to record (press Enter to skip)"
        $date = (Get-Date).ToString('yyyy-MM-dd HH:mm')
        $newStatus = 'IN PROGRESS'
        if ($note -ne '') { $newStatus = "$newStatus — $note ($date)" } else { $newStatus = "$newStatus — Started by AI on $date" }

        # Find index in original lines and replace the line
        $index = [Array]::IndexOf($lines, $nextTask.Line)
        if ($index -ge 0) {
            # Keep title/number part exactly as before
            $titlePart = if ($nextTask.Line -match '—') { ($nextTask.Line -split '—')[0].Trim() } else { ($nextTask.Line -split '-')[0].Trim() }
            $lines[$index] = "$titlePart — $newStatus"
            $lines | Set-Content -Path $tasksPath -Encoding UTF8
            Write-Host "Task updated to IN PROGRESS in PROJECT_TASKS.md" -ForegroundColor Green
        } else {
            Write-Host "Could not locate the task line to update. No changes made." -ForegroundColor Yellow
        }
    }
    'S' {
        Write-Host "Full task list:`n" -ForegroundColor Cyan
        $taskLines | ForEach-Object { Write-Host $_ }
        exit 0
    }
    default {
        Write-Host "Okay, not following the list right now. Continue with other work." -ForegroundColor Yellow
        exit 0
    }
}
