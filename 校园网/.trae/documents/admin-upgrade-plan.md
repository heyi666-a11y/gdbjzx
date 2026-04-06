# 管理员权限升级及功能增强计划

## 任务概述
本次升级将大幅增强管理员权限，添加邀请码注册机制，以及帖子图片上传功能。

## 任务清单

### 1. 管理员权限全面升级
**状态**: 待完成
**优先级**: 高

#### 1.1 创建超级管理员控制台
- [ ] 创建 `admin-dashboard.html` 作为管理员主控台
- [ ] 整合所有管理功能入口（用户管理、帖子管理、聊天记录监控等）
- [ ] 添加管理员权限验证，非管理员无法访问

#### 1.2 查看任意用户间聊天记录
- [ ] 升级 `admin-chat-monitor.html`
- [ ] 添加用户选择器，可选择任意两个用户查看聊天记录
- [ ] 支持查看私聊和群聊记录
- [ ] 显示消息时间、发送者、内容类型（文字/图片）

#### 1.3 主动给用户发送消息
- [ ] 在管理员控制台添加"系统消息"功能
- [ ] 可选择单个用户或批量选择用户发送消息
- [ ] 支持发送文字消息
- [ ] 消息显示为"系统管理员"发送

#### 1.4 查看和修改用户密码
- [ ] 在用户管理页面添加"查看密码"功能（需二次验证）
- [ ] 添加"重置密码"功能
- [ ] 记录密码修改日志

**后端需求**:
```sql
-- 添加密码修改日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    action VARCHAR(50),
    target_user_id UUID,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 2. 学生注册邀请码机制
**状态**: 待完成
**优先级**: 高

#### 2.1 前端修改
- [ ] 修改 `register-student.html`
- [ ] 添加邀请码输入框（不显示提示文字）
- [ ] 前端验证邀请码是否为"0407"
- [ ] 邀请码错误时显示"注册失败，请检查输入信息"

#### 2.2 后端验证（可选增强）
```sql
-- 创建邀请码表（如需动态管理邀请码）
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    created_by UUID REFERENCES profiles(id),
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 默认邀请码
INSERT INTO invite_codes (code, max_uses) VALUES ('0407', 999999) ON CONFLICT DO NOTHING;
```

---

### 3. 帖子图片上传功能（会员限定）
**状态**: 待完成
**优先级**: 高

#### 3.1 创建图片存储Bucket
**后端需求**:
```sql
-- 创建帖子图片存储bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 添加存储策略
CREATE POLICY "Allow authenticated upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow public select post images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'post-images');
```

#### 3.2 前端图片压缩器
- [ ] 在发帖页面添加图片选择和压缩功能
- [ ] 使用 Canvas API 压缩图片
- [ ] 压缩目标：宽度最大 1200px，质量 0.8
- [ ] 压缩后大小控制在 2MB 以内

#### 3.3 会员权限检查
- [ ] 检查用户是否为 VIP/教师/管理员
- [ ] 非会员点击上传时提示"开通会员后可上传图片"
- [ ] 支持多图上传（最多 9 张）

#### 3.4 帖子显示图片
- [ ] 修改帖子列表和详情页显示图片
- [ ] 图片支持点击放大查看
- [ ] 九宫格布局显示多图

---

## 文件修改清单

### 新建文件
1. `pages/admin-dashboard.html` - 管理员主控台
2. `database/admin-logs.sql` - 管理员操作日志表
3. `database/invite-codes.sql` - 邀请码表（可选）

### 修改文件
1. `pages/register-student.html` - 添加邀请码输入
2. `pages/tieba.html` - 添加发帖图片上传
3. `pages/tieba-detail.html` - 显示帖子图片
4. `pages/admin-chat-monitor.html` - 增强聊天记录查看
5. `pages/messages.html` - 添加系统消息接收支持

---

## 实施顺序建议

1. **第一阶段**: 管理员权限升级
   - 先完成管理员控制台框架
   - 实现查看聊天记录功能
   - 实现系统消息发送

2. **第二阶段**: 邀请码注册
   - 修改学生注册页面
   - 测试邀请码验证

3. **第三阶段**: 帖子图片功能
   - 创建存储 bucket
   - 实现图片压缩上传
   - 修改帖子显示

---

## 注意事项

1. 所有管理员操作需记录日志
2. 用户密码查看功能需谨慎，建议添加二次确认
3. 图片上传需做安全验证，防止恶意文件
4. 邀请码机制初期使用硬编码，后期可扩展为动态管理
