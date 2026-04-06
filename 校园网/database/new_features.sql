-- 广东北江中学校园网 - 新功能数据库SQL
-- 执行顺序：从上到下依次执行

-- ============================================
-- 1. 创建公告表
-- ============================================
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

-- 公告表RLS策略
DROP POLICY IF EXISTS "Allow all on announcements" ON public.announcements;
CREATE POLICY "Allow all on announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 2. 添加资源分类字段
-- ============================================
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';

-- ============================================
-- 3. 创建默认频道群组（学生群、教师群、综合群）
-- ============================================
-- 注意：需要先确保管理员用户存在
INSERT INTO public.profiles (id, user_type, name, student_id, is_vip)
SELECT '00000000-0000-0000-0000-000000000001', 'admin', '管理员', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE student_id = 'admin');

-- 创建默认群组
INSERT INTO public.groups (id, name, description, owner_id) VALUES
('11111111-1111-1111-1111-111111111111', '学生交流群', '所有学生的大群聊，欢迎同学们交流学习和校园生活', '00000000-0000-0000-0000-000000000001'),
('22222222-2222-2222-2222-222222222222', '教师交流群', '所有教师的大群聊，教学研讨和经验分享', '00000000-0000-0000-0000-000000000001'),
('33333333-3333-3333-3333-333333333333', '师生交流群', '全体师生的大群聊，校园通知和互动交流', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. 创建存储桶（用于资源文件上传）
-- 注意：这需要在Supabase Dashboard中手动创建，SQL无法直接创建存储桶
-- 请在Supabase Dashboard -> Storage -> New bucket -> 输入 "resources"
-- ============================================

-- ============================================
-- 5. 创建索引优化查询
-- ============================================
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);

-- ============================================
-- 6. 插入示例公告（可选）
-- ============================================
INSERT INTO public.announcements (title, content, author_id, is_pinned)
SELECT 
    '欢迎使用广东北江中学校园网',
    '亲爱的同学们、老师们：\n\n校园网正式上线啦！在这里你可以：\n1. 在论坛发帖交流\n2. 加入频道群聊\n3. 下载学习资源\n4. 与同学老师私信\n\n如有问题请联系管理员。',
    '00000000-0000-0000-0000-000000000001',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = '欢迎使用广东北江中学校园网');

-- ============================================
-- 完成提示
-- ============================================
SELECT '数据库新功能初始化完成！' AS status;
