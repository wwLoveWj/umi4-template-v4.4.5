# LoginInfo 类型定义使用指南

## 概述

本文档详细说明了 `LoginInfoType` 类型定义的结构和使用方法，该类型用于描述用户登录信息的完整数据结构。

## 类型定义位置

- **主要类型定义**: `src/types/API.d.ts` - `API.LoginInfoType`
- **存储相关类型**: `src/types/storage.d.ts` - `Storage.LoginInfo`
- **使用示例**: `src/types/loginInfo-example.ts`

## 完整的 LoginInfoType 结构

```typescript
interface LoginInfoType {
  // 基础身份信息
  userId?: string; // 用户ID
  id?: string; // 用户ID（备用字段）
  username?: string; // 用户名
  loginName?: string; // 登录名
  email?: string; // 邮箱
  avatar?: string; // 头像URL
  nickname?: string; // 昵称

  // 个人信息
  gender?: "男" | "女" | "保密"; // 性别
  birthday?: string; // 生日
  phone?: string; // 手机号
  bio?: string; // 个人简介
  address?: string; // 地址
  company?: string; // 公司
  position?: string; // 职位
  website?: string; // 网站

  // 账户信息
  password?: string; // 密码（加密后）
  token?: string; // 访问令牌
  role?: string; // 用户角色
  status?: "active" | "inactive" | "banned"; // 用户状态
  userType?: "admin" | "user" | "guest"; // 用户类型

  // 系统信息
  loginPath?: string; // 登录路径
  menuList?: string[]; // 菜单列表
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
  lastLoginTime?: string; // 最后登录时间
  loginCount?: number; // 登录次数
  isOnline?: boolean; // 是否在线

  // 用户等级和积分
  level?: number; // 用户等级
  points?: number; // 积分

  // 社交媒体链接
  socialLinks?: {
    wechat?: string; // 微信
    weibo?: string; // 微博
    qq?: string; // QQ
    github?: string; // GitHub
  };

  // 偏好设置
  preferences?: {
    theme?: "light" | "dark" | "auto"; // 主题
    language?: string; // 语言
    timezone?: string; // 时区
    notifications?: boolean; // 通知设置
  };

  // 扩展字段
  [key: string]: any;
}
```

## 使用方法

### 1. 基本使用

```typescript
import { storage } from "@/utils/storage";

// 获取登录信息
const loginInfo = storage.get("login-info") as API.LoginInfoType;

// 类型安全的访问
if (loginInfo) {
  console.log("用户ID:", loginInfo.userId || loginInfo.id);
  console.log("用户名:", loginInfo.username || loginInfo.loginName);
  console.log("邮箱:", loginInfo.email);
  console.log("头像:", loginInfo.avatar);
}
```

### 2. 使用工具函数

```typescript
import {
  getLoginInfo,
  getUserId,
  getUsername,
  getUserAvatar,
  isLoggedIn,
} from "@/types/loginInfo-example";

// 获取登录信息
const loginInfo = getLoginInfo();

// 获取用户ID
const userId = getUserId();

// 获取用户名
const username = getUsername();

// 获取头像
const avatar = getUserAvatar();

// 检查是否已登录
const loggedIn = isLoggedIn();
```

### 3. 更新用户信息

```typescript
import {
  updateLoginInfo,
  updateUserPreferences,
} from "@/types/loginInfo-example";

// 更新头像
updateLoginInfo({
  avatar: "https://example.com/avatar.jpg",
});

// 更新多个字段
updateLoginInfo({
  nickname: "新昵称",
  gender: "男",
  birthday: "1990-01-01",
  phone: "13800138000",
});

// 更新偏好设置
updateUserPreferences({
  theme: "dark",
  language: "zh-CN",
  notifications: true,
});
```

## 在组件中的使用

### React 组件示例

```typescript
import React from "react";
import { getLoginInfo, getUserBasicInfo } from "@/types/loginInfo-example";

const UserProfile: React.FC = () => {
  const loginInfo = getLoginInfo();
  const basicInfo = getUserBasicInfo();

  if (!loginInfo) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <img src={loginInfo.avatar || "/default-avatar.png"} alt="头像" />
      <h2>{loginInfo.nickname || loginInfo.username}</h2>
      <p>邮箱: {loginInfo.email}</p>
      <p>手机: {loginInfo.phone}</p>
      <p>性别: {loginInfo.gender}</p>
      <p>生日: {loginInfo.birthday}</p>

      {loginInfo.bio && <p>简介: {loginInfo.bio}</p>}

      {loginInfo.socialLinks && (
        <div>
          <h3>社交媒体</h3>
          {loginInfo.socialLinks.wechat && (
            <p>微信: {loginInfo.socialLinks.wechat}</p>
          )}
          {loginInfo.socialLinks.weibo && (
            <p>微博: {loginInfo.socialLinks.weibo}</p>
          )}
        </div>
      )}
    </div>
  );
};
```

### 设置页面示例

```typescript
import React, { useState } from "react";
import { getLoginInfo, updateLoginInfo } from "@/types/loginInfo-example";

const SettingsPage: React.FC = () => {
  const loginInfo = getLoginInfo();
  const [nickname, setNickname] = useState(loginInfo?.nickname || "");

  const handleSaveNickname = () => {
    updateLoginInfo({ nickname });
  };

  return (
    <div>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="输入昵称"
      />
      <button onClick={handleSaveNickname}>保存</button>
    </div>
  );
};
```

## 字段说明

### 必需字段

- 无（所有字段都是可选的，提供最大灵活性）

### 常用字段

- `userId` / `id`: 用户唯一标识
- `username` / `loginName`: 用户名
- `email`: 邮箱地址
- `avatar`: 头像 URL
- `token`: 访问令牌

### 扩展字段

- `socialLinks`: 社交媒体链接
- `preferences`: 用户偏好设置
- `[key: string]: any`: 支持任意扩展字段

## 最佳实践

### 1. 类型安全

```typescript
// ✅ 推荐：使用类型断言
const loginInfo = storage.get("login-info") as API.LoginInfoType;

// ✅ 推荐：使用工具函数
const loginInfo = getLoginInfo();
```

### 2. 字段兼容性

```typescript
// ✅ 推荐：兼容多种字段名
const userId = loginInfo?.userId || loginInfo?.id;
const username = loginInfo?.username || loginInfo?.loginName;
```

### 3. 空值检查

```typescript
// ✅ 推荐：检查对象存在性
if (loginInfo?.socialLinks?.wechat) {
  console.log("微信:", loginInfo.socialLinks.wechat);
}
```

### 4. 更新操作

```typescript
// ✅ 推荐：使用工具函数更新
updateLoginInfo({ avatar: newAvatarUrl });

// ❌ 避免：直接操作storage
const info = storage.get("login-info") as any;
info.avatar = newAvatarUrl;
storage.set("login-info", info);
```

## 注意事项

1. **字段可选性**: 所有字段都是可选的，使用时需要检查字段是否存在
2. **类型兼容**: 支持 `userId` 和 `id` 两种字段名，确保向后兼容
3. **扩展性**: 使用 `[key: string]: any` 支持任意扩展字段
4. **存储一致性**: 使用统一的工具函数确保存储操作的一致性

## 迁移指南

如果您的项目中有旧的 `any` 类型使用，可以按以下步骤迁移：

1. 将 `as any` 改为 `as API.LoginInfoType`
2. 使用工具函数替代直接操作
3. 添加适当的空值检查
4. 更新相关的类型定义

```typescript
// 旧代码
const loginInfo = storage.get("login-info") as any;
const userId = loginInfo.userId;

// 新代码
const loginInfo = getLoginInfo();
const userId = getUserId();
```
