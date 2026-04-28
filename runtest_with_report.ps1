# === JMeter CLI Runner (output JTL + HTML report) ===
param(
    [string]$JMeterBin = "C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat",
    [string]$TestPlan = "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx",
    [string]$OutDir = "C:\Users\suppo\Desktop\JMeter\reports",
    [switch]$UseRemote,
    [string]$RemoteHosts = "",
    [switch]$SkipMissingCsv = $true,
    [string]$TransactionControllerName = "",
    [switch]$TransactionControllerRegex,
    [switch]$TransactionControllerIgnoreCase,
    [int]$NumThreads = -1,
    [int]$RampUp = -1,
    [int]$LoopCount = -1,
    [int]$DurationSeconds = -1,
    [string]$ThreadGroupName = "",
    [switch]$ThreadGroupRegex,
    [switch]$ThreadGroupIgnoreCase,
    [switch]$EnableCustomGraphs = $true,
    [string]$CustomGraphMetric = "elapsed",
    [string]$CustomGraphTitle = "Elapsed Over Time",
    [int]$CustomGraphGranularityMs = 1000
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
$TestPlanToRun = $TestPlan
$TempPlan = $null

function Resolve-DataFilePath {
    param(
        [string]$Path,
        [string]$BaseDir
    )

    if ([string]::IsNullOrWhiteSpace($Path)) { return $null }
    if ($Path -match "\$\{.+\}") { return $null }

    $candidate = $Path -replace "/", "\"
    if ([System.IO.Path]::IsPathRooted($candidate)) {
        return $candidate
    }

    return (Join-Path $BaseDir $candidate)
}

function Get-JtlSampleCount {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) { return $null }

    $firstNonEmpty = Get-Content -Path $Path -TotalCount 5 |
        Where-Object { $_ -and $_.Trim().Length -gt 0 } |
        Select-Object -First 1

    if (-not $firstNonEmpty) { return 0 }

    if ($firstNonEmpty.TrimStart().StartsWith("<")) {
        $pattern = '<(httpSample|sample)\b'
        $count = 0
        Get-Content -Path $Path -ReadCount 1000 | ForEach-Object {
            $text = $_ -join "`n"
            $count += [regex]::Matches($text, $pattern).Count
        }
        return $count
    }

    $totalLines = (Get-Content -Path $Path -ReadCount 10000 | Measure-Object -Line).Lines
    if ($totalLines -le 0) { return 0 }

    $hasHeader = $firstNonEmpty -match '^(timeStamp|timestamp),'
    if ($hasHeader) {
        return [Math]::Max(0, $totalLines - 1)
    }

    return $totalLines
}

try {
    $baseDir = Split-Path -Parent $TestPlan
    $rawJmx = [System.IO.File]::ReadAllText($TestPlan)
    $missingCsv = New-Object System.Collections.Generic.List[string]
    $updated = $false
    $pattern = "(?s)<CSVDataSet\b[^>]*>.*?</CSVDataSet>"

    $rawJmx = [regex]::Replace($rawJmx, $pattern, {
        param($m)
        $block = $m.Value
        $filenameMatch = [regex]::Match($block, '<stringProp name="filename">([^<]*)</stringProp>')
        if (-not $filenameMatch.Success) { return $block }

        $rawPath = $filenameMatch.Groups[1].Value
        $resolvedPath = Resolve-DataFilePath -Path $rawPath -BaseDir $baseDir
        if (-not $resolvedPath) { return $block }

        if (-not (Test-Path $resolvedPath)) {
            $null = $missingCsv.Add($rawPath)
            if ($SkipMissingCsv) {
                $script:updated = $true
                if ($block -match 'enabled="false"') { return $block }
                if ($block -match '<CSVDataSet\b[^>]*\benabled="') {
                    return [regex]::Replace($block, '(<CSVDataSet\b[^>]*\benabled=")[^"]*(")', '$1false$2', 1)
                }
                return [regex]::Replace($block, '<CSVDataSet\b', '<CSVDataSet enabled="false"', 1)
            }
        }

        return $block
    })

    if ($missingCsv.Count -gt 0) {
        if ($SkipMissingCsv) {
            if ($updated) {
                Write-Host "Disabled CSV Data Set Config(s) due to missing files:"
            } else {
                Write-Host "Missing CSV file(s) referenced by disabled CSV Data Set Config(s):"
            }
            $missingCsv | ForEach-Object { Write-Host " - $_" }
        } else {
            Write-Host "Missing CSV file(s) referenced by CSV Data Set Config:"
            $missingCsv | ForEach-Object { Write-Host " - $_" }
            exit 1
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($TransactionControllerName)) {
        $tcMatches = New-Object System.Collections.Generic.List[string]
        $tcPattern = "(?s)<TransactionController\b[^>]*>"
        $regexOptions = [System.Text.RegularExpressions.RegexOptions]::None
        if ($TransactionControllerIgnoreCase) {
            $regexOptions = $regexOptions -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        }

        $rawJmx = [regex]::Replace($rawJmx, $tcPattern, {
            param($m)
            $tag = $m.Value
            $nameMatch = [regex]::Match($tag, 'testname="([^"]*)"')
            $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { "" }

            $isMatch = $false
            if ($nameMatch.Success) {
                if ($TransactionControllerRegex) {
                    $isMatch = [regex]::IsMatch($name, $TransactionControllerName, $regexOptions)
                } else {
                    if ($TransactionControllerIgnoreCase) {
                        $isMatch = $name.Equals($TransactionControllerName, [System.StringComparison]::OrdinalIgnoreCase)
                    } else {
                        $isMatch = ($name -eq $TransactionControllerName)
                    }
                }
            }

            $newTag = $tag
            if ($isMatch) {
                $null = $tcMatches.Add($name)
                if ($tag -match 'enabled="false"') {
                    $newTag = [regex]::Replace($tag, 'enabled="false"', 'enabled="true"', 1)
                } elseif ($tag -notmatch 'enabled="') {
                    $newTag = [regex]::Replace($tag, '<TransactionController\b', '<TransactionController enabled="true"', 1)
                }
            } else {
                if ($tag -match 'enabled="true"') {
                    $newTag = [regex]::Replace($tag, 'enabled="true"', 'enabled="false"', 1)
                } elseif ($tag -notmatch 'enabled="') {
                    $newTag = [regex]::Replace($tag, '<TransactionController\b', '<TransactionController enabled="false"', 1)
                }
            }

            if ($newTag -ne $tag) { $script:updated = $true }
            return $newTag
        })

        if ($tcMatches.Count -eq 0) {
            Write-Host "Transaction Controller not found: $TransactionControllerName"
            exit 1
        }

        Write-Host "Transaction Controller filter: $TransactionControllerName"
        Write-Host ("Matched {0} controller(s)" -f $tcMatches.Count)
        $tcMatches | ForEach-Object { Write-Host " - $_" }
    }

    if (($NumThreads -ge 0) -or ($RampUp -ge 0) -or ($LoopCount -ge 0) -or ($DurationSeconds -ge 0)) {
        $tgMatches = New-Object System.Collections.Generic.List[string]
        $tgPattern = "(?s)<ThreadGroup\b[^>]*>.*?</ThreadGroup>"
        $tgRegexOptions = [System.Text.RegularExpressions.RegexOptions]::None
        if ($ThreadGroupIgnoreCase) {
            $tgRegexOptions = $tgRegexOptions -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        }

        $rawJmx = [regex]::Replace($rawJmx, $tgPattern, {
            param($m)
            $block = $m.Value
            $nameMatch = [regex]::Match($block, 'testname="([^"]*)"')
            $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { "" }

            $apply = $true
            if (-not [string]::IsNullOrWhiteSpace($ThreadGroupName)) {
                if ($ThreadGroupRegex) {
                    $apply = $nameMatch.Success -and [regex]::IsMatch($name, $ThreadGroupName, $tgRegexOptions)
                } else {
                    if ($ThreadGroupIgnoreCase) {
                        $apply = $nameMatch.Success -and $name.Equals($ThreadGroupName, [System.StringComparison]::OrdinalIgnoreCase)
                    } else {
                        $apply = $nameMatch.Success -and ($name -eq $ThreadGroupName)
                    }
                }
            }

            if (-not $apply) { return $block }
            if ($nameMatch.Success) { $null = $tgMatches.Add($name) }

            if ($NumThreads -ge 0) {
                $replacement = '<intProp name="ThreadGroup.num_threads">{0}</intProp>' -f $NumThreads
                if ($block -match '<intProp name="ThreadGroup.num_threads">[^<]*</intProp>') {
                    $block = [regex]::Replace($block, '<intProp name="ThreadGroup.num_threads">[^<]*</intProp>', $replacement, 1)
                } else {
                    $block = [regex]::Replace($block, '</ThreadGroup>', ($replacement + '</ThreadGroup>'), 1)
                }
                $script:updated = $true
            }

            if ($RampUp -ge 0) {
                $replacement = '<intProp name="ThreadGroup.ramp_time">{0}</intProp>' -f $RampUp
                if ($block -match '<intProp name="ThreadGroup.ramp_time">[^<]*</intProp>') {
                    $block = [regex]::Replace($block, '<intProp name="ThreadGroup.ramp_time">[^<]*</intProp>', $replacement, 1)
                } else {
                    $block = [regex]::Replace($block, '</ThreadGroup>', ($replacement + '</ThreadGroup>'), 1)
                }
                $script:updated = $true
            }

            if ($LoopCount -ge 0) {
                $replacement = '<stringProp name="LoopController.loops">{0}</stringProp>' -f $LoopCount
                if ($block -match '<stringProp name="LoopController.loops">[^<]*</stringProp>') {
                    $block = [regex]::Replace($block, '<stringProp name="LoopController.loops">[^<]*</stringProp>', $replacement, 1)
                } else {
                    $block = [regex]::Replace($block, '</ThreadGroup>', ($replacement + '</ThreadGroup>'), 1)
                }

                $cfReplacement = '<boolProp name="LoopController.continue_forever">false</boolProp>'
                if ($block -match '<boolProp name="LoopController.continue_forever">[^<]*</boolProp>') {
                    $block = [regex]::Replace($block, '<boolProp name="LoopController.continue_forever">[^<]*</boolProp>', $cfReplacement, 1)
                } else {
                    $block = [regex]::Replace($block, '</ThreadGroup>', ($cfReplacement + '</ThreadGroup>'), 1)
                }
                $script:updated = $true
            }

            if ($DurationSeconds -ge 0) {
                $durationReplacement = '<longProp name="ThreadGroup.duration">{0}</longProp>' -f $DurationSeconds
                if ($block -match '<longProp name="ThreadGroup.duration">[^<]*</longProp>') {
                    $block = [regex]::Replace($block, '<longProp name="ThreadGroup.duration">[^<]*</longProp>', $durationReplacement, 1)
                } else {
                    $block = [regex]::Replace($block, '</ThreadGroup>', ($durationReplacement + '</ThreadGroup>'), 1)
                }

                $schedulerReplacement = '<boolProp name="ThreadGroup.scheduler">true</boolProp>'
                if ($block -match '<boolProp name="ThreadGroup.scheduler">[^<]*</boolProp>') {
                    $block = [regex]::Replace($block, '<boolProp name="ThreadGroup.scheduler">[^<]*</boolProp>', $schedulerReplacement, 1)
                } else {
                    $block = [regex]::Replace($block, '</ThreadGroup>', ($schedulerReplacement + '</ThreadGroup>'), 1)
                }

                if ($LoopCount -lt 0) {
                    $loopsForeverReplacement = '<stringProp name="LoopController.loops">-1</stringProp>'
                    if ($block -match '<stringProp name="LoopController.loops">[^<]*</stringProp>') {
                        $block = [regex]::Replace($block, '<stringProp name="LoopController.loops">[^<]*</stringProp>', $loopsForeverReplacement, 1)
                    } else {
                        $block = [regex]::Replace($block, '</ThreadGroup>', ($loopsForeverReplacement + '</ThreadGroup>'), 1)
                    }

                    $continueForeverReplacement = '<boolProp name="LoopController.continue_forever">true</boolProp>'
                    if ($block -match '<boolProp name="LoopController.continue_forever">[^<]*</boolProp>') {
                        $block = [regex]::Replace($block, '<boolProp name="LoopController.continue_forever">[^<]*</boolProp>', $continueForeverReplacement, 1)
                    } else {
                        $block = [regex]::Replace($block, '</ThreadGroup>', ($continueForeverReplacement + '</ThreadGroup>'), 1)
                    }
                }

                $script:updated = $true
            }

            return $block
        })

        if (-not [string]::IsNullOrWhiteSpace($ThreadGroupName) -and ($tgMatches.Count -eq 0)) {
            Write-Host "Thread Group not found: $ThreadGroupName"
            exit 1
        }

        if ($tgMatches.Count -gt 0) {
            Write-Host ("Thread Group overrides applied to {0} group(s)" -f $tgMatches.Count)
            $tgMatches | ForEach-Object { Write-Host " - $_" }
        } else {
            Write-Host "Thread Group overrides applied."
        }
    }

    if ($updated) {
        $TempPlan = Join-Path $env:TEMP ("jmx_enabled_{0}.jmx" -f $Timestamp)
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($TempPlan, $rawJmx, $utf8NoBom)
        $TestPlanToRun = $TempPlan
    }
} catch {
    Write-Host "Warning: failed to scan test plan for CSV checks. Using original test plan."
}
$ResultFile = Join-Path $OutDir ("results_{0}.jtl" -f $Timestamp)
$ReportDir = Join-Path $OutDir ("html_{0}" -f $Timestamp)

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

Write-Host "JMeter Bin : $JMeterBin"
Write-Host "Test Plan  : $TestPlan"
if ($TestPlanToRun -ne $TestPlan) {
    Write-Host "Effective Plan : $TestPlanToRun"
}
Write-Host "Result JTL : $ResultFile"
Write-Host "Report Dir : $ReportDir"

if ($UseRemote) {
    if ([string]::IsNullOrWhiteSpace($RemoteHosts)) {
        Write-Host "UseRemote is set but RemoteHosts is empty."
        exit 1
    }
    Write-Host "Mode: remote ($RemoteHosts)"
    & $JMeterBin -n -t $TestPlanToRun -l $ResultFile -R $RemoteHosts
} else {
    Write-Host "Mode: local"
    & $JMeterBin -n -t $TestPlanToRun -l $ResultFile
}

if (Test-Path $ResultFile) {
    $lines = Get-Content $ResultFile -TotalCount 2
    if ($lines.Count -ge 2) {
        $sampleCount = Get-JtlSampleCount -Path $ResultFile
        if ($null -ne $sampleCount) {
            Write-Host ("Sample rows: {0}" -f $sampleCount)
        }
        $reportArgs = @("-g", $ResultFile, "-o", $ReportDir)
        if ($EnableCustomGraphs -and -not [string]::IsNullOrWhiteSpace($CustomGraphMetric)) {
            $graphId = "custom_{0}" -f ($CustomGraphMetric -replace "[^A-Za-z0-9_]", "_")
            $yAxis = if ([string]::IsNullOrWhiteSpace($CustomGraphTitle)) { $CustomGraphMetric } else { $CustomGraphTitle }

            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.classname=org.apache.jmeter.report.processor.graph.impl.CustomGraphConsumer"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.title=$CustomGraphTitle"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.set_Y_Axis=$yAxis"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.set_X_Axis=Over Time"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.set_Y_Axis=$yAxis"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.set_X_Axis=Over Time"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.set_granularity=$CustomGraphGranularityMs"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.set_Sample_Variable_Name=$CustomGraphMetric"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.set_Content_Message=${yAxis}:"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.setSampleVariableName=$CustomGraphMetric"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.setContentMessage=${yAxis}:"
            $reportArgs += "-Jjmeter.reportgenerator.graph.$graphId.property.setIsNativeSampleVariableName=true"

            Write-Host "Custom graph enabled: $graphId ($CustomGraphMetric)"
        }
        & $JMeterBin @reportArgs
        Write-Host "Done: $ResultFile"
        Write-Host "Report: $ReportDir"
        Write-Host "Open report:"
        Write-Host ("Start-Process `"{0}\index.html`"" -f $ReportDir)
    } else {
        Write-Host "Done: $ResultFile"
        Write-Host "Report skipped: JTL has no sample rows."
        exit 2
    }
} else {
    Write-Host "Error: result file not created."
    exit 1
}

if ($TempPlan -and (Test-Path $TempPlan)) {
    Remove-Item -Force $TempPlan
}
