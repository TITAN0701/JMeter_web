[CmdletBinding()]
param(
    [string]$OutputPath = "reports\system_metrics.csv",
    [string]$WorkspacePath,
    [int]$IntervalSeconds = 5
)

$ErrorActionPreference = "Stop"

$outDir = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

if ([string]::IsNullOrWhiteSpace($WorkspacePath)) {
    if (-not [string]::IsNullOrWhiteSpace($outDir)) {
        $WorkspacePath = Split-Path -Parent (Resolve-Path -LiteralPath $outDir)
    } else {
        $WorkspacePath = (Get-Location).Path
    }
}

function Get-DirectorySizeBytes {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return 0
    }

    $size = [double]0
    $pending = New-Object System.Collections.Generic.Stack[string]
    $pending.Push($Path)

    while ($pending.Count -gt 0) {
        $current = $pending.Pop()

        try {
            foreach ($file in [System.IO.Directory]::EnumerateFiles($current)) {
                try {
                    $size += ([System.IO.FileInfo]$file).Length
                } catch {
                    continue
                }
            }

            foreach ($directory in [System.IO.Directory]::EnumerateDirectories($current)) {
                $pending.Push($directory)
            }
        } catch {
            continue
        }
    }

    return $size
}

function Get-FileSetSizeBytes {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Filter
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return 0
    }

    $size = (
        Get-ChildItem -LiteralPath $Path -Filter $Filter -File -Force -ErrorAction SilentlyContinue |
            Measure-Object -Property Length -Sum
    ).Sum

    if ($null -eq $size) {
        return 0
    }

    return [double]$size
}

function Get-ProcessMetrics {
    param(
        [Parameter(Mandatory = $true)]$ProcessRows,
        [Parameter(Mandatory = $true)]$PerfRows,
        [Parameter(Mandatory = $true)][scriptblock]$Filter
    )

    $matched = @($ProcessRows | Where-Object $Filter)
    $ids = @($matched | Select-Object -ExpandProperty ProcessId)
    $perfMatched = @($PerfRows | Where-Object { $ids -contains $_.IDProcess })

    $cpu = ($perfMatched | Measure-Object -Property PercentProcessorTime -Sum).Sum
    $memoryBytes = ($matched | Measure-Object -Property WorkingSetSize -Sum).Sum

    if ($null -eq $cpu) { $cpu = 0 }
    if ($null -eq $memoryBytes) { $memoryBytes = 0 }

    return @{
        Count = $matched.Count
        CpuPercent = [Math]::Round([double]$cpu, 2)
        MemoryMb = [Math]::Round(([double]$memoryBytes / 1MB), 2)
    }
}

$header = @(
    "timestamp",
    "cpu_percent",
    "memory_percent",
    "available_memory_mb",
    "disk_read_bytes_sec",
    "disk_write_bytes_sec",
    "disk_free_mb",
    "disk_free_percent",
    "network_received_bytes_sec",
    "network_sent_bytes_sec",
    "network_bytes_sec",
    "java_process_count",
    "java_process_cpu_percent",
    "java_process_memory_mb",
    "jmeter_process_count",
    "jmeter_process_cpu_percent",
    "jmeter_process_memory_mb",
    "workspace_size_mb",
    "jtl_size_mb",
    "html_report_size_mb"
)

($header -join ",") | Set-Content -Path $OutputPath -Encoding UTF8

while ($true) {
    try {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        $cpu = Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor |
            Where-Object { $_.Name -eq "_Total" } |
            Select-Object -ExpandProperty PercentProcessorTime -First 1

        $os = Get-CimInstance Win32_OperatingSystem
        $totalMemoryKb = [double]$os.TotalVisibleMemorySize
        $freeMemoryKb = [double]$os.FreePhysicalMemory
        $availableMemoryMb = [Math]::Round($freeMemoryKb / 1024, 2)
        $memoryPercent = if ($totalMemoryKb -gt 0) {
            [Math]::Round((($totalMemoryKb - $freeMemoryKb) / $totalMemoryKb) * 100, 2)
        } else {
            0
        }

        $disk = Get-CimInstance Win32_PerfFormattedData_PerfDisk_LogicalDisk |
            Where-Object { $_.Name -eq "_Total" } |
            Select-Object -First 1

        $workspaceRoot = Get-Item -LiteralPath $WorkspacePath -ErrorAction SilentlyContinue
        $driveName = if ($null -ne $workspaceRoot) { $workspaceRoot.PSDrive.Name } else { (Get-Location).Drive.Name }
        $logicalDisk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$($driveName):'"
        $diskFreeMb = if ($null -ne $logicalDisk) { [Math]::Round(([double]$logicalDisk.FreeSpace / 1MB), 2) } else { 0 }
        $diskFreePercent = if ($null -ne $logicalDisk -and [double]$logicalDisk.Size -gt 0) {
            [Math]::Round(([double]$logicalDisk.FreeSpace / [double]$logicalDisk.Size) * 100, 2)
        } else {
            0
        }

        $network = Get-CimInstance Win32_PerfFormattedData_Tcpip_NetworkInterface
        $networkReceivedBytes = ($network | Measure-Object -Property BytesReceivedPersec -Sum).Sum
        $networkSentBytes = ($network | Measure-Object -Property BytesSentPersec -Sum).Sum
        $networkBytes = ($network | Measure-Object -Property BytesTotalPersec -Sum).Sum
        if ($null -eq $networkReceivedBytes) { $networkReceivedBytes = 0 }
        if ($null -eq $networkSentBytes) { $networkSentBytes = 0 }
        if ($null -eq $networkBytes) { $networkBytes = 0 }

        $processRows = Get-CimInstance Win32_Process
        $perfRows = Get-CimInstance Win32_PerfFormattedData_PerfProc_Process

        $javaMetrics = Get-ProcessMetrics `
            -ProcessRows $processRows `
            -PerfRows $perfRows `
            -Filter { $_.Name -in @("java.exe", "javaw.exe") }

        $jmeterMetrics = Get-ProcessMetrics `
            -ProcessRows $processRows `
            -PerfRows $perfRows `
            -Filter {
                $_.Name -in @("java.exe", "javaw.exe") -and
                $_.CommandLine -match "(?i)(ApacheJMeter|jmeter)"
            }

        $reportsPath = Join-Path $WorkspacePath "reports"
        $workspaceSizeMb = [Math]::Round((Get-DirectorySizeBytes -Path $WorkspacePath) / 1MB, 2)
        $jtlSizeMb = [Math]::Round((Get-FileSetSizeBytes -Path $reportsPath -Filter "results_*.jtl") / 1MB, 2)
        $htmlReportSizeBytes = (
            Get-ChildItem -LiteralPath $reportsPath -Directory -Filter "html_*" -Force -ErrorAction SilentlyContinue |
                ForEach-Object { Get-DirectorySizeBytes -Path $_.FullName } |
                Measure-Object -Sum
        ).Sum
        if ($null -eq $htmlReportSizeBytes) { $htmlReportSizeBytes = 0 }
        $htmlReportSizeMb = [Math]::Round(([double]$htmlReportSizeBytes / 1MB), 2)

        $line = "{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11},{12},{13},{14},{15},{16},{17},{18},{19}" -f `
            $timestamp,
            $cpu,
            $memoryPercent,
            $availableMemoryMb,
            $disk.DiskReadBytesPersec,
            $disk.DiskWriteBytesPersec,
            $diskFreeMb,
            $diskFreePercent,
            $networkReceivedBytes,
            $networkSentBytes,
            $networkBytes,
            $javaMetrics.Count,
            $javaMetrics.CpuPercent,
            $javaMetrics.MemoryMb,
            $jmeterMetrics.Count,
            $jmeterMetrics.CpuPercent,
            $jmeterMetrics.MemoryMb,
            $workspaceSizeMb,
            $jtlSizeMb,
            $htmlReportSizeMb

        Add-Content -Path $OutputPath -Value $line -Encoding UTF8
    } catch {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $emptyColumns = "," * ($header.Count - 1)
        Add-Content -Path $OutputPath -Value "$timestamp$emptyColumns" -Encoding UTF8
    }

    Start-Sleep -Seconds $IntervalSeconds
}
