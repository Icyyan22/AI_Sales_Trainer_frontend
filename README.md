# AI Sales Trainer - Frontend

React 单页应用，提供销售训练交互界面、个人 Dashboard 和管理员后台。

## 技术栈

- React 19 + TypeScript
- Vite 6（构建 + 开发服务器）
- Tailwind CSS（样式）
- Recharts（图表可视化）
- React Router 7（路由）
- Lucide React（图标）

## 快速开始

### 前置要求

- Node.js 18+
- 后端服务运行在 `http://localhost:8000`（参见根目录 README）

### 安装 & 启动

```bash
npm install
npm run dev
```

开发服务器运行在 `http://localhost:5173`，`/api` 请求自动代理到后端。

### 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录，可用任何静态文件服务器托管。

## 页面结构

| 路径 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/` | 首页（场景列表） | 登录 |
| `/session/:id` | 训练对话 | 登录 |
| `/session/:id/report` | 训练报告 | 登录 |
| `/dashboard` | 个人 Dashboard | 登录 |
| `/admin` | 管理员后台 | 管理员 |

## 项目结构

```
web/src/
├── api/
│   └── client.ts       # 后端 API 客户端封装
├── components/          # 通用组件
├── pages/
│   ├── HomePage.tsx     # 场景选择 + 训练入口
│   ├── ChatPage.tsx     # 对话训练界面
│   ├── ReportPage.tsx   # 训练报告
│   ├── DashboardPage.tsx # 个人看板（趋势、弱项、历史）
│   ├── AdminPage.tsx    # 管理员后台（统计、用户管理）
│   ├── LoginPage.tsx    # 登录
│   └── RegisterPage.tsx # 注册
├── stores/
│   └── user.ts          # 用户状态管理（localStorage）
├── types/
│   └── index.ts         # TypeScript 类型定义
├── App.tsx              # 路由配置 + 鉴权守卫
└── main.tsx             # 入口
```

## 开发说明

- 开发模式下 Vite 代理 `/api` 到 `http://localhost:8000`，无需处理跨域
- 生产部署时需配置 nginx 等反向代理（参见根目录 README）
- 用户认证基于 JWT token，存储在 localStorage
- 角色权限：`user`（普通用户）、`admin`（管理员）、`super_admin`（超级管理员）
