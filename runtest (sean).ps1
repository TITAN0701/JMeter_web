# === 設定變數 ===
$JMeterBin = "C:\Users\suppo\OneDrive\Desktop\starlux_testing\apache-jmeter-5.6.3\bin\jmeter.bat"
$TestPlan = "C:\Users\suppo\OneDrive\Desktop\starlux_testing\2026-01\StartAirLines.jmx"
$ResultFile = "result.jtl"
$ReportDir = "report"

# === 模式選擇 ===
$UseRemote = $true  # 改成 $false 就會用本地模式
$RemoteHosts = "192.168.100.176"  # 遠端 Slave IP

# === 刪除舊結果與報告 ===
Write-Host "清除舊的結果與報表..."
Remove-Item -Path $ResultFile -Force -ErrorAction SilentlyContinue
Remove-Item -Path $ReportDir -Recurse -Force -ErrorAction SilentlyContinue

# === 執行 JMeter 測試 ===
if ($UseRemote) {
    Write-Host "開始執行 JMeter 遠端測試（Slave: $RemoteHosts）..."
    & $JMeterBin -n -t $TestPlan -l $ResultFile -R $RemoteHosts
} else {
    Write-Host "開始執行 JMeter 本地測試..."
    & $JMeterBin -n -t $TestPlan -l $ResultFile
}

# === 等待測試完成 ===
Write-Host "JMeter 測試完成，檢查結果..."

# === 檢查結果檔案是否存在 ===
if (Test-Path $ResultFile) {
    Write-Host "結果檔案已產生：$ResultFile"
    New-Item -ItemType Directory -Path $ReportDir -Force
    
    # === 執行報表產出 ===
    Write-Host "產出 HTML 報表中..."
    & $JMeterBin -g $ResultFile -o $ReportDir

    Write-Host "HTML 報表產出完成，位置：$ReportDir"
} else {
    Write-Host "錯誤：找不到結果檔案 $ResultFile"
    exit 1
}

# === 結尾提示 ===
Write-Host "全部流程已完成。"