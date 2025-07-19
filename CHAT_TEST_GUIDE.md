# 聊天功能测试指南

## 问题诊断

如果你遇到"请先进行身份认证"的错误，请按以下步骤进行测试：

## 1. 检查后端服务是否正常运行

```bash
# 进入后端目录
cd server-ww

# 启动服务
npm start
```

确保看到以下输出：

```
服务器已开启，端口号：3007
WebSocket服务器已启动
通知服务初始化成功
```

## 2. 测试 WebSocket 连接

```bash
# 在项目根目录运行
node test-chat-connection.js
```

应该看到：

```
🧪 测试WebSocket连接...

✅ WebSocket连接已建立
📤 发送认证消息: { type: 'authenticate', data: { userId: 'test_user_123' } }
📥 收到消息: { type: 'connection_established', connectionId: '...' }
📥 收到消息: { type: 'authenticated', userId: 'test_user_123' }
✅ 认证成功！
📤 发送聊天消息: { type: 'chat_message', data: { toUserId: 'target_user_456', content: '这是一条测试消息', messageType: 'text' } }
📥 收到消息: { type: 'message_sent', data: { messageId: 1, timestamp: '...' } }
✅ 消息发送成功！
🔌 WebSocket连接已关闭
```

## 3. 测试 API 接口

### 测试获取聊天历史

```bash
curl "http://localhost:3007/api/chat/history/test_user_456?userId=test_user_123"
```

### 测试获取聊天会话

```bash
curl "http://localhost:3007/api/chat/sessions?userId=test_user_123"
```

## 4. 前端测试

### 检查浏览器控制台

1. 打开浏览器开发者工具
2. 进入聊天页面
3. 查看 Console 标签页

应该看到：

```
WebSocket连接已建立
连接已建立，ID: ...
用户认证成功: [你的用户ID]
```

### 检查 Network 标签页

1. 查看 WebSocket 连接是否建立
2. 查看 API 请求是否成功

## 5. 常见问题解决

### 问题 1: WebSocket 连接失败

**错误信息**: `WebSocket connection to 'ws://localhost:3007' failed`

**解决方案**:

1. 确保后端服务正在运行
2. 检查端口 3007 是否被占用
3. 检查防火墙设置

### 问题 2: 认证失败

**错误信息**: `请先进行身份认证`

**解决方案**:

1. 检查用户 ID 是否正确
2. 确保 WebSocket 连接已建立
3. 检查认证消息格式

### 问题 3: API 请求失败

**错误信息**: `401 身份认证失败`

**解决方案**:

1. 检查 JWT token 是否有效
2. 确保聊天路由已添加到白名单
3. 检查请求头中的 Authorization

## 6. 调试步骤

### 步骤 1: 检查后端日志

```bash
# 查看后端控制台输出
# 应该看到WebSocket连接和认证日志
```

### 步骤 2: 检查前端日志

```javascript
// 在浏览器控制台中查看
console.log("WebSocket状态:", websocketManager.getConnectionState());
console.log("是否已认证:", websocketManager.isUserAuthenticated());
```

### 步骤 3: 检查数据库

```sql
-- 检查聊天表是否创建
SHOW TABLES LIKE 'chat_%';

-- 检查是否有消息数据
SELECT * FROM chat_messages LIMIT 5;
```

## 7. 完整测试流程

1. **启动后端服务**

   ```bash
   cd server-ww
   npm start
   ```

2. **运行 WebSocket 测试**

   ```bash
   node test-chat-connection.js
   ```

3. **启动前端服务**

   ```bash
   npm start
   ```

4. **访问聊天页面**

   - 进入消息列表: `/msg`
   - 点击进入聊天: `/msg/chat/[用户ID]`

5. **测试功能**
   - 发送文字消息
   - 发送表情
   - 长按撤回消息
   - 检查未读角标

## 8. 成功标志

如果一切正常，你应该能够：

- ✅ 看到 WebSocket 连接成功日志
- ✅ 发送和接收消息
- ✅ 看到表情选择器
- ✅ 长按消息出现操作菜单
- ✅ 看到未读消息角标
- ✅ 消息自动滚动到底部

如果遇到任何问题，请检查上述步骤并查看相应的错误日志。
