# JMeter 壓力測試與 Jenkins CI 說明

本專案用 JMeter 撰寫與執行壓力測試，並透過 Jenkins Performance Plugin 發布 `.jtl` 結果與趨勢圖。

## 專案結構

```text
JMeter/
|-- Jenkinsfile                 Jenkins Pipeline：執行 JMeter、發布 Performance 報告、封存產物
|-- README.md                   專案操作說明
|-- .gitignore                  排除報告、log、IDE cache、build output
|-- runtest_with_report.ps1     主要執行腳本：產生 JTL + HTML report，支援參數覆寫
|-- runtest.ps1                 基礎 JMeter CLI 執行腳本
|-- jmeter-config-summary.md    JMeter 設定摘要輸出
|-- tests/                      正式測試腳本 .jmx
|-- data/                       測試資料，例如 CSV
|-- recordings/                 JMeter Recorder 錄製產出的 .jmx
|-- reports/                    執行產物：results_*.jtl、html_*，不建議進版控
|-- logs/                       JMeter log，不建議進版控
|-- docs/                       操作文件與補充說明
`-- tools/
    `-- java/
        |-- src/AddThreadGroup.java    輔助工具：在 JMX 新增 Thread Group
        |-- run-add-threadgroup.ps1    編譯/執行 AddThreadGroup
        `-- out/                       Java 編譯產物，不建議進版控
```

`performance/` 是 Jenkins Performance Plugin 原始碼，不應放在本 JMeter 專案內；若要保留，建議放在 `Desktop/Jenkins/performance`。

## 環境需求

本機或 Jenkins agent 需要：

- Windows PowerShell
- Java
- Apache JMeter 5.6.3
- Jenkins agent 可執行 `powershell`

Jenkins controller 需要安裝：

- Performance Plugin
- Pipeline 相關外掛

不需要在 JMeter 專案內安裝 Maven。Maven 只有在要編譯 Jenkins plugin 原始碼時才需要。

## 本機執行 JMeter

基本範例：

```powershell
.\runtest_with_report.ps1 `
  -JMeterBin "C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat" `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -OutDir "C:\Users\suppo\Desktop\JMeter\reports"
```

執行後會產生：

- `reports/results_YYYYMMDD_HHMMSS.jtl`
- `reports/html_YYYYMMDD_HHMMSS/index.html`

## 常用操作

調整 Thread Group 參數：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -NumThreads 5 `
  -LoopCount 3 `
  -RampUp 10
```

只套用到指定 Thread Group：

```powershell
.\runtest_with_report.ps1 `
  -ThreadGroupName "Thread Group" `
  -NumThreads 5 `
  -LoopCount 3 `
  -RampUp 10
```

啟用指定 Transaction Controller，其餘 Transaction Controller 會被關閉：

```powershell
.\runtest_with_report.ps1 -TransactionControllerName "www.starlux-airlines.com"
```

用 regex 搜尋 Transaction Controller：

```powershell
.\runtest_with_report.ps1 `
  -TransactionControllerName "starlux" `
  -TransactionControllerRegex `
  -TransactionControllerIgnoreCase
```

遇到缺少 CSV 測試資料時，預設會停用缺檔的 CSV Data Set Config。若要改成直接失敗：

```powershell
.\runtest_with_report.ps1 -SkipMissingCsv:$false
```

關閉自訂圖表：

```powershell
.\runtest_with_report.ps1 -EnableCustomGraphs:$false
```

改用 Latency 產生自訂圖表：

```powershell
.\runtest_with_report.ps1 `
  -CustomGraphMetric "Latency" `
  -CustomGraphTitle "Latency Over Time"
```

開啟 HTML 報告：

```powershell
Start-Process "C:\Users\suppo\Desktop\JMeter\reports\html_YYYYMMDD_HHMMSS\index.html"
```

## Java 輔助工具

`tools/java/src/AddThreadGroup.java` 可用來在 JMX 新增 Thread Group。

```powershell
tools\java\run-add-threadgroup.ps1 `
  -InputPath "tests\StartAirLines.jmx" `
  -OutputPath "tests\StartAirLines_new.jmx" `
  -Name "TG_1"
```

## Jenkins 執行

`Jenkinsfile` 放在專案根目錄。Jenkins job 的 Script Path 使用：

```text
Jenkinsfile
```

Pipeline 流程：

```text
Checkout 專案
  ↓
Prepare：清理舊 reports/results_*.jtl 與 reports/html_*
  ↓
Run JMeter：呼叫 runtest_with_report.ps1
  ↓
Publish Performance：perfReport 讀取 reports/results_*.jtl
  ↓
Archive：封存 JTL、HTML report、log
```

可調整的 Jenkins 參數：

- `JMETER_BIN`: Jenkins agent 上的 `jmeter.bat` 路徑
- `TEST_PLAN`: 要執行的 `.jmx`，預設 `tests\20260204_3.jmx`
- `NUM_THREADS`: Thread 數
- `LOOP_COUNT`: Loop 次數
- `RAMP_UP`: Ramp-up 秒數

Performance Plugin 門檻：

- 錯誤率大於 5%: build unstable
- 錯誤率大於 20%: build failed

## 注意事項

- `reports/`、`logs/`、`.metals/`、`.bloop/`、`tools/java/out/` 已由 `.gitignore` 排除。
- 若 Jenkins 找不到 JMeter，先確認 `JMETER_BIN` 是否為 Jenkins agent 上的實際路徑。
- 若 VS Code 出現 Bloop/Metals 訊息，通常是 Scala/Metals 外掛快取，與 JMeter 壓測無關。
- 若 JTL 沒有 sample rows，HTML 報告會略過或產生失敗；先檢查 JMeter 測試是否真的送出 request。
