# 广东北江中学校园网系统规格说明

## Why
为广东北江中学（1931年建校）构建一个现代化的校园社交平台，方便师生交流、资源共享，同时通过会员机制激励优质内容创作，提供分层功能体验。

## What Changes
- 构建完整的校园社交网站，采用白色简洁风格为主，蓝紫色为辅
- 竖屏设计，适配手机端浏览
- 所有交互元素具有灵动的点击动效
- 集成 Supabase 后端服务
- 实现完整的用户权限体系和会员机制

## Impact
- 受影响范围：全校师生用户
- 核心系统：用户认证、内容管理、即时通讯、资源管理、会员系统

---

## ADDED Requirements

### Requirement: 用户认证系统
The system SHALL provide 完整的用户认证和注册功能

#### Scenario: 学生注册
- **WHEN** 学生访问注册页面
- **THEN** 需要输入姓名、学号、生日、手机号（必填，用于验证和找回密码）、密码
- **AND** 注册成功后可以登录系统

#### Scenario: 教师注册
- **WHEN** 教师访问教师注册通道
- **THEN** 需要输入姓名、教授的学科、密码（默认123）
- **AND** 注册成功后可以登录系统

#### Scenario: 用户登录
- **WHEN** 用户访问登录页面
- **THEN** 看到校徽展示
- **AND** 输入学号/工号和密码即可登录
- **AND** 登录成功后进入主界面

#### Scenario: 管理员登录
- **WHEN** 管理员使用账号 admin 和密码 admin123 登录
- **THEN** 进入管理员控制台，可以管理所有功能

### Requirement: 频道系统
The system SHALL provide 三种类型的公共频道

#### Scenario: 学生公共频道
- **GIVEN** 用户是学生身份
- **WHEN** 访问学生公共频道
- **THEN** 可以看到学生发布的内容
- **AND** 教师用户看不到此频道

#### Scenario: 教师公共频道
- **WHEN** 用户访问教师公共频道
- **THEN** 可以看到教师发布的内容

#### Scenario: 师生公共频道
- **WHEN** 用户访问师生公共频道
- **THEN** 可以看到所有用户发布的内容

### Requirement: 贴吧区功能
The system SHALL provide 完整的贴吧发帖、互动功能

#### Scenario: 发布帖子（普通用户）
- **GIVEN** 用户是未开通会员的学生
- **WHEN** 尝试发布帖子
- **THEN** 每日仅限发布1个帖子
- **AND** 不能发布图片
- **AND** 超过限制时提示需要开通会员

#### Scenario: 发布帖子（会员用户）
- **GIVEN** 用户是会员
- **WHEN** 发布帖子
- **THEN** 无每日数量限制
- **AND** 可以发布图片

#### Scenario: 点赞帖子
- **WHEN** 用户浏览帖子
- **THEN** 可以点击点赞按钮
- **AND** 点赞数实时更新
- **AND** 有点灵动动画效果

#### Scenario: 评论帖子
- **WHEN** 用户浏览帖子
- **THEN** 可以发表评论
- **AND** 评论实时显示

### Requirement: 私聊系统
The system SHALL provide 用户间私聊功能

#### Scenario: 普通用户私聊
- **GIVEN** 用户是未开通会员的学生
- **WHEN** 进行私聊
- **THEN** 只能发送文字消息
- **AND** 尝试发送其他类型时提示需要开通会员

#### Scenario: 会员用户私聊
- **GIVEN** 用户是会员
- **WHEN** 进行私聊
- **THEN** 可以发送文字、图片、文件等

#### Scenario: 管理员广播
- **GIVEN** 用户是管理员
- **WHEN** 发送一键群发信息
- **THEN** 信息单独发送给各个用户
- **AND** 相当于公告功能
- **AND** 每个用户的通讯人列表第一个都是管理员

### Requirement: 群组系统
The system SHALL provide 用户建群功能

#### Scenario: 创建群组
- **GIVEN** 用户是会员
- **WHEN** 创建群组
- **THEN** 可以设置群名称、群简介
- **AND** 可以邀请其他用户加入

#### Scenario: 非会员尝试建群
- **GIVEN** 用户不是会员
- **WHEN** 尝试创建群组
- **THEN** 提示需要开通会员才能建群

### Requirement: 资源区功能
The system SHALL provide 文件上传和下载功能

#### Scenario: 教师上传资源
- **GIVEN** 用户是教师
- **WHEN** 上传文件到资源区
- **THEN** 可以直接发布供他人下载
- **AND** 可以设置资源描述

#### Scenario: 学生上传资源
- **GIVEN** 用户是学生且是会员
- **WHEN** 上传文件到资源区
- **THEN** 可以发布供他人下载

#### Scenario: 普通学生上传资源
- **GIVEN** 用户是学生但不是会员
- **WHEN** 尝试上传文件
- **THEN** 提示需要开通会员才能上传

#### Scenario: 下载资源
- **WHEN** 用户浏览资源区
- **THEN** 可以看到所有资源列表
- **AND** 点击可以下载文件

### Requirement: 会员系统
The system SHALL provide 完整的会员管理和权限控制

#### Scenario: 会员功能限制提示
- **GIVEN** 用户尝试使用受限功能
- **WHEN** 功能因权限被限制
- **THEN** 弹出提示需要开通会员
- **AND** 显示联系管理员开通的指引

#### Scenario: 管理员开通会员
- **GIVEN** 管理员登录管理后台
- **WHEN** 查看用户列表
- **THEN** 可以为指定用户开通会员
- **AND** 可以取消用户会员资格

### Requirement: 管理员控制台
The system SHALL provide 管理员全面管控功能

#### Scenario: 账户管理
- **GIVEN** 管理员登录
- **WHEN** 访问账户管理页面
- **THEN** 可以查看所有账户信息
- **AND** 可以删除任何账户
- **AND** 可以修改账户权限

#### Scenario: 内容管理
- **GIVEN** 管理员登录
- **WHEN** 访问内容管理页面
- **THEN** 可以查看所有帖子、评论
- **AND** 可以删除任何内容

#### Scenario: 资源管理
- **GIVEN** 管理员登录
- **WHEN** 访问资源管理页面
- **THEN** 可以查看所有上传的文件
- **AND** 可以删除任何资源

#### Scenario: 系统公告
- **GIVEN** 管理员登录
- **WHEN** 发送系统公告
- **THEN** 一键发送给所有用户
- **AND** 每个用户都收到单独消息

---

## UI/UX Requirements

### 设计风格
- 主色调：白色简洁风格
- 辅助色：蓝紫色系
- 校徽：使用广东北江中学校徽（位于 new-school-logo.jpg）
- 布局：竖屏设计，适配手机尺寸

### 交互效果
- 所有按钮点击时有灵动动画
- 页面切换有流畅过渡效果
- 点赞、发送等操作有即时反馈动画
- 加载状态有优雅的loading动画

---

## Technical Requirements

### 后端服务
- 使用 Supabase
- URL: `https://verskaemxqoukhnlwnbq.supabase.co`
- 密钥: `sb_publishable_gtr_WIuZKiChZwJz8mR6pw_mk_SAYlG`

### 数据库表结构
1. users - 用户表（学生、教师、管理员）
2. posts - 帖子表
3. comments - 评论表
4. likes - 点赞表
5. messages - 私信表
6. groups - 群组表
7. group_members - 群组成员表
8. resources - 资源表
9. memberships - 会员记录表

### 技术栈
- 前端：HTML5 + CSS3 + JavaScript (Vanilla)
- 后端：Supabase (PostgreSQL + Auth + Storage)
- 存储：Supabase Storage 用于文件存储
- 实时：Supabase Realtime 用于即时通讯
