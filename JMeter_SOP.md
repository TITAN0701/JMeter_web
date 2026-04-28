# JMeter SOP

## 1. 檔案分工

- `Test Plan_0408_light.jmx`：主腳本
- `run-jmeter.ps1`：執行腳本
- `results/<RunName>/generated-test-plan.jmx`：當次執行快照，不用手改

## 2. 操作流程圖

開始  
-> 先確認要跑哪個流程  
-> `.\run-jmeter.ps1 -ListControllers`  
-> 先做小量驗證  
-> `.\run-jmeter.ps1 -RunName smoke_3u_3m -Threads 3 -RampUp 3 -Duration 180`  
-> 沒錯再跑正式壓測  
-> `.\run-jmeter.ps1 -ControllerIndex 6 -Threads 100 -RampUp 60 -Duration 1800 -TargetThroughput 1000 -ThroughputPeriod 60 -ThroughputDuration 1800 -RunName pressure_100u_30m_v1`  
-> 看 `results/<RunName>/html-report/index.html`  
-> 有錯再回查 `results.jtl`  
-> 結束

## 3. 常用參數

- `-RunName`
  - 這次測試的名稱
  - 例如：`pressure_100u_30m_v1`

- `-Threads`
  - 同時在線的使用者數
  - 例如：`100`

- `-RampUp`
  - 幾秒內把人數加到目標值
  - 例如：`60` 表示 60 秒升到 100 人

- `-Duration`
  - 測試總長度，單位是秒
  - 例如：`1800` = 30 分鐘

- `-LoopCount`
  - 每個使用者重複跑幾次
  - `-1` 通常代表持續跑到時間結束

- `-ControllerName`
  - 只跑某一個流程
  - 例如：`"Transaction Controller: 檢查孩童列表"`

- `-ControllerIndex`
  - 用編號指定只跑哪一個流程
  - 先用 `-ListControllers` 查編號

- `-TargetThroughput`
  - 目標吞吐量
  - 通常配合 `Precise Throughput Timer` 使用

- `-ThroughputPeriod`
  - 吞吐量的時間單位
  - 例如：`60` 代表以 60 秒為一個區間

- `-ThroughputDuration`
  - 吞吐控制持續多久，單位是秒
  - 例如：`1800` = 30 分鐘

- `-ListControllers`
  - 列出所有可跑流程

- `-CsvPath`
  - 指定測資檔
  - 預設是 `users.csv`

## 4. 看報表順序

1. `Active Threads Over Time`
   看有沒有真的維持目標人數

2. `Total Transactions Per Second`
   看吞吐量穩不穩

3. `Response Time Percentiles Over Time`
   看 `P95`、`P99` 是否持續變高

4. `Statistics`
   看平均、P95、P99、錯誤率

## 5. 出錯怎麼判斷

- `400`
  - 先想參數錯、資料錯、條件不合法

- `401 / 403`
  - 先查登入、token、權限

- `5xx`
  - 先查後端錯誤或壓力問題

## 6. 排錯流程圖

發現錯誤  
-> 打開 `results.jtl`  
-> 找失敗 API  
-> 看 `responseCode`  
-> 看 `responseMessage`  
-> 看 `URL`  
-> 回頭對照畫面或 JMeter 流程  
-> 判斷是功能問題還是性能問題

## 7. 注意

- 要改流程，改 `Test Plan_0408_light.jmx`
- 不要改 `generated-test-plan.jmx`
- `Transaction Controller` 失敗，通常要往下看是哪支 API 真正失敗
## 8. 監控工具安裝與使用（精簡版）

### 8.1 已安裝內容

- `JMeter Plugins Manager`
- `PerfMon Metrics Collector`
- `ServerAgent`

### 8.2 檔案位置

- JMeter：
  `C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3`
- ServerAgent：
  `C:\Users\suppo\Desktop\國衛院-兒童web\stress\tools\ServerAgent-2.2.3\ServerAgent-2.2.3`
- 啟動腳本：
  `.\start-server-agent.ps1`

### 8.3 啟動監控 Agent

在專案目錄執行：

```powershell
.\start-server-agent.ps1
```

若要先查看可監控的網卡、磁碟、Process：

```powershell
.\start-server-agent.ps1 -SysInfo
```

預設連線埠：

- TCP `4444`
- UDP `4444`

### 8.4 JMeter 內如何操作

1. 開啟 JMeter。
2. 在 Test Plan 或 Thread Group 下新增：
   `Listener -> jp@gc - PerfMon Metrics Collector`
3. 新增監控主機：
   - Host：`127.0.0.1`
   - Port：`4444`
4. 建議先加入以下指標：
   - `CPU`
   - `Memory`
   - `Network I/O`
5. 先啟動 `ServerAgent`，再開始跑 JMeter。

### 8.5 重新產生 HTTPS Recorder 憑證

本次已重新產生以下檔案：

- `proxyserver.jks`
- `ApacheJMeterTemporaryRootCA.crt`
- `ApacheJMeterTemporaryRootCA.usr`

位置都在：

`C:\Users\suppo\Desktop\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin`

舊憑證備份檔：

- `proxyserver.jks.bak_20260423_180402`

### 8.6 錄製 HTTPS 封包時怎麼做

1. 先確認 JMeter 已關閉再重新開啟。
2. 到 JMeter `bin` 目錄找到：
   `ApacheJMeterTemporaryRootCA.crt`
3. 將這個憑證匯入瀏覽器或 Windows 信任憑證存放區。
4. 若瀏覽器裡仍有舊的 JMeter 過期憑證，先刪除。
5. 再開啟 `HTTP(S) Test Script Recorder` 進行錄製。

### 8.7 注意事項

- `PerfMon` 只能看到有啟動 `ServerAgent` 的主機資源。
- 若要監控遠端主機，需在遠端主機也啟動 `ServerAgent`，並開放對應 Port。
- 若只看 JMeter HTML Report，無法直接得出 CPU / 記憶體使用率，仍需搭配 `PerfMon`。
