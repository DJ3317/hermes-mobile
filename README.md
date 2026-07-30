# Hermes Mobile 🚀

基于 [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) 桌面客户端魔改的移动端 APP。

> **开发说明**：本项目是对 Hermes Desktop (Electron + React) 客户端核心功能的移动端适配移植，全部代码由 AI 辅助生成。保留了原桌面客户端的核心架构（JSON-RPC 2.0 over WebSocket 通信、nanostores→Zustand 状态管理模式、React 组件化设计），并针对移动端交互方式进行了全面重构（触屏操作、底部 Tab 导航、响应式布局、原生 UI 组件）。

## 功能

- 💬 **智能聊天** — WebSocket 实时流式对话，支持工具调用展示
- 📋 **会话管理** — 对话列表、搜索、归档、删除、重命名
- 🤖 **模型配置** — 多提供商切换（OpenAI、Anthropic、OpenRouter 等）
- 👤 **Profile 管理** — 多配置文件创建、删除、切换
- 🧠 **技能管理** — 启用/禁用 AI 技能
- 🌓 **主题切换** — 浅色/深色/跟随系统
- 🔌 **后端连接** — 支持 HTTP + WebSocket 连接 hermes-agent

## 技术栈

- **框架**: React Native + Expo 57
- **语言**: TypeScript
- **状态管理**: Zustand（源自桌面端的 nanostores 模式）
- **导航**: React Navigation (Bottom Tabs + Stack)
- **通信**: JSON-RPC 2.0 over WebSocket + REST API
- **安全存储**: expo-secure-store

## 最低要求

- Android 12 (API 31) 及以上
- 运行中的 hermes-agent 后端服务

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 构建 Android APK
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

## 配置后端连接

1. 启动 hermes-agent 后端
2. 在 APP 的 **设置** 页面输入后端地址（如 `http://192.168.31.250:9191`）
3. 点击 **测试连接** 确认连通性
4. 如需认证，输入用户名密码并点击 **登录**
5. 登录成功后点击 **连接** 建立 WebSocket 通信

## 项目结构

```
src/
├── types/          # 类型定义 (Session, Message, Gateway, etc.)
├── theme/          # 主题系统 (浅色/深色色板)
├── services/       # API 客户端 + WebSocket JSON-RPC
├── stores/         # Zustand 状态管理
├── components/     # 可复用 UI 组件
├── screens/        # 页面屏幕 (6个)
└── navigation/     # 导航配置 (Tab + Stack)
```

## 许可

本项目基于 [MIT](./LICENSE) 许可证开源。  
基于 [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)（MIT 协议）开发。
