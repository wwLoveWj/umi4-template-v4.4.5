# 用户名/昵称编辑功能指南

## 功能概述

设置页面已实现用户名和昵称的公共编辑功能，通过一个统一的编辑页面来处理两种不同的字段修改。主要功能包括：

- 📝 统一的编辑界面
- 🔄 动态标题和提示
- 💾 自动保存和同步
- 📱 本地存储更新
- ⚠️ 错误处理和回滚

## 功能特点

### ✅ 统一编辑界面

- **公共页面**: 用户名和昵称共用同一个编辑页面
- **动态标题**: 根据编辑类型显示不同的标题
- **动态提示**: 根据编辑类型显示不同的占位符和描述
- **URL 参数**: 通过`type`参数区分编辑类型

### ✅ 智能保存机制

- **实时验证**: 输入时实时验证内容
- **一键保存**: 点击保存按钮立即保存
- **自动同步**: 保存成功后自动更新本地存储
- **状态管理**: 保存过程中显示 loading 状态

### ✅ 错误处理

- **网络错误**: 显示错误提示
- **验证失败**: 提示用户重新输入
- **服务器错误**: 显示具体错误信息

## 使用方法

### 1. 访问设置页面

```
路径: /settings
```

### 2. 编辑用户名

1. 在"个人资料"部分找到"用户名"字段
2. 点击进入编辑页面
3. 输入新的用户名
4. 点击"保存"按钮

### 3. 编辑昵称

1. 在"个人资料"部分找到"昵称"字段
2. 点击进入编辑页面
3. 输入新的昵称
4. 点击"保存"按钮

### 4. URL 参数说明

- **用户名编辑**: `/settings/edit-username?type=username`
- **昵称编辑**: `/settings/edit-username?type=nickname`

## 技术实现

### 前端实现

```typescript
// 从URL参数获取编辑类型
const searchParams = new URLSearchParams(location.search);
const editType = searchParams.get("type") || "username";

// 根据编辑类型设置初始值和标题
const getInitialValue = () => {
  if (editType === "nickname") {
    return loginInfo?.nickname || "";
  }
  return loginInfo?.username || "";
};

const getTitle = () => {
  return editType === "nickname" ? "修改昵称" : "修改用户名";
};

// 保存逻辑
const handleSave = async () => {
  const updateData =
    editType === "nickname"
      ? { userId: String(userId), nickname: value.trim() }
      : { userId: String(userId), username: value.trim() };

  await UserInfoUpdateAPI(updateData);

  // 更新本地存储
  const updatedLoginInfo = { ...loginInfo };
  if (editType === "nickname") {
    updatedLoginInfo.nickname = value.trim();
  } else {
    updatedLoginInfo.username = value.trim();
  }
  storage.set("login-info", updatedLoginInfo);
};
```

### 后端 API

```javascript
// 更新用户信息API
POST /userInfo/update
{
  "userId": "用户ID",
  "username": "新用户名",  // 或 "nickname": "新昵称"
}
```

## 页面结构

### 设置页面 (`/settings`)

```typescript
// 用户名项
<List.Item
  extra={<span>{loginInfo.username || loginInfo.loginName}</span>}
  onClick={() => history.push("/settings/edit-username?type=username")}
>
  用户名
</List.Item>

// 昵称项
<List.Item
  extra={
    loginInfo?.nickname ? (
      <span>{loginInfo.nickname}</span>
    ) : (
      <span style={{ color: "#999" }}>未设置</span>
    )
  }
  onClick={() => history.push("/settings/edit-username?type=nickname")}
>
  昵称
</List.Item>
```

### 编辑页面 (`/settings/edit-username`)

- 动态标题显示
- 输入框和保存按钮
- 错误处理和状态管理

## 测试步骤

### 1. 后端测试

```bash
# 启动后端服务
cd server-ww
npm start

# 运行编辑功能测试
node test-edit-username.js
```

### 2. 前端测试

```bash
# 启动前端服务
npm start

# 访问设置页面
http://localhost:8000/settings
```

### 3. 功能验证

- ✅ 点击用户名进入编辑页面，标题显示"修改用户名"
- ✅ 点击昵称进入编辑页面，标题显示"修改昵称"
- ✅ 输入内容并保存，检查是否更新成功
- ✅ 检查本地存储是否更新
- ✅ 检查服务器数据是否更新

## 路由配置

```typescript
{
  key: "edit-username",
  title: "用户名修改",
  path: "/settings/edit-username",
  component: "./settings/EditUsername",
  hideTabBar: true,
}
```

## 常见问题

### 问题 1: 编辑页面标题不正确

**原因**: URL 参数传递错误
**解决方案**:

1. 检查跳转链接是否正确包含`type`参数
2. 确保参数值为`username`或`nickname`

### 问题 2: 保存失败

**原因**: 网络错误或服务器错误
**解决方案**:

1. 检查网络连接
2. 检查后端服务是否正常运行
3. 查看浏览器控制台错误信息

### 问题 3: 本地存储未更新

**原因**: 保存成功但本地存储更新失败
**解决方案**:

1. 检查`storage.set`调用是否正确
2. 刷新页面重新加载数据
3. 清除缓存重新登录

## 成功标志

如果功能正常，你应该能够：

- ✅ 在设置页面看到用户名和昵称字段
- ✅ 点击用户名跳转到编辑页面，标题显示"修改用户名"
- ✅ 点击昵称跳转到编辑页面，标题显示"修改昵称"
- ✅ 输入内容并保存成功
- ✅ 看到"保存成功"提示
- ✅ 本地存储中的用户信息已更新
- ✅ 服务器数据库中的信息已更新
- ✅ 返回设置页面后显示新的内容

## 下一步开发

### 功能增强

- [ ] 用户名唯一性检查
- [ ] 昵称长度限制和验证
- [ ] 敏感词过滤
- [ ] 修改历史记录

### 用户体验

- [ ] 实时输入验证
- [ ] 修改确认弹窗
- [ ] 修改频率限制
- [ ] 修改通知

如果遇到任何问题，请检查上述步骤并查看相应的错误日志。
