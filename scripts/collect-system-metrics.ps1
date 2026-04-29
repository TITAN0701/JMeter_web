[CmdletBinding()]
param(
    [string]$OutputPath = "reports\system_metrics.csv",
    [int]$IntervalSeconds = 5
)

$ErrorActionPreference = "Stop"

$outDir = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

"timestamp,cpu_percent,memory_percent,available_memory_mb,disk_read_bytes_sec,disk_write_bytes_sec,network_bytes_sec" |
    Set-Content -Path $OutputPath -Encoding UTF8

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

        $networkBytes = (
            Get-CimInstance Win32_PerfFormattedData_Tcpip_NetworkInterface |
                Measure-Object -Property BytesTotalPersec -Sum
        ).Sum

        $line = "{0},{1},{2},{3},{4},{5},{6}" -f `
            $timestamp,
            $cpu,
            $memoryPercent,
            $availableMemoryMb,
            $disk.DiskReadBytesPersec,
            $disk.DiskWriteBytesPersec,
            $networkBytes

        Add-Content -Path $OutputPath -Value $line -Encoding UTF8
    } catch {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path $OutputPath -Value "$timestamp,,,,,," -Encoding UTF8
    }

    Start-Sleep -Seconds $IntervalSeconds
}
