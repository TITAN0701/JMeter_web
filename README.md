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
