# Jenkins 壓測 CI 環境部署

這份文件說明如何部署 Jenkins + JMeter + Performance Plugin 的壓測 CI 環境。

## 建議架構

```text
GitHub Repository
  |
  | checkout
  v
Jenkins Controller
  |
  | dispatch job
  v
Windows Jenkins Agent
  |
  | powershell + JMeter CLI
  v
reports/results_*.jtl
  |
  | perfReport
  v
Jenkins Performance Trend
```

建議把真正執行壓測的工作放在 Jenkins agent，不要在 Jenkins controller 上直接跑壓測。

## 角色分工

```text
Jenkins controller
|-- 管理 job
|-- 安裝 Jenkins plugin
|-- 保存 build history
`-- 顯示 Performance report

Windows Jenkins agent
|-- 安裝 Java
|-- 安裝 Apache JMeter
|-- 執行 powershell
|-- 跑 runtest_with_report.ps1
`-- 產出 JTL / HTML report

GitHub repo
|-- Jenkinsfile
|-- tests/*.jmx
|-- data/*
|-- runtest_with_report.ps1
`-- docs/*
```

## Jenkins Controller 需求

必要 plugin：

- Pipeline
- Git
- Performance Plugin

建議設定：

- 建立獨立 Jenkins job 或 Multibranch Pipeline
- Job 從 GitHub repo 讀取 `Jenkinsfile`
- 不要把壓測報告產物 commit 回 GitHub，由 Jenkins archive artifacts 保存

GitHub repo：

```text
https://github.com/TITAN0701/JMeter_web.git
```

Pipeline script path：

```text
Jenkinsfile
```

## Windows Agent 需求

建議安裝位置：

```text
C:\Tools\apache-jmeter-5.6.3
```

JMeter bin：

```text
C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat
```

必要環境：

- Java
- Apache JMeter 5.6.3
- Windows PowerShell
- Agent 可連線到被測系統
- Agent 可寫入 Jenkins workspace

驗證指令：

```powershell
java -version
C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat -v
powershell -NoProfile -Command "$PSVersionTable.PSVersion"
```

也可以在本 repo 內執行檢查腳本：

```powershell
.\scripts\check-ci-env.ps1 `
  -JMeterBin "C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat" `
  -Workspace "C:\Jenkins\workspace\JMeter_web"
```

## JMeter 安裝方式

1. 下載 Apache JMeter 5.6.3。
2. 解壓縮到：

```text
C:\Tools\apache-jmeter-5.6.3
```

3. 確認以下檔案存在：

```text
C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat
```

4. 在 Jenkins job 參數 `JMETER_BIN` 填入同一路徑。

## Jenkins Job 建立

建議使用 Pipeline job。

設定：

```text
Definition: Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/TITAN0701/JMeter_web.git
Branch: main
Script Path: Jenkinsfile
```

第一次執行後，Jenkins 會讀到 Jenkinsfile 內的參數。

## Pipeline 參數

```text
JMETER_BIN          Jenkins agent 上的 jmeter.bat 路徑
TEST_PLAN          要執行的 JMX，例如 tests\20260204_3.jmx
TRANSACTION_CONTROLLER_NAME          指定要啟用的 Transaction Controller，空白代表沿用 JMX
TRANSACTION_CONTROLLER_REGEX         是否用 regex 比對 Transaction Controller
TRANSACTION_CONTROLLER_IGNORE_CASE   是否忽略大小寫
THREAD_GROUP_NAME                    指定要覆寫的 Thread Group，空白代表套用全部 Thread Group
THREAD_GROUP_REGEX                   是否用 regex 比對 Thread Group
THREAD_GROUP_IGNORE_CASE             是否忽略大小寫
NUM_THREADS        虛擬使用者數
LOOP_COUNT         每個 thread 執行次數
RAMP_UP            幾秒內啟動所有 thread
DURATION_SECONDS   執行秒數，-1 代表沿用 JMX 設定
```

## 建議 Smoke Test

第一次部署不要直接跑大流量，先用小參數確認 Jenkins 與 JMeter 串接正常。

```text
TEST_PLAN=tests\20260204_3.jmx
TRANSACTION_CONTROLLER_NAME=RXP
NUM_THREADS=1
LOOP_COUNT=1
RAMP_UP=1
DURATION_SECONDS=-1
```

確認項目：

- Console log 有看到 JMeter 執行
- `reports/results_*.jtl` 有產出
- `reports/html_*/index.html` 有產出
- Jenkins build 頁面有 Performance Report
- Jenkins artifacts 有封存 JTL / HTML report

## 指定 Controller 壓測

Jenkins job 可直接用參數指定要啟用的 Transaction Controller。

範例：

```text
TRANSACTION_CONTROLLER_NAME=RXP
TRANSACTION_CONTROLLER_REGEX=false
TRANSACTION_CONTROLLER_IGNORE_CASE=true
NUM_THREADS=5
LOOP_COUNT=3
RAMP_UP=10
DURATION_SECONDS=-1
```

若要一次比對多個 Controller，可使用 regex：

```text
TRANSACTION_CONTROLLER_NAME=rxp|vigi
TRANSACTION_CONTROLLER_REGEX=true
TRANSACTION_CONTROLLER_IGNORE_CASE=true
```

目前本機可用以下方式指定 Controller：

```powershell
.\runtest_with_report.ps1 `
  -TestPlan "tests\20260204_3.jmx" `
  -TransactionControllerName "RXP" `
  -NumThreads 5 `
  -LoopCount 3 `
  -RampUp 10
```

## Performance Plugin 門檻

目前 Jenkinsfile 設定：

```text
errorUnstableThreshold = 5
errorFailedThreshold   = 20
```

代表：

- 錯誤率大於 5%: build unstable
- 錯誤率大於 20%: build failed

## 產物保存

Jenkinsfile 會封存：

```text
reports/results_*.jtl
reports/html_*/**/*
jmeter.log
logs/**/*.log
```

這些檔案不建議 commit 回 GitHub。

## 常見問題

### Jenkins 找不到 jmeter.bat

確認 `JMETER_BIN` 是 Jenkins agent 上的路徑，不是你本機 VS Code 的路徑。

### 本機可跑，Jenkins 不能跑

常見原因：

- Jenkins agent 服務帳號沒有權限讀取 JMeter 目錄
- Jenkins agent 沒有 Java
- `JMETER_BIN` 指到使用者 Desktop
- 被測系統只允許本機 IP，沒有允許 Jenkins agent IP

### JTL 沒有 sample rows

先確認：

- JMX 內的 Controller 是否真的有啟用
- Thread Group 是否有 thread / loop
- 被測系統是否可連線
- 登入 token 或測試資料是否有效

### 不要把 raw recording 上傳

`recordings/` 可能含瀏覽器 token、API key 或個人遙測資料，所以已由 `.gitignore` 排除。
