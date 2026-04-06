-- 广东北江中学校园网 - 资源功能SQL

-- ============================================
-- 重要提示：
-- 以下存储桶需要在 Supabase Dashboard 中手动创建
-- SQL无法直接创建存储桶
-- ============================================

-- 步骤1：在 Supabase Dashboard -> Storage -> New bucket 中创建
-- Bucket name: resources
-- Public bucket: 勾选（允许公开访问）

-- 步骤2：设置存储桶的RLS策略（在Storage -> Policies中设置）
-- 或者执行以下SQL设置存储权限：

-- 允许所有用户读取资源
-- 在Storage Policies中添加：
-- Policy name: Allow public read
-- Allowed operation: SELECT
-- Target: resources bucket
-- Policy definition: true

-- 允许认证用户上传资源
-- Policy name: Allow authenticated upload
-- Allowed operation: INSERT
-- Target: resources bucket
-- Policy definition: auth.role() = 'authenticated'

-- 步骤3：确保resources表已存在
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    category VARCHAR(50) DEFAULT 'other',
    download_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加RLS策略
DROP POLICY IF EXISTS "Allow all on resources" ON public.resources;
CREATE POLICY "Allow all on resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON public.resources(uploader_id);
CREATE INDEX IF NOT EXISTS idx_resources_deleted ON public.resources(is_deleted);

-- ============================================
-- 完成提示
-- ============================================
SELECT '资源功能数据库初始化完成！' AS status;
SELECT '请记得在Supabase Dashboard中手动创建resources存储桶' AS reminder;
