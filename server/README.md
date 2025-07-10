# 宝宝成长社区后端服务

## 项目简介

这是一个基于 Node.js + Express + MySQL 的后端服务，为宝宝成长社区提供 API 支持，包括用户管理、头像上传等功能。

## 功能特性

- ✅ 用户信息管理
- ✅ 头像上传功能
- ✅ JWT 身份验证
- ✅ 文件上传限制
- ✅ 数据库操作
- ✅ 错误处理

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **Multer** - 文件上传处理
- **MySQL2** - 数据库驱动
- **CORS** - 跨域处理
- **JWT** - 身份验证

## 安装和运行

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 并修改配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：

```env
PORT=3007
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=baby_growth
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
```

### 3. 创建数据库

执行 `database.sql` 文件创建数据库和表：

```bash
mysql -u root -p < database.sql
```

### 4. 启动服务

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

服务将在 `http://localhost:3007` 启动

## API 接口文档

### 头像上传

**接口地址：** `POST /userInfo/uploadAvatar`

**请求参数：**

- `avatar`: 图片文件（FormData 格式）

**响应示例：**

```json
{
  "code": 1,
  "msg": "头像上传成功",
  "data": {
    "avatarUrl": "http://localhost:3007/uploads/avatars/avatar-1234567890.jpg",
    "message": "头像上传成功"
  }
}
```

### 更新用户信息

**接口地址：** `POST /userInfo/update`

**请求参数：**

```json
{
  "userId": "user123",
  "avatar": "http://localhost:3007/uploads/avatars/avatar-1234567890.jpg",
  "nickname": "新昵称",
  "gender": "男",
  "birthday": "2020-01-01",
  "phone": "13800138000",
  "email": "test@example.com"
}
```

**响应示例：**

```json
{
  "code": 1,
  "msg": "用户信息更新成功",
  "data": null
}
```

### 查询用户信息

**接口地址：** `GET /userInfo/query?userId=user123`

**响应示例：**

```json
{
  "code": 1,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "userId": "user123",
    "username": "测试用户",
    "nickname": "小宝",
    "avatar": "http://localhost:3007/uploads/avatars/avatar-1234567890.jpg",
    "gender": "男",
    "birthday": "2020-01-01",
    "phone": "13800138000",
    "email": "test@example.com",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

## 文件上传说明

- 支持格式：JPG、PNG、GIF
- 文件大小限制：5MB
- 存储路径：`uploads/avatars/`
- 文件命名：`avatar-{时间戳}-{随机数}.{扩展名}`

## 数据库表结构

### user_info 表

| 字段名     | 类型         | 说明               |
| ---------- | ------------ | ------------------ |
| id         | INT          | 主键 ID            |
| userId     | VARCHAR(50)  | 用户 ID（唯一）    |
| username   | VARCHAR(100) | 用户名             |
| nickname   | VARCHAR(100) | 昵称               |
| avatar     | VARCHAR(500) | 头像 URL           |
| gender     | ENUM         | 性别（男/女/保密） |
| birthday   | DATE         | 生日               |
| phone      | VARCHAR(20)  | 手机号             |
| email      | VARCHAR(100) | 邮箱               |
| password   | VARCHAR(255) | 密码（加密）       |
| createTime | TIMESTAMP    | 创建时间           |
| updateTime | TIMESTAMP    | 更新时间           |

## 注意事项

1. 确保数据库服务已启动
2. 检查文件上传目录权限
3. 生产环境请配置 HTTPS
4. 定期清理上传文件
5. 加强 JWT 验证逻辑

## 开发计划

- [ ] 用户注册/登录接口
- [ ] 密码加密存储
- [ ] 文件压缩处理
- [ ] 接口限流
- [ ] 日志记录
- [ ] 单元测试
