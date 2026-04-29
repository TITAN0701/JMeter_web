param(
    [string]$JavaBin = "C:\Program Files\Java\jdk-25\bin\java.exe",
    [string]$JenkinsWar = "C:\Tools\jenkins\jenkins.war",
    [string]$JenkinsHome = "C:\Tools\jenkins\home",
    [int]$HttpPort = 8080
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $JavaBin)) {
    throw "Java not found: $JavaBin"
}

if (-not (Test-Path -LiteralPath $JenkinsWar)) {
    throw "Jenkins WAR not found: $JenkinsWar"
}

New-Item -ItemType Directory -Path $JenkinsHome -Force | Out-Null
$logDir = Join-Path (Split-Path -Parent $JenkinsWar) "logs"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$existing = Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -like "*$JenkinsWar*" -and $_.CommandLine -like "*--httpPort=$HttpPort*" } |
    Select-Object -First 1

if ($existing) {
    Write-Host ("Jenkins is already running. PID: {0}" -f $existing.ProcessId)
    exit 0
}

$out = Join-Path $logDir "jenkins.out.log"
$err = Join-Path $logDir "jenkins.err.log"

$process = Start-Process -FilePath $JavaBin `
    -ArgumentList @(
        "-DJENKINS_HOME=$JenkinsHome",
        "-Dhudson.model.DirectoryBrowserSupport.CSP=",
        "-jar",
        $JenkinsWar,
        "--httpPort=$HttpPort"
    ) `
    -WindowStyle Hidden `
    -RedirectStandardOutput $out `
    -RedirectStandardError $err `
    -PassThru

Write-Host ("Started Jenkins. PID: {0}" -f $process.Id)
Write-Host ("URL: http://localhost:{0}" -f $HttpPort)
Write-Host ("JENKINS_HOME: {0}" -f $JenkinsHome)
