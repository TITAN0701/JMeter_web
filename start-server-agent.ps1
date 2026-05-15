[CmdletBinding()]
param(
    [int]$TcpPort = 4444,
    [int]$UdpPort = 4444,
    [string]$JavaPath,
    [switch]$AutoShutdown,
    [switch]$SysInfo
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$agentRoot = Join-Path $scriptRoot "tools\ServerAgent-2.2.3\ServerAgent-2.2.3"
$agentJar = Join-Path $agentRoot "CMDRunner.jar"

if (-not (Test-Path -LiteralPath $agentJar)) {
    throw "ServerAgent not found: $agentJar"
}

function Get-JavaMajorVersion {
    param([Parameter(Mandatory = $true)][string]$ExecutablePath)

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $versionOutput = & $ExecutablePath -version 2>&1
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $versionText = ($versionOutput | ForEach-Object { $_.ToString() }) -join "`n"

    if ($versionText -match '"1\.(\d+)\.') {
        return [int]$matches[1]
    }

    if ($versionText -match '"(\d+)(\.|\+)') {
        return [int]$matches[1]
    }

    throw "Unable to parse Java version from: $versionText"
}

function Resolve-CompatibleJava {
    param([string]$RequestedJavaPath)

    $candidates = New-Object System.Collections.Generic.List[string]
    $localJavaRoot = Join-Path $scriptRoot "tools\java-runtime"

    if (-not [string]::IsNullOrWhiteSpace($RequestedJavaPath)) {
        $candidates.Add($RequestedJavaPath)
    }

    if (Test-Path -LiteralPath $localJavaRoot) {
        Get-ChildItem -LiteralPath $localJavaRoot -Recurse -Filter "java.exe" -ErrorAction SilentlyContinue |
            ForEach-Object { $candidates.Add($_.FullName) }
    }

    foreach ($homeVar in @("JAVA8_HOME", "JAVA11_HOME", "JAVA_HOME")) {
        $javaHome = [Environment]::GetEnvironmentVariable($homeVar)
        if (-not [string]::IsNullOrWhiteSpace($javaHome)) {
            $candidates.Add((Join-Path $javaHome "bin\java.exe"))
        }
    }

    $commonRoots = @(
        "C:\Program Files\Eclipse Adoptium",
        "C:\Program Files\Java",
        "C:\Program Files\Microsoft",
        "C:\Program Files\Zulu",
        "C:\Program Files\Amazon Corretto",
        "C:\Program Files (x86)\Java"
    )

    foreach ($root in $commonRoots) {
        if (Test-Path -LiteralPath $root) {
            Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -match "(8|11)" } |
                ForEach-Object { $candidates.Add((Join-Path $_.FullName "bin\java.exe")) }
        }
    }

    $pathJava = Get-Command java.exe -ErrorAction SilentlyContinue
    if ($null -ne $pathJava) {
        $candidates.Add($pathJava.Source)
    }

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate)) {
            continue
        }

        try {
            $major = Get-JavaMajorVersion -ExecutablePath $candidate
            if ($major -eq 8 -or $major -eq 11) {
                return @{
                    Path = $candidate
                    Major = $major
                }
            }
        } catch {
            Write-Warning "Skipping Java candidate '$candidate': $($_.Exception.Message)"
        }
    }

    throw @"
ServerAgent 2.2.3 is not compatible with the current Java runtime.
Install Java 8 or Java 11, then run one of these:

  .\start-server-agent.ps1 -JavaPath "C:\Path\To\jdk-8\bin\java.exe"

or set JAVA8_HOME/JAVA11_HOME before running:

  `$env:JAVA8_HOME="C:\Path\To\jdk-8"
  .\start-server-agent.ps1
"@
}

$arguments = @("--tcp-port", $TcpPort, "--udp-port", $UdpPort)

if ($AutoShutdown) {
    $arguments += "--auto-shutdown"
}

if ($SysInfo) {
    $arguments += "--sysinfo"
}

$java = Resolve-CompatibleJava -RequestedJavaPath $JavaPath

Write-Host "Launching ServerAgent from $agentRoot"
Write-Host "Java: $($java.Path) (major $($java.Major))"
Write-Host "TCP port: $TcpPort"
Write-Host "UDP port: $UdpPort"

Push-Location $agentRoot
try {
    & $java.Path -jar $agentJar --tool PerfMonAgent @arguments
} finally {
    Pop-Location
}
