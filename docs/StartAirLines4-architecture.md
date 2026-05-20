# StartAirLines4 測試架構流程圖

適用測試計畫：

- `tests/StartAirLines4.jmx`

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                           StartAirLines4.jmx                                │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      v
┌──────────────────────────────────────────────────────────────────────────────┐
│                                Test Plan                                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      v
┌───────────────────────────────┬──────────────────────────────────────────────┐
│ 一般測試流程                  │ CDN 測試流程                                  │
├───────────────────────────────┼──────────────────────────────────────────────┤
│ Thread Group                  │ Thread Group (CDN Test)                      │
│                               │                                              │
│ 使用正常 DNS                  │ DNS Cache Manager                            │
│ 不指定 34 IP                  │ www.starlux-airlines.com -> 34.81.90.144     │
│                               │                                              │
│ STARLUX Home Page             │ HTTP Request Defaults                        │
│ www.starlux-airlines.com      │ Server Name = www.starlux-airlines.com       │
│                               │ Protocol = https                             │
│                               │ Port = 443                                   │
│                               │                                              │
│ Flight Status Page            │ HTTP Header Manager                          │
│ www.starlux-airlines.com      │ 模擬瀏覽器頁面請求 Header                    │
│                               │                                              │
│ Flight Status API             │ HTTP Request                                 │
│ ecapi.starlux-airlines.com    │ GET /zh-TW                                   │
│                               │                                              │
│ API Assertions                │ 實際連線 IP                                  │
│ $.success = true              │ 34.81.90.144                                 │
│ HTTP 200                      │                                              │
└───────────────────────────────┴──────────────────────────────────────────────┘
                                      │
                                      v
┌──────────────────────────────────────────────────────────────────────────────┐
│                              測試結果輸出                                    │
│                    View Results Tree / Summary Report                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 補充說明

- 一般測試流程使用正常 DNS，不設定 `34.81.90.144`。
- CDN 測試流程只針對 `www.starlux-airlines.com` 指定解析到 `34.81.90.144`。
- CDN 測試雖然實際連線到 `34.81.90.144`，HTTP Host/SNI 仍維持 `www.starlux-airlines.com`。
- `ecapi.starlux-airlines.com` 不在 CDN mapping 內，因此 API 測試維持正常 DNS。
