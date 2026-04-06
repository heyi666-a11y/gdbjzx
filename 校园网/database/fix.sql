-- 广东北江中学校园网数据库修复/补充SQL
-- 如果表已存在则跳过，不存在则创建
-- 可重复执行

-- 1. 创建用户表 (profiles) - 如果不存在
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin')),
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(100),
    birthday DATE,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expire_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 帖子表 (posts) - 如果不存在
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('student', 'teacher', 'all')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 评论表 (comments) - 如果不存在
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 点赞表 (likes) - 如果不存在
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 5. 私信表 (messages) - 如果不存在
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    file_url TEXT,
    file_name TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 群组表 (groups) - 如果不存在
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    avatar_url TEXT,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 群组成员表 (group_members) - 如果不存在
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- 8. 群消息表 (group_messages) - 如果不存在
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 资源表 (resources) - 如果不存在
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 会员记录表 (membership_records) - 如果不存在
CREATE TABLE IF NOT EXISTS public.membership_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('grant', 'revoke')),
    reason TEXT,
    operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 每日发帖限制表 (daily_post_limits) - 如果不存在
CREATE TABLE IF NOT EXISTS public.daily_post_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_date DATE NOT NULL,
    post_count INTEGER DEFAULT 1,
    UNIQUE(user_id, post_date)
);

-- 创建索引 - 使用 DO $$ 块确保幂等性
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_author') THEN
        CREATE INDEX idx_posts_author ON public.posts(author_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_channel') THEN
        CREATE INDEX idx_posts_channel ON public.posts(channel);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_created_at') THEN
        CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_post') THEN
        CREATE INDEX idx_comments_post ON public.comments(post_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_likes_post') THEN
        CREATE INDEX idx_likes_post ON public.likes(post_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_likes_user') THEN
        CREATE INDEX idx_likes_user ON public.likes(user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender') THEN
        CREATE INDEX idx_messages_sender ON public.messages(sender_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_receiver') THEN
        CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_members_group') THEN
        CREATE INDEX idx_group_members_group ON public.group_members(group_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_group_members_user') THEN
        CREATE INDEX idx_group_members_user ON public.group_members(user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_resources_uploader') THEN
        CREATE INDEX idx_resources_uploader ON public.resources(uploader_id);
    END IF;
END $$;

-- 启用行级安全 (RLS) - 每个表单独处理
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- RLS 策略 - 使用 DROP POLICY IF EXISTS 确保可重复执行
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on posts" ON public.posts;
CREATE POLICY "Allow all on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on comments" ON public.comments;
CREATE POLICY "Allow all on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on likes" ON public.likes;
CREATE POLICY "Allow all on likes" ON public.likes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on messages" ON public.messages;
CREATE POLICY "Allow all on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on groups" ON public.groups;
CREATE POLICY "Allow all on groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on group_members" ON public.group_members;
CREATE POLICY "Allow all on group_members" ON public.group_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on group_messages" ON public.group_messages;
CREATE POLICY "Allow all on group_messages" ON public.group_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on resources" ON public.resources;
CREATE POLICY "Allow all on resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on membership_records" ON public.membership_records;
CREATE POLICY "Allow all on membership_records" ON public.membership_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on daily_post_limits" ON public.daily_post_limits;
CREATE POLICY "Allow all on daily_post_limits" ON public.daily_post_limits FOR ALL USING (true) WITH CHECK (true);

-- 确保默认管理员账户存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE student_id = 'admin') THEN
        INSERT INTO public.profiles (id, user_type, name, student_id, is_vip)
        VALUES ('00000000-0000-0000-0000-000000000001', 'admin', '管理员', 'admin', true);
    END IF;
END $$;

SELECT '数据库修复完成！' AS status;
