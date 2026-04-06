# 校园网系统修复计划

## [x] 问题1：管理员权限增强
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 增强管理员权限，确保管理员可以管理所有信息
  - 检查并修复所有页面的权限逻辑
- **Success Criteria**:
  - 管理员可以访问和管理所有功能
  - 管理员可以上传资源、发送图片等
- **Test Requirements**:
  - `programmatic` TR-1.1: 管理员可以上传资源
  - `programmatic` TR-1.2: 管理员可以发送图片消息
  - `human-judgement` TR-1.3: 管理员可以访问所有页面和功能

## [x] 问题2：消息页面管理员置顶
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 在消息页面的联系人列表中，将管理员用户置顶显示
  - 确保管理员在列表顶部
- **Success Criteria**:
  - 管理员用户显示在联系人列表的最顶部
- **Test Requirements**:
  - `human-judgement` TR-2.1: 管理员在消息列表顶部

## [x] 问题3：上传资源功能失败（RLS错误）
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修复资源上传时的 RLS 权限错误
  - 检查并修复数据库策略
- **Success Criteria**:
  - 老师和VIP用户可以正常上传资源
  - 上传成功且文件保存到存储桶
- **Test Requirements**:
  - `programmatic` TR-3.1: 老师可以上传资源
  - `programmatic` TR-3.2: VIP用户可以上传资源

## [x] 问题4：我的页面功能修改
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 将"我的收藏"功能改为"我的评论"
  - 显示用户自己发表的所有评论
  - 点击评论可以跳转到对应帖子
- **Success Criteria**:
  - 我的页面显示"我的评论"标签
  - 显示用户的评论历史
- **Test Requirements**:
  - `human-judgement` TR-4.1: 页面显示"我的评论"标签
  - `human-judgement` TR-4.2: 显示用户的评论历史

## [x] 问题5：聊天界面屏闪问题
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修复聊天界面实时更新导致的白屏屏闪问题
  - 优化实时更新逻辑，减少DOM重绘
- **Success Criteria**:
  - 聊天界面实时更新时无屏闪
  - 消息平滑显示
- **Test Requirements**:
  - `human-judgement` TR-5.1: 聊天时无屏闪
  - `human-judgement` TR-5.2: 消息实时更新正常

## [x] 问题6：新消息通知功能
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 在消息页面和频道页面添加新消息红色小标
  - 显示未读消息数量
- **Success Criteria**:
  - 有新消息时显示红色小标
  - 显示未读消息数量
- **Test Requirements**:
  - `human-judgement` TR-6.1: 新消息显示红色小标
  - `human-judgement` TR-6.2: 显示未读消息数量
