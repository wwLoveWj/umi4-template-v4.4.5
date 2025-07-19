# 聊天功能实现说明

## 功能特性

✅ **完整的聊天功能**

- 实时消息发送和接收
- 表情选择器
- 消息撤回
- 未读消息角标
- 长按消息操作（复制、撤回）
- 自动滚动到底部
- 消息历史记录

✅ **后端支持**

- MySQL 数据库存储
- WebSocket 实时通信
- RESTful API 接口
- 消息持久化

## 文件结构

### 前端文件

```
src/
├── pages/msg/
│   ├── Chat.tsx              # 聊天页面主组件
│   ├── common.tsx            # 消息列表页面
│   └── LikeCollect.tsx       # 点赞收藏消息页面
├── service/api/
│   └── chat.ts               # 聊天API接口
└── utils/
    └── websocket.ts          # WebSocket管理工具
```

### 后端文件

```
server/
├── services/
│   └── chatService.js        # 聊天服务层
├── routers/
│   └── chat.js               # 聊天API路由
├── websocket.js              # WebSocket服务器
├── app.js                    # 主应用文件
└── test-chat.js              # 测试脚本
```

## 数据库表结构

### chat_messages 表

```sql
CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id VARCHAR(255) NOT NULL,
  to_user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### chat_sessions 表

```sql
CREATE TABLE chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  target_user_id VARCHAR(255) NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP,
  unread_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_session (user_id, target_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_last_message_time (last_message_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## API 接口

### 获取聊天历史

```
GET /api/chat/history/:targetUserId?userId=xxx&limit=50&offset=0
```

### 获取聊天会话列表

```
GET /api/chat/sessions?userId=xxx
```

### 标记消息为已读

```
POST /api/chat/read/:targetUserId
Body: { userId: "xxx" }
```

### 撤回消息

```
POST /api/chat/recall/:messageId
Body: { userId: "xxx" }
```

### 获取未读数量

```
GET /api/chat/unread-count?userId=xxx
```

### 删除聊天记录

```
DELETE /api/chat/history/:targetUserId
Body: { userId: "xxx" }
```

## WebSocket 消息类型

### 客户端发送

```javascript
// 认证
{ type: "authenticate", data: { userId: "xxx" } }

// 发送消息
{ type: "chat_message", data: { toUserId: "xxx", content: "消息内容", messageType: "text" } }

// 撤回消息
{ type: "recall_message", data: { messageId: "xxx", toUserId: "xxx" } }

// 标记已读
{ type: "mark_read", data: { targetUserId: "xxx" } }

// 心跳
{ type: "ping" }
```

### 服务器发送

```javascript
// 连接建立
{ type: "connection_established", connectionId: "xxx" }

// 认证成功
{ type: "authenticated", userId: "xxx" }

// 新消息
{ type: "chat_message", data: { id: 1, fromUserId: "xxx", toUserId: "xxx", content: "xxx", messageType: "text", createdAt: "xxx" } }

// 消息撤回
{ type: "message_recalled", data: { messageId: "xxx", fromUserId: "xxx" } }

// 未读数量更新
{ type: "unread_count_update", count: 5 }

// 心跳响应
{ type: "pong" }

// 错误
{ type: "error", message: "错误信息" }
```

## 使用方法

### 1. 启动后端服务

```bash
cd server
npm install
npm start
```

### 2. 测试聊天功能

```bash
cd server
node test-chat.js
```

### 3. 前端访问

- 消息列表：`/msg`
- 聊天页面：`/msg/chat/:userId`

## 主要功能实现

### 1. 实时消息发送

- 前端通过 WebSocket 发送消息
- 后端保存到 MySQL 数据库
- 实时推送给目标用户

### 2. 表情选择器

- 支持 30 个常用表情
- 点击插入到输入框
- 网格布局展示

### 3. 消息撤回

- 长按自己的消息
- 弹出操作菜单
- 支持撤回和复制

### 4. 未读角标

- 实时更新未读数量
- 消息列表显示角标
- 进入聊天自动标记已读

### 5. 自动滚动

- 新消息自动滚动到底部
- 平滑滚动动画
- 保持用户体验

## 注意事项

1. **数据库连接**：确保 MySQL 服务正常运行
2. **WebSocket 端口**：使用 3007 端口，与 HTTP 服务共享
3. **用户认证**：需要先进行 WebSocket 认证才能发送消息
4. **消息持久化**：所有消息都会保存到数据库
5. **离线消息**：用户不在线时消息会存储，上线后推送

## 扩展功能

可以考虑添加的功能：

- 图片消息支持
- 语音消息
- 群聊功能
- 消息搜索
- 消息转发
- 在线状态显示
