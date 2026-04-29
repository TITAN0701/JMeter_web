[CmdletBinding()]
param(
    [string]$ReportDir = "",
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ReportDir)) {
    $reportsRoot = Join-Path (Get-Location) "reports"
    $latest = Get-ChildItem -Path $reportsRoot -Directory -Filter "html_*" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latest) {
        throw "No JMeter html_* report directory found under $reportsRoot"
    }

    $ReportDir = $latest.FullName
}

$ReportDir = (Resolve-Path -LiteralPath $ReportDir).Path
$indexPath = Join-Path $ReportDir "index.html"
if (-not (Test-Path -LiteralPath $indexPath)) {
    throw "index.html not found under $ReportDir"
}

$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Serving JMeter report:"
Write-Host "  $ReportDir"
Write-Host "Open:"
Write-Host "  $prefix"
Write-Host "Press Ctrl+C to stop."

Start-Process $prefix

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $relativePath = [System.Uri]::UnescapeDataString($context.Request.Url.LocalPath.TrimStart("/"))
        if ([string]::IsNullOrWhiteSpace($relativePath)) {
            $relativePath = "index.html"
        }

        $filePath = Join-Path $ReportDir $relativePath
        $resolvedFile = $null
        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
            $resolvedFile = (Resolve-Path -LiteralPath $filePath).Path
        }

        if ($resolvedFile -and $resolvedFile.StartsWith($ReportDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            switch -Regex ([System.IO.Path]::GetExtension($resolvedFile)) {
                "\.html?$" { $context.Response.ContentType = "text/html; charset=utf-8"; break }
                "\.css$" { $context.Response.ContentType = "text/css; charset=utf-8"; break }
                "\.js$" { $context.Response.ContentType = "application/javascript; charset=utf-8"; break }
                "\.json$" { $context.Response.ContentType = "application/json; charset=utf-8"; break }
                "\.png$" { $context.Response.ContentType = "image/png"; break }
                "\.jpg|\.jpeg$" { $context.Response.ContentType = "image/jpeg"; break }
                "\.svg$" { $context.Response.ContentType = "image/svg+xml"; break }
                default { $context.Response.ContentType = "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($resolvedFile)
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $context.Response.StatusCode = 404
        }

        $context.Response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
