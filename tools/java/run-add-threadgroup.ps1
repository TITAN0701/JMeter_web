param(
    [string]$InputPath = "tests\StartAirLines.jmx",
    [string]$OutputPath = "",
    [string]$Name = "New Thread Group"
)

$jm = $env:JMETER_HOME
if (-not $jm) {
    $jm = "C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3"
}

$cp = "$jm\lib\*;$jm\lib\ext\*;tools\java\out"

if (-not (Test-Path "tools\java\out")) { New-Item -ItemType Directory -Force -Path "tools\java\out" | Out-Null }

javac -cp $cp -d tools\java\out tools\java\src\AddThreadGroup.java
if ($LASTEXITCODE -ne 0) { throw "javac failed" }

if ($OutputPath -eq "") { $OutputPath = $InputPath }

$javaArgs = @()
$javaArgs += $InputPath
$javaArgs += $OutputPath
$javaArgs += $Name

java -cp "$cp" AddThreadGroup @javaArgs
