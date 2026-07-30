# Hermes Mobile 🚀

基于 [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) 桌面客户端的移动端 APP。

## 功能

- 💬 **智能聊天** — WebSocket 实时流式对话，支持工具调用展示
- 📋 **会话管理** — 对话列表、搜索、归档、删除
- 🤖 **模型配置** — 多提供商切换（OpenAI、Anthropic、OpenRouter 等）
- 👤 **Profile 管理** — 多配置文件切换
- 🧠 **技能管理** — 启用/禁用 AI 技能
- 🌓 **主题切换** — 浅色/深色/跟随系统
- 🔌 **后端连接** — 支持 HTTP + WebSocket 连接 hermes-agent

## 技术栈

- **框架**: React Native + Expo 57
- **语言**: TypeScript
- **状态管理**: Zustand
- **导航**: React Navigation (Bottom Tabs + Stack)
- **通信**: JSON-RPC 2.0 over WebSocket + REST API

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

## GitHub Actions 构建

每次推送至 `main` 分支或手动触发 workflow，GitHub Actions 会自动构建 APK：

1. 前往仓库的 **Actions** 页面
2. 选择 **Build Android APK** workflow
3. 点击 **Run workflow** 手动触发
4. 构建完成后在 Artifacts 下载 APK

## 配置后端连接

1. 启动 hermes-agent 后端（默认端口 8081）
2. 在 APP 的 **设置** 页面输入后端地址（如 `http://192.168.1.100:8081`）
3. 点击 **测试连接** 确认连通性
4. 点击 **连接** 建立 WebSocket 通信

## 项目结构

```
src/
├── types/          # 类型定义
├── theme/          # 主题系统
├── services/       # API 和 WebSocket 客户端
├── stores/         # Zustand 状态管理
├── components/     # 可复用 UI 组件
├── screens/        # 页面屏幕
└── navigation/     # 导航配置
```

## 许可

MIT
