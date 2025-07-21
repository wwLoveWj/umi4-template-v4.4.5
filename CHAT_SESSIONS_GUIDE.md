# 聊天会话功能测试指南

## 功能概述

现在消息页面已经改为显示用户之间的聊天会话，而不是通知消息。主要功能包括：

- 📋 聊天会话列表
- 🔍 搜索联系人
- 💬 实时消息收发
- 📊 未读消息角标
- 👥 联系人管理

## 文件结构说明

### 主要文件

- `src/pages/msg/common.tsx` - **消息页面主入口**（显示聊天会话）
- `src/pages/msg/index.tsx` - 通知消息页面（已恢复原功能）
- `src/pages/msg/contacts.tsx` - 联系人页面
- `src/pages/msg/Chat.tsx` - 聊天对话页面
- `src/hooks/useChatSessions.ts` - 聊天会话管理 Hook

### 路由配置

- `/msg` - 指向 `common.tsx`（聊天会话列表）
- `/msg/contacts` - 指向 `contacts.tsx`（联系人页面）
- `/msg/chat/:userId` - 指向 `Chat.tsx`（聊天对话页面）

## 1. 后端测试

### 启动后端服务

```bash
cd server-ww
npm start
```

### 测试聊天会话 API

```bash
# 在项目根目录运行
node test-chat-sessions.js
```

应该看到：

```
🧪 测试聊天会话功能...

📋 测试获取聊天会话列表...
✅ 聊天会话列表: { code: 1, data: [...], msg: "success" }

📊 测试获取未读消息数量...
✅ 未读消息数量: { code: 1, data: { count: 0 }, msg: "success" }

💬 测试获取聊天历史...
✅ 聊天历史: { code: 1, data: [...], msg: "success" }

✅ 测试标记已读...
✅ 标记已读成功: { code: 1, data: null, msg: "success" }

🎉 所有测试通过！
```

## 2. 前端测试

### 启动前端服务

```bash
npm start
```

### 访问消息页面

1. 打开浏览器访问: `http://localhost:8000/msg`
2. 应该看到聊天会话列表页面（common.tsx）

### 功能验证

#### ✅ 聊天会话列表 (common.tsx)

- 显示用户头像
- 显示用户昵称
- 显示最后一条消息
- 显示消息时间
- 显示未读消息数量
- 顶部有分类图标（赞和收藏、评论、新增粉丝、系统通知）
- 右上角有联系人按钮和未读角标

#### ✅ 搜索功能

- 在搜索框输入关键词
- 实时过滤联系人
- 支持昵称、用户名、邮箱搜索

#### ✅ 联系人页面

- 点击右上角"联系人"按钮
- 进入联系人列表页面
- 点击联系人开始聊天

#### ✅ 聊天页面

- 点击会话进入聊天页面
- 发送文字消息
- 发送表情
- 长按撤回消息
- 自动滚动到底部

## 3. 数据库验证

### 检查聊天表

```sql
-- 检查聊天消息表
SHOW TABLES LIKE 'chat_%';

-- 查看聊天消息
SELECT * FROM chat_messages LIMIT 5;

-- 查看聊天会话
SELECT * FROM chat_sessions LIMIT 5;
```

### 插入测试数据

```sql
-- 插入测试消息
INSERT INTO chat_messages (from_user_id, to_user_id, content, message_type)
VALUES
('current_user_123', 'target_user_456', '你好！', 'text'),
('target_user_456', 'current_user_123', '你好，很高兴认识你！', 'text'),
('current_user_123', 'target_user_456', '今天天气不错', 'text');

-- 插入测试会话
INSERT INTO chat_sessions (user_id, target_user_id, last_message, last_message_time, unread_count)
VALUES
('current_user_123', 'target_user_456', '今天天气不错', NOW(), 1),
('target_user_456', 'current_user_123', '今天天气不错', NOW(), 0);
```

## 4. 常见问题解决

### 问题 1: 聊天会话列表为空

**原因**: 数据库中还没有聊天数据
**解决方案**:

1. 先发送一些测试消息
2. 检查数据库连接
3. 验证 API 返回格式

### 问题 2: 用户 ID 不匹配

**原因**: 前端使用的用户 ID 与后端不一致
**解决方案**:

1. 检查前端用户 ID 获取逻辑
2. 确保与登录系统集成
3. 使用真实的用户 ID

### 问题 3: 未读数量不更新

**原因**: WebSocket 连接或 API 调用失败
**解决方案**:

1. 检查 WebSocket 连接状态
2. 验证 API 调用是否成功
3. 检查数据库更新逻辑

### 问题 4: 页面显示错误

**原因**: 路由配置错误
**解决方案**:

1. 确认 `/msg` 路由指向 `common.tsx`
2. 检查组件导入路径
3. 验证文件是否存在

## 5. 完整测试流程

### 步骤 1: 准备测试数据

```bash
# 运行WebSocket测试
node test-chat-connection.js

# 运行API测试
node test-chat-sessions.js

# 运行Common页面测试
node test-chat-common.js
```

### 步骤 2: 前端功能测试

1. 访问消息页面: `/msg`（应该显示 common.tsx）
2. 点击"联系人"进入联系人页面
3. 选择联系人开始聊天
4. 发送测试消息
5. 验证消息显示和未读角标

### 步骤 3: 实时功能测试

1. 打开两个浏览器窗口
2. 分别登录不同用户
3. 互相发送消息
4. 验证实时接收和未读更新

## 6. 成功标志

如果一切正常，你应该能够：

- ✅ 看到聊天会话列表（common.tsx）
- ✅ 看到顶部分类图标
- ✅ 搜索和过滤联系人
- ✅ 点击会话进入聊天页面
- ✅ 发送和接收消息
- ✅ 看到未读消息角标
- ✅ 实时更新消息状态
- ✅ 长按撤回消息
- ✅ 表情选择器正常工作

## 7. 文件修改总结

### 已修改的文件

- `src/pages/msg/common.tsx` - 改为显示聊天会话
- `src/pages/msg/index.tsx` - 恢复为通知消息功能
- `src/routes/menuRoutes.ts` - 更新路由配置
- `src/hooks/useChatSessions.ts` - 新增聊天会话 Hook
- `src/pages/msg/contacts.tsx` - 新增联系人页面

### 新增的文件

- `test-chat-common.js` - Common 页面测试脚本
- `CHAT_SESSIONS_GUIDE.md` - 测试指南

## 8. 下一步开发

### 功能增强

- [ ] 群聊功能
- [ ] 图片和文件发送
- [ ] 语音消息
- [ ] 消息加密
- [ ] 在线状态显示

### 性能优化

- [ ] 消息分页加载
- [ ] 图片压缩
- [ ] 消息缓存
- [ ] 离线消息同步

### 用户体验

- [ ] 消息提醒
- [ ] 快捷回复
- [ ] 消息搜索
- [ ] 聊天记录导出

如果遇到任何问题，请检查上述步骤并查看相应的错误日志。
