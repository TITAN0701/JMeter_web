# === JMeter CLI Runner (output JTL + HTML report) ===
param(
    [string]$JMeterBin = "C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat",
    [string]$TestPlan = "C:\Users\suppo\Desktop\JMeter\tests\StartAirLines4.jmx",
    [string]$OutDir = "C:\Users\suppo\Desktop\JMeter\reports",
    [switch]$UseRemote,
    [string]$RemoteHosts = "",
    [switch]$SkipMissingCsv = $true,
    [string]$ControllerName = "",
    [int]$ControllerIndex = 0,
    [switch]$ControllerRegex,
    [switch]$ControllerIgnoreCase,
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

function Get-PercentileValue {
    param(
        [double[]]$Values,
        [double]$Percentile
    )

    if (-not $Values -or $Values.Count -eq 0) { return 0 }

    $sorted = $Values | Sort-Object
    $rank = [Math]::Ceiling(($Percentile / 100) * $sorted.Count) - 1
    $rank = [Math]::Max(0, [Math]::Min($rank, $sorted.Count - 1))
    return [double]$sorted[$rank]
}

function Write-StaticSummaryReport {
    param(
        [string]$JtlPath,
        [string]$OutputPath
    )

    if (-not (Test-Path -LiteralPath $JtlPath)) { return }

    $samples = Import-Csv -Path $JtlPath
    if (-not $samples -or $samples.Count -eq 0) { return }

    $elapsedValues = @($samples | ForEach-Object { [double]$_.elapsed })
    $timestamps = @($samples | ForEach-Object { [double]$_.timeStamp })
    $total = $samples.Count
    $errors = @($samples | Where-Object { $_.success -ne "true" }).Count
    $errorPct = if ($total -gt 0) { [Math]::Round(($errors / $total) * 100, 2) } else { 0 }
    $avg = [Math]::Round((($elapsedValues | Measure-Object -Average).Average), 2)
    $min = [Math]::Round((($elapsedValues | Measure-Object -Minimum).Minimum), 2)
    $max = [Math]::Round((($elapsedValues | Measure-Object -Maximum).Maximum), 2)
    $p90 = [Math]::Round((Get-PercentileValue -Values $elapsedValues -Percentile 90), 2)
    $p95 = [Math]::Round((Get-PercentileValue -Values $elapsedValues -Percentile 95), 2)
    $p99 = [Math]::Round((Get-PercentileValue -Values $elapsedValues -Percentile 99), 2)
    $durationSeconds = [Math]::Max(1, ((($timestamps | Measure-Object -Maximum).Maximum - ($timestamps | Measure-Object -Minimum).Minimum) / 1000))
    $throughput = [Math]::Round($total / $durationSeconds, 2)

    $rows = $samples |
        Group-Object label |
        ForEach-Object {
            $group = $_.Group
            $groupElapsed = @($group | ForEach-Object { [double]$_.elapsed })
            $groupTotal = $group.Count
            $groupErrors = @($group | Where-Object { $_.success -ne "true" }).Count
            [pscustomobject]@{
                Label = $_.Name
                Samples = $groupTotal
                Errors = $groupErrors
                ErrorPct = if ($groupTotal -gt 0) { [Math]::Round(($groupErrors / $groupTotal) * 100, 2) } else { 0 }
                Average = [Math]::Round((($groupElapsed | Measure-Object -Average).Average), 2)
                Min = [Math]::Round((($groupElapsed | Measure-Object -Minimum).Minimum), 2)
                Max = [Math]::Round((($groupElapsed | Measure-Object -Maximum).Maximum), 2)
                P90 = [Math]::Round((Get-PercentileValue -Values $groupElapsed -Percentile 90), 2)
                P95 = [Math]::Round((Get-PercentileValue -Values $groupElapsed -Percentile 95), 2)
                P99 = [Math]::Round((Get-PercentileValue -Values $groupElapsed -Percentile 99), 2)
            }
        } |
        Sort-Object Average -Descending

    $rowHtml = $rows | ForEach-Object {
        "<tr><td>$([System.Net.WebUtility]::HtmlEncode($_.Label))</td><td>$($_.Samples)</td><td>$($_.Errors)</td><td>$($_.ErrorPct)%</td><td>$($_.Average)</td><td>$($_.Min)</td><td>$($_.Max)</td><td>$($_.P90)</td><td>$($_.P95)</td><td>$($_.P99)</td></tr>"
    }

    $html = @"
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>JMeter Static Summary</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1f2933; }
    h1 { margin-bottom: 8px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 20px 0; }
    .card { border: 1px solid #d7dde4; border-radius: 6px; padding: 12px; background: #f8fafc; }
    .label { font-size: 12px; color: #5f6b7a; }
    .value { font-size: 22px; font-weight: 700; margin-top: 6px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #d7dde4; padding: 7px 8px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #eef2f6; }
    tr:nth-child(even) { background: #f9fbfd; }
  </style>
</head>
<body>
  <h1>JMeter Static Summary</h1>
  <div>Source JTL: $([System.Net.WebUtility]::HtmlEncode([System.IO.Path]::GetFileName($JtlPath)))</div>
  <div class="cards">
    <div class="card"><div class="label">Samples</div><div class="value">$total</div></div>
    <div class="card"><div class="label">Errors</div><div class="value">$errors</div></div>
    <div class="card"><div class="label">Error %</div><div class="value">$errorPct%</div></div>
    <div class="card"><div class="label">Throughput / sec</div><div class="value">$throughput</div></div>
    <div class="card"><div class="label">Avg ms</div><div class="value">$avg</div></div>
    <div class="card"><div class="label">Min ms</div><div class="value">$min</div></div>
    <div class="card"><div class="label">Max ms</div><div class="value">$max</div></div>
    <div class="card"><div class="label">P90 ms</div><div class="value">$p90</div></div>
    <div class="card"><div class="label">P95 ms</div><div class="value">$p95</div></div>
    <div class="card"><div class="label">P99 ms</div><div class="value">$p99</div></div>
  </div>
  <h2>Requests</h2>
  <table>
    <thead><tr><th>Label</th><th>Samples</th><th>Errors</th><th>Error %</th><th>Avg</th><th>Min</th><th>Max</th><th>P90</th><th>P95</th><th>P99</th></tr></thead>
    <tbody>
      $($rowHtml -join "`n")
    </tbody>
  </table>
</body>
</html>
"@

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($OutputPath, $html, $utf8NoBom)
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

    if ($ControllerIndex -gt 0 -and -not [string]::IsNullOrWhiteSpace($ControllerName)) {
        Write-Host "Use either ControllerIndex or ControllerName, not both."
        exit 1
    }

    if ($ControllerIndex -gt 0) {
        $controllerMatches = New-Object System.Collections.Generic.List[string]
        $controllerPattern = "(?s)<(?:GenericController|TransactionController)\b[^>]*>"
        $script:currentControllerIndex = 0

        $rawJmx = [regex]::Replace($rawJmx, $controllerPattern, {
            param($m)
            $script:currentControllerIndex++
            $tag = $m.Value
            $nameMatch = [regex]::Match($tag, 'testname="([^"]*)"')
            $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { "" }

            $newTag = $tag
            if ($script:currentControllerIndex -eq $ControllerIndex) {
                $null = $controllerMatches.Add($name)
                if ($tag -match 'enabled="false"') {
                    $newTag = [regex]::Replace($tag, 'enabled="false"', 'enabled="true"', 1)
                } elseif ($tag -notmatch 'enabled="') {
                    $newTag = [regex]::Replace($tag, '(<(?:GenericController|TransactionController)\b)', '$1 enabled="true"', 1)
                }
            } else {
                if ($tag -match 'enabled="true"') {
                    $newTag = [regex]::Replace($tag, 'enabled="true"', 'enabled="false"', 1)
                } elseif ($tag -notmatch 'enabled="') {
                    $newTag = [regex]::Replace($tag, '(<(?:GenericController|TransactionController)\b)', '$1 enabled="false"', 1)
                }
            }

            if ($newTag -ne $tag) { $script:updated = $true }
            return $newTag
        })

        if ($controllerMatches.Count -eq 0) {
            Write-Host "Controller index $ControllerIndex is out of range. Available range: 1-$script:currentControllerIndex"
            exit 1
        }

        Write-Host "Controller index: $ControllerIndex"
        $controllerMatches | ForEach-Object { Write-Host " - $_" }
    } elseif (-not [string]::IsNullOrWhiteSpace($ControllerName)) {
        $controllerMatches = New-Object System.Collections.Generic.List[string]
        $controllerPattern = "(?s)<(?:GenericController|TransactionController)\b[^>]*>"
        $regexOptions = [System.Text.RegularExpressions.RegexOptions]::None
        if ($ControllerIgnoreCase) {
            $regexOptions = $regexOptions -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        }

        $rawJmx = [regex]::Replace($rawJmx, $controllerPattern, {
            param($m)
            $tag = $m.Value
            $isGeneric = $tag -match '<GenericController\b'
            $nameMatch = [regex]::Match($tag, 'testname="([^"]*)"')
            $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { "" }

            $isMatch = $false
            if ($nameMatch.Success) {
                if ($ControllerRegex) {
                    $isMatch = [regex]::IsMatch($name, $ControllerName, $regexOptions)
                } else {
                    if ($ControllerIgnoreCase) {
                        $isMatch = $name.Equals($ControllerName, [System.StringComparison]::OrdinalIgnoreCase)
                    } else {
                        $isMatch = ($name -eq $ControllerName)
                    }
                }
            }

            $newTag = $tag
            if ($isMatch) {
                $null = $controllerMatches.Add($name)
                if ($tag -match 'enabled="false"') {
                    $newTag = [regex]::Replace($tag, 'enabled="false"', 'enabled="true"', 1)
                } elseif ($tag -notmatch 'enabled="') {
                    $newTag = [regex]::Replace($tag, '(<(?:GenericController|TransactionController)\b)', '$1 enabled="true"', 1)
                }
            } elseif (-not $isGeneric) {
                if ($tag -match 'enabled="true"') {
                    $newTag = [regex]::Replace($tag, 'enabled="true"', 'enabled="false"', 1)
                } elseif ($tag -notmatch 'enabled="') {
                    $newTag = [regex]::Replace($tag, '(<TransactionController\b)', '$1 enabled="false"', 1)
                }
            }

            if ($newTag -ne $tag) { $script:updated = $true }
            return $newTag
        })

        if ($controllerMatches.Count -eq 0) {
            Write-Host "Controller not found: $ControllerName"
            exit 1
        }

        Write-Host "Controller filter: $ControllerName"
        Write-Host ("Matched {0} controller(s)" -f $controllerMatches.Count)
        $controllerMatches | ForEach-Object { Write-Host " - $_" }
    } elseif (-not [string]::IsNullOrWhiteSpace($TransactionControllerName)) {
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
$SummaryReport = Join-Path $OutDir ("summary_{0}.html" -f $Timestamp)

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

Write-Host "JMeter Bin : $JMeterBin"
Write-Host "Test Plan  : $TestPlan"
if ($TestPlanToRun -ne $TestPlan) {
    Write-Host "Effective Plan : $TestPlanToRun"
}
Write-Host "Result JTL : $ResultFile"
Write-Host "Report Dir : $ReportDir"
Write-Host "Summary Report : $SummaryReport"

$previousJMeterBinEnv = $env:JMETER_BIN
$jmeterBinDir = (Split-Path -Parent $JMeterBin).TrimEnd("\") + "\"
$env:JMETER_BIN = $jmeterBinDir

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
        try {
            Write-StaticSummaryReport -JtlPath $ResultFile -OutputPath $SummaryReport
        } catch {
            Write-Host "Warning: failed to create static summary report."
            Write-Host $_.Exception.Message
        }
        Write-Host "Done: $ResultFile"
        Write-Host "Report: $ReportDir"
        if (Test-Path -LiteralPath $SummaryReport) {
            Write-Host "Summary: $SummaryReport"
        }
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

$env:JMETER_BIN = $previousJMeterBinEnv
