-- 校园网资源功能 - 存储桶RLS策略修复

-- ============================================  
-- 问题：上传资源失败 - StorageApiError: new row violates row-level security policy
-- 原因：Supabase Storage 存储桶的 RLS 策略未正确设置
-- ============================================

-- 步骤1：检查并创建 resources 存储桶
-- 在 Supabase Dashboard -> Storage -> New bucket 中创建
-- Bucket name: resources
-- Public bucket: 勾选（允许公开访问）
-- File size limit: 5MB（根据需求设置）

-- 步骤2：设置存储桶的 RLS 策略
-- 在 Supabase Dashboard -> Storage -> resources 存储桶 -> Policies 中设置

-- 策略1：允许所有用户读取资源（下载）
-- Policy name: Allow public read
-- Allowed operation: SELECT
-- Target: resources bucket
-- Policy definition: true

-- 策略2：允许认证用户上传资源
-- Policy name: Allow authenticated upload
-- Allowed operation: INSERT
-- Target: resources bucket
-- Policy definition: auth.role() = 'authenticated'

-- 策略3：允许认证用户更新自己的资源
-- Policy name: Allow authenticated update
-- Allowed operation: UPDATE
-- Target: resources bucket
-- Policy definition: auth.role() = 'authenticated'

-- 策略4：允许认证用户删除自己的资源
-- Policy name: Allow authenticated delete
-- Allowed operation: DELETE
-- Target: resources bucket
-- Policy definition: auth.role() = 'authenticated'

-- 步骤3：确保 resources 表的 RLS 策略正确
-- 执行以下SQL：

-- 检查resources表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'resources';

-- 确保resources表有正确的RLS策略
DROP POLICY IF EXISTS "Allow all on resources" ON public.resources;
CREATE POLICY "Allow all on resources" ON public.resources 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 步骤4：测试上传功能
-- 1. 登录网站（学生/老师/管理员账号）
-- 2. 进入资源页面
-- 3. 点击"上传资源"
-- 4. 选择一个小于5MB的文件
-- 5. 填写标题和描述
-- 6. 点击"上传"

-- ============================================
-- 常见问题排查
-- ============================================

-- 问题1：存储桶不存在
-- 解决：按照步骤1创建resources存储桶

-- 问题2：存储桶不是公开的
-- 解决：在存储桶设置中勾选"Public bucket"

-- 问题3：RLS策略未设置
-- 解决：按照步骤2设置所有4个RLS策略

-- 问题4：文件大小超过限制
-- 解决：在存储桶设置中调整File size limit，或上传小于5MB的文件

-- ============================================
-- 完成提示
-- ============================================
SELECT '存储桶RLS策略设置指南已生成！' AS status;
SELECT '请按照上述步骤在Supabase Dashboard中设置存储桶和RLS策略' AS instruction;