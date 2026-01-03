# JavaScript Testing Guide - Dashboard Project

## 測試框架：Vitest

我們使用 **Vitest** 作為測試框架，原因：
- ✅ 與 Vite 完美整合
- ✅ 速度快
- ✅ Jest 相容的 API
- ✅ 支援 ESM (ES Modules)

---

## 測試結構

```
tests/
├── services/              # 服務層測試
│   ├── responseTime.test.js
│   ├── piholeMonitor.test.js
│   └── discord.test.js
└── routes/                # API 路由測試（未來）
```

---

## 執行測試

### 基本指令

```bash
# 執行所有測試
npm test

# 執行測試並顯示 UI 介面
npm run test:ui

# 執行測試並產生覆蓋率報告
npm run test:coverage
```

### Watch 模式

Vitest 預設會進入 watch 模式，當你修改程式碼時會自動重新執行測試。

**快捷鍵：**
- `h` - 顯示幫助
- `q` - 退出
- `a` - 重新執行所有測試
- `f` - 只執行失敗的測試

---

## 測試案例說明

### 1. Response Time Service (6 tests)

**檔案：** `tests/services/responseTime.test.js`

測試項目：
- ✅ 成功測量回應時間
- ✅ 處理失敗的請求
- ✅ 處理 timeout
- ✅ 追蹤所有服務
- ✅ 儲存結果到記憶體
- ✅ 取得最新回應時間

**關鍵技巧：**
```javascript
// Mock fetch API
global.fetch = vi.fn();

// Mock 成功回應
global.fetch.mockResolvedValueOnce({
  ok: true,
  status: 200,
});

// Mock 失敗回應
global.fetch.mockRejectedValueOnce(new Error('Network error'));
```

### 2. Pi-hole Monitor Service (5 tests)

**檔案：** `tests/services/piholeMonitor.test.js`

測試項目：
- ✅ 成功取得 Pi-hole 統計
- ✅ 處理 API 錯誤
- ✅ 處理非 OK HTTP 回應
- ✅ DNS 回應檢查（成功）
- ✅ DNS 回應檢查（失敗）

**關鍵技巧：**
```javascript
// Mock JSON 回應
global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({
    dns_queries_today: 1234,
    ads_blocked_today: 567,
  }),
});
```

### 3. Discord Notification Service (6 tests)

**檔案：** `tests/services/discord.test.js`

測試項目：
- ✅ 成功發送通知
- ✅ 處理 Discord API 錯誤
- ✅ 處理非 OK 回應
- ✅ 自訂 embed 選項
- ✅ 健康告警格式
- ✅ 服務下線告警格式

**關鍵技巧：**
```javascript
// 檢查 fetch 被呼叫的參數
expect(global.fetch).toHaveBeenCalledWith(
  mockWebhookUrl,
  expect.objectContaining({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
);

// 解析 POST body
const callArgs = global.fetch.mock.calls[0][1];
const body = JSON.parse(callArgs.body);
expect(body.embeds[0].title).toBe('Custom Title');
```

---

## 測試最佳實踐

### 1. AAA Pattern (Arrange-Act-Assert)

```javascript
it('should do something', async () => {
  // Arrange - 準備測試資料
  global.fetch.mockResolvedValueOnce({ ok: true });
  
  // Act - 執行要測試的函式
  const result = await someFunction();
  
  // Assert - 驗證結果
  expect(result.success).toBe(true);
});
```

### 2. 使用 beforeEach 清理 Mocks

```javascript
describe('Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 每個測試前清理 mock
  });
  
  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

### 3. 測試成功和失敗情境

```javascript
describe('someFunction', () => {
  it('should work when successful', async () => {
    // 測試成功情境
  });
  
  it('should handle errors gracefully', async () => {
    // 測試錯誤處理
  });
});
```

### 4. 使用描述性的測試名稱

```javascript
// ❌ 不好
it('test 1', () => { /* ... */ });

// ✅ 好
it('should return 200 when service is healthy', () => { /* ... */ });
```

---

## 常用 Vitest API

### 斷言 (Assertions)

```javascript
// 相等性
expect(value).toBe(expected);           // 嚴格相等 (===)
expect(value).toEqual(expected);        // 深度相等（物件）
expect(value).toMatchObject(expected);  // 部分匹配物件

// 真假值
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// 數字
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);

// 陣列
expect(array).toHaveLength(3);
expect(array).toContain(item);

// 物件屬性
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', value);

// 例外
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
```

### Mock Functions

```javascript
// 建立 mock
const mockFn = vi.fn();

// Mock 回傳值
mockFn.mockReturnValue(42);
mockFn.mockReturnValueOnce(1);  // 只第一次

// Mock 非同步
mockFn.mockResolvedValue(data);
mockFn.mockRejectedValue(error);

// 檢查呼叫
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);

// 取得呼叫資訊
mockFn.mock.calls[0];  // 第一次呼叫的參數
mockFn.mock.results[0]; // 第一次呼叫的結果
```

---

## 測試覆蓋率

執行覆蓋率報告：

```bash
npm run test:coverage
```

會產生：
- 終端機文字報告
- HTML 報告（在 `coverage/` 目錄）

**目標：**
- ✅ 語句覆蓋率 (Statements): > 80%
- ✅ 分支覆蓋率 (Branches): > 75%
- ✅ 函式覆蓋率 (Functions): > 80%
- ✅ 行覆蓋率 (Lines): > 80%

---

## 未來測試計劃

### 需要新增的測試

1. **Health Check Service**
   - 容器健康檢查
   - 資源統計

2. **API Routes**
   - `/api/monitoring/health`
   - `/api/monitoring/resources`
   - `/api/monitoring/pihole/stats`
   - 等等...

3. **Integration Tests**
   - 測試完整的 API 流程
   - 使用 supertest 測試 Express routes

### 範例：Route 測試

```javascript
import request from 'supertest';
import app from '../server.js';

describe('GET /api/monitoring/health', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/monitoring/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('health');
  });
});
```

---

## 測試結果

**目前狀態：** ✅ 17/17 tests passing

```
Test Files  3 passed (3)
     Tests  17 passed (17)
  Duration  ~100ms
```

**測試分布：**
- Response Time Service: 6 tests
- Pi-hole Monitor Service: 5 tests
- Discord Notification Service: 6 tests

---

## 常見問題

### Q: 為什麼要 mock fetch？

A: 因為測試不應該依賴外部服務（網路、API）。Mock 讓測試：
- 更快速
- 更可靠（不會因網路問題失敗）
- 可控制（可以測試各種情境）

### Q: 什麼時候該寫測試？

A: 建議：
- ✅ 核心業務邏輯
- ✅ 複雜的函式
- ✅ 容易出錯的地方
- ✅ API endpoints
- ❌ 簡單的 getter/setter
- ❌ 第三方套件的功能

### Q: 測試失敗怎麼辦？

A: 檢查：
1. 錯誤訊息（Vitest 會告訴你哪裡錯）
2. 預期值 vs 實際值
3. Mock 是否正確設定
4. 非同步問題（記得用 `async/await`）

---

**測試是程式品質的保證！** 🧪✅
