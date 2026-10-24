$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
  $config = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'config.json') -Raw | ConvertFrom-Json
  $data = Invoke-RestMethod -Uri ($config.BaseUrl + '/api/streaks/' + $config.Id) -TimeoutSec 8
  # Avoid Rainmeter option syntax and line breaks in user supplied titles.
  $title = ([string]$data.title) -replace '[\r\n\[\]#;]', ' '
  if ($title.Length -gt 45) { $title = $title.Substring(0, 42) + '...' }
  $text = "$title`n$($data.days) days`nSince $($data.startDate)"
} catch {
  $text = "Cannot refresh streak`nServer offline or streak deleted"
}
Write-Output $text
