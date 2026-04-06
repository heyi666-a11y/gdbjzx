# 功能开发计划

## 需求分析

### 1. 资源页面完善
**现状**: resources.html 存在但功能不完整
**需求**:
- 老师可以上传资源（文件）
- 学生可以下载资源
- 资源分类（学习资料、试卷、课件等）
- 显示上传者、文件大小、下载次数

**涉及文件**:
- `pages/resources.html` - 重写资源列表和下载功能
- `admin/dashboard.html` - 添加资源审核/管理功能

**SQL需要**:
- resources 表已存在，可能需要添加 category 字段

---

### 2. 频道改为群聊模式
**现状**: 频道是帖子列表形式
**需求**:
- 学生频道 = 所有学生的大群聊
- 教师频道 = 所有教师的大群聊  
- 综合频道 = 所有人的大群聊
- 不是发帖，而是实时群聊

**涉及文件**:
- `pages/channels.html` - 改为群聊界面
- `pages/channel-chat.html` - 新建频道群聊页面（类似chat.html但用于频道）
- `admin/dashboard.html` - 频道管理

**SQL需要**:
- 需要创建默认群组（学生群、教师群、综合群）
- 用户注册时自动加入对应群组

---

### 3. 群聊功能实现
**现状**: 消息页面有群聊标签但无创建功能
**需求**:
- 用户可以创建群组
- 可以拉人进群（选择用户）
- 群聊功能（发送消息、查看成员）

**涉及文件**:
- `pages/messages.html` - 添加"创建群组"按钮
- `pages/create-group.html` - 新建创建群组页面
- `pages/group-chat.html` - 群聊页面

**SQL需要**:
- groups 表已存在
- group_members 表已存在
- group_messages 表已存在

---

### 4. 首页公告 + 管理员功能
**现状**: 首页只有最新帖子
**需求**:
- 首页显示管理员发布的公告
- 管理员后台可以发布公告
- 管理员可以与用户私聊
- 完善其他管理功能

**涉及文件**:
- `pages/home.html` - 添加公告区域
- `admin/dashboard.html` - 添加公告管理标签页

**SQL需要**:
- 新建 announcements 表

---

### 5. SQL汇总
需要提供给用户的SQL：

```sql
-- 1. 创建默认群组
INSERT INTO public.groups (id, name, description, owner_id) VALUES
('11111111-1111-1111-1111-111111111111', '学生交流群', '所有学生的大群聊', '00000000-0000-0000-0000-000000000001'),
('22222222-2222-2222-2222-222222222222', '教师交流群', '所有教师的大群聊', '00000000-0000-0000-0000-000000000001'),
('33333333-3333-3333-3333-333333333333', '师生交流群', '全体师生的大群聊', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 2. 创建公告表
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 添加资源分类字段
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';

-- 4. RLS策略
DROP POLICY IF EXISTS "Allow all on announcements" ON public.announcements;
CREATE POLICY "Allow all on announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
```

---

## 开发顺序

1. **Phase 1**: 资源页面完善（1-2小时）
2. **Phase 2**: 公告功能（1小时）
3. **Phase 3**: 频道改为群聊（2小时）
4. **Phase 4**: 群聊创建功能（1-2小时）
5. **Phase 5**: 管理员功能完善（1小时）

总计：6-8小时
