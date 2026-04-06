# 修复计划

## 问题1：帖子详情页 Supabase 查询语法错误
**错误**: `column posts.name does not exist`
**原因**: `tieba-detail.html` 第 571 行使用了错误的 Supabase 关联查询语法
```javascript
// 错误写法
.select('*, profiles:name, profiles:user_type, profiles:is_vip')
// 正确写法
.select('*, profiles(name, user_type, is_vip)')
```

**修复步骤**:
1. 修改 `pages/tieba-detail.html` 第 571 行
2. 将 `.select('*, profiles:name, profiles:user_type, profiles:is_vip')` 改为 `.select('*, profiles(name, user_type, is_vip)')`

## 问题2：管理员界面登录后无法正常使用
**原因**: 管理员登录使用 `localStorage.setItem('user', ...)`，跳转到 `admin/dashboard.html`，但该页面没有正确初始化当前用户

**修复步骤**:
1. 修改 `admin/dashboard.html`，确保管理员登录后能正确识别身份
2. 检查管理员界面是否有聊天入口或私信功能
3. 如果需要，让管理员也能通过消息页面与用户私聊

## 预估工作量
- 问题1：修复1处代码，约2分钟
- 问题2：检查并修复管理员界面，约5分钟
