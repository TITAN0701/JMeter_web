param(
    [string]$JenkinsWar = "C:\Tools\jenkins\jenkins.war"
)

$ErrorActionPreference = "Stop"

$processes = Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -like "*$JenkinsWar*" }

if (-not $processes) {
    Write-Host "Jenkins is not running."
    exit 0
}

foreach ($process in $processes) {
    Stop-Process -Id $process.ProcessId -Force
    Write-Host ("Stopped Jenkins. PID: {0}" -f $process.ProcessId)
}
