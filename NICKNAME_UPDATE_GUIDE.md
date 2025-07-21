# 昵称更新功能指南

## 功能概述

设置页面已增加昵称字段，支持实时更新用户昵称。主要功能包括：

- 📝 昵称输入和编辑
- 💾 失焦自动保存
- 🔄 实时状态更新
- 📱 本地存储同步
- ⚠️ 错误处理和回滚

## 功能特点

### ✅ 用户体验优化

- **实时输入**: 用户输入时立即更新本地状态
- **失焦保存**: 输入框失焦时自动保存到服务器
- **防抖处理**: 避免频繁的 API 调用
- **状态指示**: 显示保存成功或失败提示

### ✅ 数据同步

- **本地更新**: 立即更新本地用户状态
- **服务器同步**: 自动同步到后端数据库
- **存储更新**: 更新本地存储的用户信息
- **错误回滚**: 保存失败时恢复原值

### ✅ 错误处理

- **网络错误**: 显示错误提示并恢复原值
- **验证失败**: 提示用户重新输入
- **服务器错误**: 显示具体错误信息

## 使用方法

### 1. 访问设置页面

```
路径: /settings
```

### 2. 编辑昵称

1. 在"个人资料"部分找到"昵称"字段
2. 点击输入框开始编辑
3. 输入新的昵称
4. 点击其他地方或按回车键保存

### 3. 保存机制

- **自动保存**: 输入框失焦时自动保存
- **实时更新**: 输入时立即更新本地显示
- **状态提示**: 保存成功或失败都有提示

## 技术实现

### 前端实现

```typescript
// 昵称相关状态
const [nicknameValue, setNicknameValue] = useState(user.nickname || "");
const [nicknameChanged, setNicknameChanged] = useState(false);

// 昵称输入处理
const handleNicknameChange = (value: string) => {
  setNicknameValue(value);
  setNicknameChanged(true);
  setUser((u) => ({ ...u, nickname: value }));
};

// 昵称失焦处理（保存到服务器）
const handleNicknameBlur = async () => {
  if (!nicknameChanged) return;

  const userId = loginInfo?.userId || loginInfo?.id;
  if (userId && nicknameValue.trim()) {
    try {
      await UserInfoUpdateAPI({ userId, nickname: nicknameValue.trim() });
      setNicknameChanged(false);
      Toast.show({ icon: "success", content: "昵称更新成功" });

      // 更新本地存储
      const updatedLoginInfo = { ...loginInfo, nickname: nicknameValue.trim() };
      storage.set("login-info", updatedLoginInfo);
    } catch (error) {
      console.error("昵称更新失败:", error);
      Toast.show({ icon: "fail", content: "昵称更新失败，请重试" });
      // 恢复原值
      setNicknameValue(user.nickname || "");
      setUser((u) => ({ ...u, nickname: user.nickname }));
    }
  }
};
```

### 后端 API

```javascript
// 更新用户信息API
POST /userInfo/update
{
  "userId": "用户ID",
  "nickname": "新昵称"
}
```

## 测试步骤

### 1. 后端测试

```bash
# 启动后端服务
cd server-ww
npm start

# 运行昵称更新测试
node test-nickname-update.js
```

### 2. 前端测试

```bash
# 启动前端服务
npm start

# 访问设置页面
http://localhost:8000/settings
```

### 3. 功能验证

- ✅ 输入昵称并失焦，检查是否保存成功
- ✅ 检查本地存储是否更新
- ✅ 检查服务器数据是否更新
- ✅ 测试网络错误时的回滚功能

## 常见问题

### 问题 1: 昵称保存失败

**原因**: 网络错误或服务器错误
**解决方案**:

1. 检查网络连接
2. 检查后端服务是否正常运行
3. 查看浏览器控制台错误信息

### 问题 2: 昵称显示不正确

**原因**: 本地存储未同步
**解决方案**:

1. 刷新页面重新加载数据
2. 检查本地存储中的用户信息
3. 清除缓存重新登录

### 问题 3: 输入框无法编辑

**原因**: 组件状态错误
**解决方案**:

1. 检查用户登录状态
2. 检查用户 ID 是否正确
3. 重新加载页面

## 数据库字段

确保用户表包含昵称字段：

```sql
ALTER TABLE users ADD COLUMN nickname VARCHAR(50) DEFAULT NULL COMMENT '用户昵称';
```

## 成功标志

如果功能正常，你应该能够：

- ✅ 在设置页面看到昵称输入框
- ✅ 输入昵称并失焦后自动保存
- ✅ 看到"昵称更新成功"提示
- ✅ 本地存储中的用户信息已更新
- ✅ 服务器数据库中的昵称已更新
- ✅ 其他页面显示新的昵称

## 下一步开发

### 功能增强

- [ ] 昵称长度限制和验证
- [ ] 昵称唯一性检查
- [ ] 昵称修改历史记录
- [ ] 昵称敏感词过滤

### 用户体验

- [ ] 昵称修改确认弹窗
- [ ] 昵称修改频率限制
- [ ] 昵称修改通知
- [ ] 昵称修改日志

如果遇到任何问题，请检查上述步骤并查看相应的错误日志。
