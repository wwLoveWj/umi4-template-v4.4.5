# 扫码登录功能说明

## 功能概述

本项目实现了扫码登录功能，允许用户通过 H5 应用扫描 Electron 应用显示的二维码进行登录。

## 文件结构

```
src/pages/qrLogin/
├── index.tsx          # 主扫码登录页面
├── test.tsx           # 扫码功能测试页面
├── style.less         # 样式文件
└── README.md          # 说明文档
```

## 功能特性

### 1. 扫码登录页面 (`/qrLogin`)

- 📱 支持多摄像头切换
- 🔄 实时扫码状态反馈
- ⏰ 自动处理登录流程
- 🎨 现代化 UI 设计
- 📱 响应式布局

### 2. 扫码测试页面 (`/qrTest`)

- 🧪 用于测试扫码功能
- 📊 显示扫描结果
- 🔧 调试工具

## 使用方法

### 1. 访问扫码登录页面

在登录页面点击"📱 扫码登录"按钮，或直接访问 `/qrLogin` 路径。

### 2. 扫码流程

1. 确保 Electron 应用已打开并显示登录二维码
2. 在 H5 应用中点击"开始扫码"
3. 将二维码对准扫描框
4. 等待自动识别和登录

### 3. 测试扫码功能

访问 `/qrTest` 路径可以测试扫码功能是否正常工作。

## 技术实现

### 依赖库

- `html5-qrcode`: 用于摄像头访问和二维码识别
- `antd-mobile`: UI 组件库
- `umi`: 路由管理

### 核心功能

#### 1. 摄像头管理

```typescript
// 获取摄像头设备列表
const devices = await Html5Qrcode.getCameras();
```

#### 2. 扫码初始化

```typescript
// 初始化扫码器
const html5QrCode = new Html5Qrcode("qr-reader");

// 开始扫码
await html5QrCode.start(
  { deviceId: selectedCamera },
  {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
  },
  onScanSuccess,
  onScanError
);
```

#### 3. 登录处理

```typescript
// 解析二维码内容
const url = new URL(decodedText);
const sessionId = url.searchParams.get("sessionId");

// 调用登录API
const response = await scanCodeAPI({ sessionId });
```

## API 接口

### 扫码登录接口

```typescript
// 接口路径: /scan/login
// 请求方法: GET
// 参数: { sessionId: string }
// 返回: { success: boolean, data: { token, userInfo } }
```

## 样式特性

### 1. 渐变背景

使用 CSS 渐变创建现代化的视觉效果。

### 2. 扫码动画

实现了扫码框的扫描动画效果。

### 3. 状态反馈

不同状态下的视觉反馈（等待、扫描中、成功、失败）。

### 4. 响应式设计

适配不同屏幕尺寸的设备。

## 注意事项

1. **HTTPS 要求**: 摄像头访问需要 HTTPS 环境
2. **权限管理**: 需要用户授权摄像头访问权限
3. **兼容性**: 支持现代浏览器和移动设备
4. **错误处理**: 完善的错误处理和用户提示

## 开发调试

### 1. 本地开发

```bash
npm run dev
```

### 2. 测试扫码功能

访问 `https://localhost:8000/qrTest` 进行功能测试。

### 3. 调试技巧

- 使用浏览器开发者工具查看控制台输出
- 检查摄像头权限设置
- 验证二维码格式是否正确

## 常见问题

### Q: 无法访问摄像头？

A: 确保使用 HTTPS 协议，并检查浏览器权限设置。

### Q: 扫码无反应？

A: 检查二维码是否清晰，确保在扫描框范围内。

### Q: 登录失败？

A: 检查网络连接和 API 接口是否正常。

## 更新日志

- v1.0.0: 初始版本，实现基础扫码登录功能
- 支持多摄像头切换
- 添加扫码测试页面
- 完善错误处理和用户提示
