# 修复 Supabase 查询和频道问题

## 问题分析

### 问题1: 发布帖子失败 - 频道值不匹配
**错误信息**: `new row for relation "posts" violates check constraint "posts_channel_check"`

**原因**: 
- 数据库约束: `CHECK (channel IN ('student', 'teacher', 'all'))`
- 代码使用: `comprehensive` (应该是 `all`)

### 问题2: 频道帖子加载失败 - 关联查询语法错误
**错误信息**: `column posts.name does not exist`

**原因**: `.select('*, profiles:name, profiles:is_vip')` 语法错误
- 错误: `profiles:name` 
- 正确: 使用嵌套 select 语法

### 问题3: 消息页面缺少管理员
**原因**: 私聊用户列表没有显示管理员

## 修复步骤

### 步骤1: 修复 tieba.html 频道值
- 将 `comprehensive` 改为 `all`
- 涉及位置:
  - 频道筛选标签
  - 发帖表单频道选择

### 步骤2: 修复 channel-posts.html 关联查询
- 将 `.select('*, profiles:name, profiles:is_vip')`
- 改为 `.select('*, profiles(name, is_vip)')`

### 步骤3: 修复 tieba.html 帖子列表查询
- 使用正确的嵌套 select 语法

### 步骤4: 确保消息页面显示管理员
- 当前代码应该已包含所有用户（.neq 只排除自己）

## 设计要求
- 保持白色简洁风格
- 保持灵动动画效果
