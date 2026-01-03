# Home Ops Dashboard

內網管理 Dashboard，用於管理 home server 各項服務。

## 功能

- 🔑 **API Keys 管理**: 新增、列出、停用 Gateway API 的 API Keys
- 🔌 **Port 視覺化**: 查看目前 Docker 容器佔用的 Port
- 📊 **Dashboard 總覽**: 系統狀態概覽

## 技術棧

- **前端**: Vite + React
- **後端**: Express + Dockerode
- **部署**: Docker（僅限內網）

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動 Vite 開發伺服器（前端）
npm run dev

# 啟動 Express 伺服器（需要 docker.sock）
npm start
```

## 部署

```bash
# 建置
npm run build

# Docker 部署
docker compose up -d
```

## 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `VITE_GATEWAY_URL` | Gateway API URL | `http://gateway:8000` |
| `PORT` | 伺服器 Port | `3000` |

| 端點 | 說明 |
|------|------|
| `GET /api/docker/containers` | 列出 Docker 容器 |
| `GET /api/docker/ports` | 列出 Port 映射 |
| `GET /api/health` | 健康檢查 |

## 架構說明

此專案是 **BFF (Backend for Frontend)** 架構，Express server 同時處理：

1. **靜態檔案伺服器** — 提供 React SPA (`dist/`)
2. **API 伺服器** — `/api/*` 路由 (Docker 操作、監控)
3. **Proxy 閘道** — `/internal/*` 轉發至 Gateway API

### ⚠️ Middleware 順序注意事項

`server.js` 中的 middleware 順序非常重要：

```javascript
// ✅ 正確順序
app.use('/internal', proxy);   // 1. Proxy 要放第一（保留 body stream）
app.use(express.json());       // 2. 之後才解析 JSON

// ❌ 錯誤順序會導致 POST body 無法轉發
```

詳見 [問題排除筆記](../notes/express-proxy-spa-troubleshooting.md)

## 🔄 Future Refactoring

- [ ] **拆分 BFF 職責**：考慮將 proxy 功能移至 Nginx 層，減少 Express 複雜度
- [ ] **使用 Vite SSR Plugin**：取代自建的 SPA fallback 邏輯
- [ ] **統一 API 路由命名**：避免 `/api-keys`（頁面）與 `/api/*`（API）混淆
