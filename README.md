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

## API 端點

| 端點 | 說明 |
|------|------|
| `GET /api/docker/containers` | 列出 Docker 容器 |
| `GET /api/docker/ports` | 列出 Port 映射 |
| `GET /api/health` | 健康檢查 |
