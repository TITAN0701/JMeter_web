param(
    [string]$JMeterBin = "C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat",
    [string]$Workspace = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Write-Check {
    param(
        [string]$Name,
        [bool]$Ok,
        [string]$Detail = ""
    )

    $status = if ($Ok) { "OK" } else { "FAIL" }
    if ([string]::IsNullOrWhiteSpace($Detail)) {
        Write-Host ("[{0}] {1}" -f $status, $Name)
    } else {
        Write-Host ("[{0}] {1}: {2}" -f $status, $Name, $Detail)
    }

    if (-not $Ok) {
        $script:hasFailure = $true
    }
}

$hasFailure = $false

try {
    $javaCommand = Get-Command java -ErrorAction Stop
    $javaVersion = (cmd /c "java -version 2>&1" | Select-Object -First 1)
    Write-Check -Name "Java" -Ok $true -Detail ("{0} ({1})" -f $javaVersion, $javaCommand.Source)
} catch {
    Write-Check -Name "Java" -Ok $false -Detail "java command not found"
}

Write-Check -Name "JMeter bin exists" -Ok (Test-Path -LiteralPath $JMeterBin) -Detail $JMeterBin

if (Test-Path -LiteralPath $JMeterBin) {
    try {
        $jmeterCommand = '"' + $JMeterBin + '" -v 2>&1'
        $jmeterVersion = (cmd /c $jmeterCommand | Select-String -Pattern "Version|Apache JMeter" | Select-Object -First 1)
        Write-Check -Name "JMeter executable" -Ok ($LASTEXITCODE -eq 0) -Detail ($jmeterVersion -as [string])
    } catch {
        Write-Check -Name "JMeter executable" -Ok $false -Detail $_.Exception.Message
    }
}

try {
    $psVersion = $PSVersionTable.PSVersion.ToString()
    Write-Check -Name "PowerShell" -Ok $true -Detail $psVersion
} catch {
    Write-Check -Name "PowerShell" -Ok $false -Detail $_.Exception.Message
}

try {
    New-Item -ItemType Directory -Path $Workspace -Force | Out-Null
    $probe = Join-Path $Workspace ".ci-write-test"
    "ok" | Set-Content -LiteralPath $probe -Encoding UTF8
    Remove-Item -LiteralPath $probe -Force
    Write-Check -Name "Workspace writable" -Ok $true -Detail $Workspace
} catch {
    Write-Check -Name "Workspace writable" -Ok $false -Detail $_.Exception.Message
}

if ($hasFailure) {
    exit 1
}

exit 0
