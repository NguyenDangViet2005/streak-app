param([string]$StreakUrl, [string]$SkinsPath)
$ErrorActionPreference = 'Stop'
if (-not $StreakUrl) { $StreakUrl = Read-Host 'Paste streak URL (http(s)://host/widget/id)' }
if ($StreakUrl.Trim() -notmatch '^(https?://[^\s/?#]+)/widget/([a-fA-F0-9]{24})/?$') { throw 'Invalid streak URL.' }
$baseUrl = $Matches[1]
$streakId = $Matches[2]
if ($baseUrl -match '["''`\[\]#]') { throw 'URL contains unsupported characters.' }
if (-not $SkinsPath) { $SkinsPath = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Rainmeter\Skins' }
# Each streak gets an independent Rainmeter configuration and refresh state.
$destination = Join-Path $SkinsPath "StreakGarden\$streakId"
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Streak.ini') -Destination $destination
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Update.ps1') -Destination $destination
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Render.lua') -Destination $destination
@{ BaseUrl = $baseUrl; Id = $streakId } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'config.json') -Encoding UTF8
Write-Host "Created widget in $destination"
Write-Host 'Rainmeter > Refresh all > StreakGarden > your streak ID > Streak.ini > Load'
