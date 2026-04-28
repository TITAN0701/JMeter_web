[CmdletBinding()]
param(
    [string]$JMeterHome,
    [string]$TestPlan = "Test Plan_0408_light.jmx",
    [string]$CsvPath = "users.csv",
    [int]$Threads = 3,
    [int]$RampUp = 3,
    [int]$Duration = 1800,
    [Nullable[double]]$TargetThroughput,
    [Nullable[int]]$ThroughputPeriod,
    [Nullable[int]]$ThroughputDuration,
    [int]$LoopCount = -1,
    [string]$ControllerName,
    [int]$ControllerIndex,
    [switch]$ListControllers,
    [string]$ResultRoot = "results",
    [string]$RunName,
    [switch]$SkipHtmlReport,
    [switch]$Gui,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-PathFromRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue,

        [Parameter(Mandatory = $true)]
        [string]$RootPath
    )

    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return [System.IO.Path]::GetFullPath($PathValue)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $RootPath $PathValue))
}

function Find-JMeterHome {
    param(
        [string]$ExplicitHome,
        [string]$ScriptRoot
    )

    $candidates = [System.Collections.Generic.List[string]]::new()

    if ($ExplicitHome) {
        $candidates.Add($ExplicitHome)
    }

    if ($env:JMETER_HOME) {
        $candidates.Add($env:JMETER_HOME)
    }

    $candidates.Add((Join-Path $ScriptRoot "..\\apache-jmeter-5.6.3"))
    $candidates.Add((Join-Path $ScriptRoot "..\\..\\apache-jmeter-5.6.3"))
    $candidates.Add("C:\\apache-jmeter-5.6.3")

    foreach ($candidate in $candidates) {
        if (-not $candidate) {
            continue
        }

        $resolved = [System.IO.Path]::GetFullPath($candidate)
        $jmeterBat = Join-Path $resolved "bin\\jmeter.bat"

        if (Test-Path -LiteralPath $jmeterBat) {
            return $resolved
        }

        $nestedHome = Get-ChildItem -Path $resolved -Directory -Filter "apache-jmeter*" -ErrorAction SilentlyContinue |
            Select-Object -First 1 -ExpandProperty FullName

        if ($nestedHome) {
            $nestedBat = Join-Path $nestedHome "bin\\jmeter.bat"

            if (Test-Path -LiteralPath $nestedBat) {
                return $nestedHome
            }
        }
    }

    throw "Cannot find JMeter. Use -JMeterHome or set JMETER_HOME."
}

function Get-ThreadGroupHashTree {
    param(
        [Parameter(Mandatory = $true)]
        [xml]$XmlDocument
    )

    $threadGroup = $XmlDocument.SelectSingleNode("//ThreadGroup")

    if (-not $threadGroup) {
        throw "Cannot find ThreadGroup in test plan."
    }

    $hashTree = $threadGroup.SelectSingleNode("following-sibling::hashTree[1]")

    if (-not $hashTree) {
        throw "Cannot find ThreadGroup hashTree in test plan."
    }

    return $hashTree
}

function Get-TopLevelControllers {
    param(
        [Parameter(Mandatory = $true)]
        [xml]$XmlDocument
    )

    $threadGroupHashTree = Get-ThreadGroupHashTree -XmlDocument $XmlDocument

    return @(
        $threadGroupHashTree.ChildNodes |
            Where-Object {
                $_.NodeType -eq [System.Xml.XmlNodeType]::Element -and
                $_.Attributes["testclass"] -and
                $_.Attributes["testclass"].Value -match "Controller$"
            }
    )
}

function New-PreparedTestPlan {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourcePath,

        [Parameter(Mandatory = $true)]
        [string]$DestinationPath,

        [Parameter(Mandatory = $true)]
        [int]$ThreadsValue,

        [Parameter(Mandatory = $true)]
        [int]$RampUpValue,

        [Parameter(Mandatory = $true)]
        [int]$DurationValue,

        [Nullable[double]]$TargetThroughputValue,

        [Nullable[int]]$ThroughputPeriodValue,

        [Nullable[int]]$ThroughputDurationValue,

        [Parameter(Mandatory = $true)]
        [int]$LoopCountValue,

        [Parameter(Mandatory = $true)]
        [string]$CsvFilePath,

        [string]$ControllerNameValue,

        [int]$ControllerIndexValue
    )

    $xml = New-Object System.Xml.XmlDocument
    $xml.PreserveWhitespace = $true
    $xml.Load($SourcePath)

    $threadGroupNode = $xml.SelectSingleNode("//ThreadGroup")
    if (-not $threadGroupNode) {
        throw "Cannot find ThreadGroup in test plan."
    }

    function Get-OrCreateNamedChildNode {
        param(
            [Parameter(Mandatory = $true)]
            [System.Xml.XmlDocument]$XmlDocument,

            [Parameter(Mandatory = $true)]
            [System.Xml.XmlNode]$ParentNode,

            [Parameter(Mandatory = $true)]
            [string]$ElementName,

            [Parameter(Mandatory = $true)]
            [string]$PropertyName,

            [string]$InsertBeforeXPath
        )

        $existingNode = $ParentNode.SelectSingleNode("*[local-name()='$ElementName' and @name='$PropertyName']")
        if ($existingNode) {
            return $existingNode
        }

        $newNode = $XmlDocument.CreateElement($ElementName)
        $nameAttribute = $XmlDocument.CreateAttribute("name")
        $nameAttribute.Value = $PropertyName
        [void]$newNode.Attributes.Append($nameAttribute)

        $insertBeforeNode = $null
        if ($InsertBeforeXPath) {
            $insertBeforeNode = $ParentNode.SelectSingleNode($InsertBeforeXPath)
        }

        if ($insertBeforeNode) {
            [void]$ParentNode.InsertBefore($newNode, $insertBeforeNode)
        } else {
            [void]$ParentNode.AppendChild($newNode)
        }

        return $newNode
    }

    $threadGroupInsertBeforeXPath = "*[@name='ThreadGroup.same_user_on_next_iteration'] | *[@name='ThreadGroup.on_sample_error'] | elementProp[@name='ThreadGroup.main_controller']"

    $threadCountNode = Get-OrCreateNamedChildNode `
        -XmlDocument $xml `
        -ParentNode $threadGroupNode `
        -ElementName "intProp" `
        -PropertyName "ThreadGroup.num_threads" `
        -InsertBeforeXPath $threadGroupInsertBeforeXPath
    $threadCountNode.InnerText = [string]$ThreadsValue

    $rampUpNode = Get-OrCreateNamedChildNode `
        -XmlDocument $xml `
        -ParentNode $threadGroupNode `
        -ElementName "intProp" `
        -PropertyName "ThreadGroup.ramp_time" `
        -InsertBeforeXPath $threadGroupInsertBeforeXPath
    $rampUpNode.InnerText = [string]$RampUpValue

    $durationNode = Get-OrCreateNamedChildNode `
        -XmlDocument $xml `
        -ParentNode $threadGroupNode `
        -ElementName "longProp" `
        -PropertyName "ThreadGroup.duration" `
        -InsertBeforeXPath $threadGroupInsertBeforeXPath
    $durationNode.InnerText = [string]$DurationValue

    $mainControllerNode = $threadGroupNode.SelectSingleNode("elementProp[@name='ThreadGroup.main_controller']")
    if (-not $mainControllerNode) {
        throw "Cannot find ThreadGroup.main_controller in test plan."
    }

    $loopNode = $mainControllerNode.SelectSingleNode("*[@name='LoopController.loops']")
    if (-not $loopNode) {
        $loopNode = Get-OrCreateNamedChildNode `
            -XmlDocument $xml `
            -ParentNode $mainControllerNode `
            -ElementName "stringProp" `
            -PropertyName "LoopController.loops" `
            -InsertBeforeXPath "*[@name='LoopController.continue_forever']"
    }
    $loopNode.InnerText = [string]$LoopCountValue

    $csvNode = $xml.SelectSingleNode("//CSVDataSet/stringProp[@name='filename']")
    if (-not $csvNode) {
        throw "Cannot find expected node in test plan: //CSVDataSet/stringProp[@name='filename']"
    }
    $csvNode.InnerText = $CsvFilePath

    $preciseThroughputTimerNode = $xml.SelectSingleNode("//PreciseThroughputTimer")
    if ((($null -ne $TargetThroughputValue) -or ($null -ne $ThroughputPeriodValue) -or ($null -ne $ThroughputDurationValue)) -and (-not $preciseThroughputTimerNode)) {
        throw "Cannot find Precise Throughput Timer in test plan."
    }

    if ($preciseThroughputTimerNode) {
        if ($null -ne $TargetThroughputValue) {
            $throughputValueNode = $preciseThroughputTimerNode.SelectSingleNode("doubleProp[name='throughput']/value")
            if (-not $throughputValueNode) {
                throw "Cannot find throughput value in Precise Throughput Timer."
            }
            $throughputValueNode.InnerText = [string]$TargetThroughputValue
        }

        if ($null -ne $ThroughputPeriodValue) {
            $throughputPeriodNode = $preciseThroughputTimerNode.SelectSingleNode("intProp[@name='throughputPeriod']")
            if (-not $throughputPeriodNode) {
                throw "Cannot find throughputPeriod in Precise Throughput Timer."
            }
            $throughputPeriodNode.InnerText = [string]$ThroughputPeriodValue
        }

        if ($null -ne $ThroughputDurationValue) {
            $throughputDurationNode = $preciseThroughputTimerNode.SelectSingleNode("longProp[@name='duration']")
            if (-not $throughputDurationNode) {
                throw "Cannot find duration in Precise Throughput Timer."
            }
            $throughputDurationNode.InnerText = [string]$ThroughputDurationValue
        }
    }

    $schedulerNode = $threadGroupNode.SelectSingleNode("boolProp[@name='ThreadGroup.scheduler']")
    if (-not $schedulerNode) {
        $schedulerNode = $xml.CreateElement("boolProp")
        $nameAttribute = $xml.CreateAttribute("name")
        $nameAttribute.Value = "ThreadGroup.scheduler"
        [void]$schedulerNode.Attributes.Append($nameAttribute)

        $sameUserNode = $threadGroupNode.SelectSingleNode("boolProp[@name='ThreadGroup.same_user_on_next_iteration']")
        if ($sameUserNode) {
            [void]$threadGroupNode.InsertBefore($schedulerNode, $sameUserNode)
        } else {
            [void]$threadGroupNode.AppendChild($schedulerNode)
        }
    }

    $schedulerNode.InnerText = "true"

    if ($ControllerNameValue -and $ControllerIndexValue) {
        throw "Use either -ControllerName or -ControllerIndex, not both."
    }

    if ($ControllerNameValue -or $ControllerIndexValue) {
        $controllers = @(Get-TopLevelControllers -XmlDocument $xml)

        if ($controllers.Count -eq 0) {
            throw "No top-level controllers found under ThreadGroup."
        }

        $targetController = $null
        $targetControllerPosition = $null

        if ($ControllerIndexValue) {
            if ($ControllerIndexValue -lt 1 -or $ControllerIndexValue -gt $controllers.Count) {
                throw ("Controller index {0} is out of range. Available range: 1-{1}" -f $ControllerIndexValue, $controllers.Count)
            }

            $targetController = $controllers[$ControllerIndexValue - 1]
            $targetControllerPosition = $ControllerIndexValue - 1
        }

        if ($ControllerNameValue) {
            $targetController = $controllers | Where-Object { $_.Attributes["testname"].Value -eq $ControllerNameValue } | Select-Object -First 1

            if (-not $targetController) {
                $partialMatches = @(
                    $controllers |
                        Where-Object { $_.Attributes["testname"].Value -like "*$ControllerNameValue*" } |
                        Select-Object -First 2
                )

                if ($partialMatches.Count -gt 1) {
                    throw "More than one controller matches '$ControllerNameValue'. Use -ListControllers to see exact names."
                }

                $targetController = $partialMatches | Select-Object -First 1
            }

            if ($targetController) {
                $targetControllerPosition = [Array]::IndexOf($controllers, $targetController)
            }
        }

        if (($null -eq $targetController) -or ($targetControllerPosition -lt 0)) {
            $availableNames = $controllers | ForEach-Object { $_.Attributes["testname"].Value }
            throw ("Controller '{0}' not found. Available: {1}" -f $ControllerNameValue, ($availableNames -join ", "))
        }

        for ($controllerIndex = 0; $controllerIndex -lt $controllers.Count; $controllerIndex++) {
            $controller = $controllers[$controllerIndex]
            $enabledAttribute = $controller.Attributes["enabled"]

            if (-not $enabledAttribute) {
                $enabledAttribute = $xml.CreateAttribute("enabled")
                [void]$controller.Attributes.Append($enabledAttribute)
            }

            if ($controllerIndex -eq $targetControllerPosition) {
                $enabledAttribute.Value = "true"
            } else {
                $enabledAttribute.Value = "false"
            }
        }
    }

    $settings = New-Object System.Xml.XmlWriterSettings
    $settings.Encoding = New-Object System.Text.UTF8Encoding($false)
    $settings.Indent = $true

    $writer = [System.Xml.XmlWriter]::Create($DestinationPath, $settings)
    try {
        $xml.Save($writer)
    } finally {
        $writer.Dispose()
    }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$resolvedTestPlan = Resolve-PathFromRoot -PathValue $TestPlan -RootPath $scriptRoot

if (-not (Test-Path -LiteralPath $resolvedTestPlan)) {
    throw "Test plan not found: $resolvedTestPlan"
}

$testPlanXml = New-Object System.Xml.XmlDocument
$testPlanXml.PreserveWhitespace = $true
$testPlanXml.Load($resolvedTestPlan)

if ($ListControllers) {
    $controllers = @(Get-TopLevelControllers -XmlDocument $testPlanXml)

    if ($controllers.Count -eq 0) {
        Write-Host "No top-level controllers found under ThreadGroup."
        return
    }

    Write-Host "Available controllers:"
    $index = 1
    foreach ($controller in $controllers) {
        Write-Host ("{0}. {1}" -f $index, $controller.Attributes["testname"].Value)
        $index++
    }
    return
}

$resolvedJMeterHome = Find-JMeterHome -ExplicitHome $JMeterHome -ScriptRoot $scriptRoot
$resolvedCsvPath = Resolve-PathFromRoot -PathValue $CsvPath -RootPath $scriptRoot
$resolvedResultRoot = Resolve-PathFromRoot -PathValue $ResultRoot -RootPath $scriptRoot
$jmeterBat = Join-Path $resolvedJMeterHome "bin\\jmeter.bat"

if (-not (Test-Path -LiteralPath $resolvedCsvPath)) {
    throw "CSV file not found: $resolvedCsvPath"
}

if (-not $RunName) {
    $RunName = Get-Date -Format "yyyyMMdd_HHmmss"
}

$runDir = Join-Path $resolvedResultRoot $RunName
$resultFile = Join-Path $runDir "results.jtl"
$logFile = Join-Path $runDir "jmeter.log"
$reportDir = Join-Path $runDir "html-report"
$preparedTestPlan = Join-Path $runDir "generated-test-plan.jmx"

New-Item -ItemType Directory -Path $runDir -Force | Out-Null

if ((-not $SkipHtmlReport) -and (Test-Path -LiteralPath $reportDir)) {
    Remove-Item -LiteralPath $reportDir -Recurse -Force
}

New-PreparedTestPlan `
    -SourcePath $resolvedTestPlan `
    -DestinationPath $preparedTestPlan `
    -ThreadsValue $Threads `
    -RampUpValue $RampUp `
    -DurationValue $Duration `
    -TargetThroughputValue $TargetThroughput `
    -ThroughputPeriodValue $ThroughputPeriod `
    -ThroughputDurationValue $ThroughputDuration `
    -LoopCountValue $LoopCount `
    -CsvFilePath $resolvedCsvPath `
    -ControllerNameValue $ControllerName `
    -ControllerIndexValue $ControllerIndex

$arguments = [System.Collections.Generic.List[string]]::new()

if ($Gui) {
    $arguments.Add("-t")
    $arguments.Add($preparedTestPlan)
} else {
    $arguments.Add("-n")
    $arguments.Add("-t")
    $arguments.Add($preparedTestPlan)
    $arguments.Add("-l")
    $arguments.Add($resultFile)
    $arguments.Add("-j")
    $arguments.Add($logFile)

    if (-not $SkipHtmlReport) {
        $arguments.Add("-e")
        $arguments.Add("-o")
        $arguments.Add($reportDir)
    }
}

$arguments.Add("-Djava.awt.headless=true")

Write-Host "JMeter home : $resolvedJMeterHome"
Write-Host "Test plan   : $resolvedTestPlan"
Write-Host "Prepared    : $preparedTestPlan"
Write-Host "CSV path    : $resolvedCsvPath"
Write-Host "Threads     : $Threads"
Write-Host "Ramp-up     : $RampUp"
Write-Host "Duration    : $Duration"
Write-Host "Throughput  : $(if ($null -ne $TargetThroughput) { $TargetThroughput } else { 'UNCHANGED' })"
Write-Host "TP period   : $(if ($null -ne $ThroughputPeriod) { $ThroughputPeriod } else { 'UNCHANGED' })"
Write-Host "TP duration : $(if ($null -ne $ThroughputDuration) { $ThroughputDuration } else { 'UNCHANGED' })"
Write-Host "Loop count  : $LoopCount"
Write-Host "Controller  : $(if ($ControllerIndex) { "Index $ControllerIndex" } elseif ($ControllerName) { $ControllerName } else { 'ALL' })"

if (-not $Gui) {
    Write-Host "Run dir     : $runDir"
    Write-Host "JTL         : $resultFile"
    Write-Host "Log         : $logFile"

    if (-not $SkipHtmlReport) {
        Write-Host "HTML report : $reportDir"
    }
}

Write-Host ""
Write-Host "Command:"
Write-Host ('"{0}" {1}' -f $jmeterBat, ($arguments -join " "))

if ($DryRun) {
    return
}

Push-Location $scriptRoot
try {
    & $jmeterBat @arguments
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

if ($exitCode -ne 0) {
    throw "JMeter exited with code $exitCode"
}

if (-not $Gui) {
    Write-Host ""
    Write-Host "Run completed."
    Write-Host "Results: $resultFile"
    Write-Host "Log    : $logFile"

    if (-not $SkipHtmlReport) {
        Write-Host "Report : $reportDir\\index.html"
    }
}
