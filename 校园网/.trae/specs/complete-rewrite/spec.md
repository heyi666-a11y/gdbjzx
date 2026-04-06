# 广东北江中学校园网系统 - 完整重做规格

## Why

用户反馈现有页面实现不完整，很多功能显示"正在开发中"，需要完整实现所有功能页面。

## What Changes

### 保留不变的页面
- `index.html` - 登录页面（已完善）
- `pages/register-student.html` - 学生注册页面（已完善）
- `pages/register-teacher.html` - 教师注册页面（已完善）
- `admin/dashboard.html` - 管理员界面（已完善）

### 需要重做的页面
1. **home.html** - 首页
2. **tieba.html** - 论坛（贴吧）
3. **channels.html** - 频道选择页
4. **messages.html** - 私信列表
5. **chat.html** - 私聊/群聊
6. **resources.html** - 资源中心
7. **profile.html` - 个人中心

## Impact

- 所有页面需要统一白色简洁设计风格
- 所有功能必须完整可用
- 底部导航栏需要统一

## ADDED Requirements

### Requirement: 首页功能
系统 SHALL 提供完整的首页展示，包括：
- 显示欢迎信息
- 显示快捷入口（论坛、频道、资源、消息）
- 显示最新帖子预览
- 显示用户VIP状态

#### Scenario: 用户打开首页
- **WHEN** 用户登录后访问 home.html
- **THEN** 显示用户名、头像、VIP状态
- **THEN** 显示4个快捷入口卡片
- **THEN** 显示最新5条帖子
- **THEN** 底部导航高亮首页

### Requirement: 论坛功能
系统 SHALL 提供完整的论坛功能，包括：
- 发帖功能（标题+内容）
- 帖子列表展示
- 点赞功能
- 评论功能
- 按频道筛选

#### Scenario: 用户发帖
- **WHEN** 用户在论坛页面点击发帖按钮
- **THEN** 弹出发帖表单（标题、内容、选择频道）
- **THEN** 非VIP学生每天只能发1帖
- **THEN** 发帖成功后刷新帖子列表

#### Scenario: 用户点赞
- **WHEN** 用户点击帖子点赞按钮
- **THEN** 点赞数+1，按钮变为已点赞状态
- **THEN** 再次点击取消点赞

#### Scenario: 用户评论
- **WHEN** 用户点击帖子进入详情
- **THEN** 显示帖子内容和评论列表
- **THEN** 用户可以输入评论内容
- **THEN** 提交后评论显示在列表中

### Requirement: 频道功能
系统 SHALL 提供三个频道：
- 学生频道（仅学生可看）
- 老师频道（仅老师可看）
- 综合频道（所有人可看）

#### Scenario: 用户访问频道
- **WHEN** 用户点击频道入口
- **THEN** 根据用户身份显示可进入的频道
- **THEN** 显示该频道的帖子列表

### Requirement: 私信功能
系统 SHALL 提供私信功能：
- 私信列表
- 发送私信
- VIP用户可发送图片，普通用户只能发文字

#### Scenario: 用户发送私信
- **WHEN** 用户在消息页面点击发送私信
- **THEN** 弹出选择用户界面
- **THEN** 选择用户后输入内容
- **THEN** 发送后显示在聊天界面

### Requirement: 资源中心功能
系统 SHALL 提供资源中心：
- 资源列表展示
- 资源上传
- 资源下载

#### Scenario: 用户上传资源
- **WHEN** 用户点击上传按钮
- **THEN** 如果是老师或VIP，可以直接上传
- **THEN** 如果是普通学生，提示需要VIP

### Requirement: 个人中心功能
系统 SHALL 提供个人中心：
- 显示用户信息
- 显示VIP状态
- 显示发帖记录
- 退出登录

### Requirement: 统一页面设计
所有页面 SHALL 使用统一的设计：
- 白色背景 (#ffffff)
- 蓝紫色渐变作为主色调 (#667eea → #764ba2)
- 圆角卡片设计
- 底部固定导航栏
- 返回按钮在左上角
- 页面标题居中

## 页面结构

### 底部导航栏（统一）
```
[首页] [论坛] [频道] [消息] [我的]
图标+文字，每个都可用
```

### 导航流程
```
登录页 → 注册页 → 首页 → 各功能页
                    ↓
              [论坛/贴吧] → 帖子详情 → 评论
                    ↓
              [频道] → 频道内帖子
                    ↓
              [资源] → 资源列表
                    ↓
              [消息] → 私聊/群聊
                    ↓
              [我的] → 个人中心
```

## 技术实现

### Supabase 表结构
- profiles: 用户表
- posts: 帖子表
- comments: 评论表
- likes: 点赞表
- messages: 私信表
- groups: 群组表
- group_members: 群组成员表
- group_messages: 群消息表
- resources: 资源表
- membership_records: VIP记录表
- daily_post_limits: 每日发帖限制表

### 前端技术
- 纯 HTML/CSS/JavaScript
- Supabase JS SDK
- Font Awesome 图标库
- 响应式设计，手机优先

## MODIFIED Requirements

### Requirement: 原有功能修复
- 所有页面使用统一的 supabaseClient 初始化
- 所有页面包含 showToast 提示函数
- 所有页面返回按钮正常工作
