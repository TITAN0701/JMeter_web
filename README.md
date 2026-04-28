# JMeter 壓力測試與 Jenkins CI 說明

本專案用 JMeter 管理壓力測試腳本，主要操作方式是：選擇既有的 Transaction Controller，然後調整 Thread Group 的併發數、迴圈次數、ramp-up 或執行時間，最後輸出 `.jtl` 與 HTML report。Jenkins 會用 Performance Plugin 讀取 `.jtl` 產生趨勢圖與門檻判斷。

## 專案結構

```text
JMeter/
|-- Jenkinsfile                 Jenkins Pipeline：執行 JMeter、發布 Performance 報告、封存產物
|-- README.md                   專案操作說明
|-- .gitignore                  排除報告、log、IDE cache、build output
|-- runtest_with_report.ps1     主要執行腳本：選 Controller、調整 Thread Group、產生 JTL + HTML
|-- runtest.ps1                 基礎 JMeter CLI 執行腳本
|-- jmeter-config-summary.md    JMeter 設定摘要輸出
|-- tests/                      正式測試腳本 .jmx
|-- data/                       測試資料，例如 CSV 或錄製後整理過的 JMX
|-- recordings/                 原始 Recorder 錄製檔，可能含 token，不建議進版控
|-- reports/                    執行產物：results_*.jtl、html_*，不建議進版控
|-- logs/                       JMeter log，不建議進版控
|-- docs/                       操作文件與補充說明
`-- tools/
    `-- java/
        |-- src/AddThreadGroup.java    輔助工具：在 JMX 新增 Thread Group，非日常主流程
        |-- run-add-threadgroup.ps1    編譯/執行 AddThreadGroup
        `-- out/                       Java 編譯產物，不建議進版控
```

`performance/` 是 Jenkins Performance Plugin 原始碼，不應放在本 JMeter 專案內；正常使用只需要在 Jenkins 安裝 Performance Plugin。

## 環境需求

本機或 Jenkins agent 需要：

- Windows PowerShell
- Java
- Apache JMeter 5.6.3
- Jenkins agent 可執行 `powershell`

Jenkins controller 需要安裝：

- Performance Plugin
- Pipeline 相關外掛

本專案不需要 Maven。Maven 只有在要編譯 Jenkins plugin 原始碼時才需要。

## 操作主軸

日常壓測通常不是新增 Thread Group，而是使用已整理好的 JMX：

```text
選擇測試腳本 .jmx
  ↓
指定要啟用的 Transaction Controller
  ↓
調整 Thread Group：threads / loop / ramp-up / duration
  ↓
執行 JMeter CLI
  ↓
輸出 JTL 與 HTML report
  ↓
Jenkins perfReport 讀取 JTL
```

`runtest_with_report.ps1` 會在執行前產生暫存 JMX，不會直接覆蓋原始 `.jmx`。

## 本機基本執行

```powershell
.\runtest_with_report.ps1 `
  -JMeterBin "C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat" `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -OutDir "C:\Users\suppo\Desktop\JMeter\reports"
```

執行後會產生：

- `reports/results_YYYYMMDD_HHMMSS.jtl`
- `reports/html_YYYYMMDD_HHMMSS/index.html`

## 指定 Controller 執行

只啟用指定 Transaction Controller，其餘 Transaction Controller 會被暫時關閉：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -TransactionControllerName "RXP"
```

使用模糊或正規表示式搜尋 Controller：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -TransactionControllerName "rxp|vigi" `
  -TransactionControllerRegex `
  -TransactionControllerIgnoreCase
```

目前常見 Controller 範例：

- `www.starlux-airlines.com`
- `RXP`
- `Vigi`
- `Home Page Transaction Controller`

## 用次數控制壓測

指定併發數、loop 次數、ramp-up：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -TransactionControllerName "RXP" `
  -NumThreads 5 `
  -LoopCount 3 `
  -RampUp 10
```

說明：

- `NumThreads`: 虛擬使用者數
- `LoopCount`: 每個 thread 執行幾次
- `RampUp`: 幾秒內把 threads 啟動完成

## 用時間控制壓測

指定併發數與執行時間：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -TransactionControllerName "RXP" `
  -NumThreads 20 `
  -RampUp 30 `
  -DurationSeconds 300
```

說明：

- `DurationSeconds 300` 代表執行 300 秒。
- 若只指定 `DurationSeconds`，腳本會把 loop 設為持續執行，直到時間到。
- 若同時指定 `LoopCount` 和 `DurationSeconds`，則以 loop 跑完或時間到先發生者為準。

## 指定 Thread Group

若一個 JMX 有多個 Thread Group，可只調整指定名稱：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "C:\Users\suppo\Desktop\JMeter\tests\20260204_3.jmx" `
  -ThreadGroupName "Thread Group" `
  -TransactionControllerName "RXP" `
  -NumThreads 10 `
  -LoopCount 5 `
  -RampUp 20
```

也可用 regex 找 Thread Group：

```powershell
.\runtest_with_report.ps1 `
  -ThreadGroupName "thread|login" `
  -ThreadGroupRegex `
  -ThreadGroupIgnoreCase `
  -NumThreads 10
```

## CSV 與缺檔處理

預設遇到缺少 CSV 測試資料時，會暫時停用缺檔的 CSV Data Set Config，避免整個測試直接中斷。

若希望缺檔時直接失敗：

```powershell
.\runtest_with_report.ps1 -SkipMissingCsv:$false
```

## HTML Report 與自訂圖表

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

## Jenkins 執行

`Jenkinsfile` 放在專案根目錄。Jenkins job 的 Script Path 使用：

```text
Jenkinsfile
```

Pipeline 流程：

```text
Checkout
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
- `DURATION_SECONDS`: 執行秒數，`-1` 代表沿用 JMX 設定

若 Jenkins 要用時間控制壓測，建議設定：

```text
LOOP_COUNT=-1
DURATION_SECONDS=300
```

Performance Plugin 門檻：

- 錯誤率大於 5%: build unstable
- 錯誤率大於 20%: build failed

## Java 輔助工具

`tools/java/src/AddThreadGroup.java` 可在 JMX 新增 Thread Group，但這不是日常壓測主流程。通常只在 JMX 結構缺 Thread Group 時使用。

```powershell
tools\java\run-add-threadgroup.ps1 `
  -InputPath "tests\StartAirLines.jmx" `
  -OutputPath "tests\StartAirLines_new.jmx" `
  -Name "TG_1"
```

## 注意事項

- `reports/`、`logs/`、`recordings/`、`.metals/`、`.bloop/`、`tools/java/out/` 已由 `.gitignore` 排除。
- `recordings/` 可能含瀏覽器 token 或個人遙測資料，不建議上傳 GitHub。
- 若 Jenkins 找不到 JMeter，先確認 `JMETER_BIN` 是否為 Jenkins agent 上的實際路徑。
- 若 JTL 沒有 sample rows，HTML 報告會略過或產生失敗；先檢查測試是否真的送出 request。
