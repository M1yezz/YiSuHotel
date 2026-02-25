# YiSuHotel
YiSuHotel是一个酒店预订平台，包含微信小程序端（用户端）、Web管理端（商户/管理员端）以及基于 NestJS 的后端服务。
client-mp: 微信小程序端 基于 Taro + React 开发，为用户提供酒店搜索、详情浏览、房间预订等功能。
client-admin: Web 管理后台 基于 React + Vite + Ant Design 开发，提供商家入驻、房型管理、订单处理及系统管理功能。
server: 后端 API 服务 基于 NestJS + TypeORM + MySQL 开发，提供 RESTful API 接口及数据持久化服务。

## 1. 启动后端服务 (server)
```bash
cd server
# 安装依赖
npm install
# 配置数据库连接
# 启动服务
npm run start:dev
```

## 2. 启动管理后台 (client-admin)
```bash
cd client-admin
# 安装依赖
npm install
# 启动开发服务器
npm run dev
```

## 3. 运行小程序 (client-mp)
```bash
cd client-mp
# 安装依赖
npm install
# 编译为微信小程序
npm run dev:weapp
```
