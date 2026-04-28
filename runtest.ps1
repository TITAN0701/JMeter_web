# === JMeter CLI Runner (GUI edit + CLI run) ===
param(
    [string]$JMeterBin = "C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat",
    [string]$TestPlan = "C:\Users\suppo\Desktop\JMeter\tests\autotest1.jmx",
    [string]$OutDir = "C:\Users\suppo\Desktop\JMeter\reports",
    [switch]$UseRemote,
    [string]$RemoteHosts = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $JMeterBin)) {
    Write-Host "JMeter bin not found: $JMeterBin"
    exit 1
}
if (-not (Test-Path $TestPlan)) {
    Write-Host "Test plan not found: $TestPlan"
    exit 1
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ResultFile = Join-Path $OutDir ("results_{0}.jtl" -f $Timestamp)
$ReportDir = Join-Path $OutDir ("html_{0}" -f $Timestamp)

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

Write-Host "JMeter Bin : $JMeterBin"
Write-Host "Test Plan  : $TestPlan"
Write-Host "Result JTL : $ResultFile"
Write-Host "Report Dir : $ReportDir"

if ($UseRemote) {
    if ([string]::IsNullOrWhiteSpace($RemoteHosts)) {
        Write-Host "UseRemote is set but RemoteHosts is empty."
        exit 1
    }
    Write-Host "Mode: remote ($RemoteHosts)"
    & $JMeterBin -n -t $TestPlan -l $ResultFile -e -o $ReportDir -R $RemoteHosts
} else {
    Write-Host "Mode: local"
    & $JMeterBin -n -t $TestPlan -l $ResultFile -e -o $ReportDir
}

if (Test-Path $ResultFile) {
    Write-Host "Done: $ResultFile"
    Write-Host "Report: $ReportDir"
} else {
    Write-Host "Error: result file not created."
    exit 1
}
