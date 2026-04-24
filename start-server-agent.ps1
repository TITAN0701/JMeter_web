[CmdletBinding()]
param(
    [int]$TcpPort = 4444,
    [int]$UdpPort = 4444,
    [switch]$AutoShutdown,
    [switch]$SysInfo
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$agentRoot = Join-Path $scriptRoot "tools\ServerAgent-2.2.3\ServerAgent-2.2.3"
$agentBat = Join-Path $agentRoot "startAgent.bat"

if (-not (Test-Path -LiteralPath $agentBat)) {
    throw "ServerAgent not found: $agentBat"
}

$arguments = @("--tcp-port", $TcpPort, "--udp-port", $UdpPort)

if ($AutoShutdown) {
    $arguments += "--auto-shutdown"
}

if ($SysInfo) {
    $arguments += "--sysinfo"
}

Write-Host "Launching ServerAgent from $agentRoot"
Write-Host "TCP port: $TcpPort"
Write-Host "UDP port: $UdpPort"

Push-Location $agentRoot
try {
    & $agentBat @arguments
} finally {
    Pop-Location
}
