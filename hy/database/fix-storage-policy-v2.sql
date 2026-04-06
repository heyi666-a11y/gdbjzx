-- 修复 storage.objects 表的 RLS 策略 - 版本2
-- 简化策略，不检查 owner 字段

-- 删除 storage.objects 表上的所有策略
DROP POLICY IF EXISTS "yunxu 128fyud_0 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "yunxushangchuan 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "允许上传 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "yunxu 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select on resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert on resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on resources" ON storage.objects;

-- 创建 SELECT 策略（允许所有人下载 resources 桶的文件）
CREATE POLICY "Allow public select on resources"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resources');

-- 创建 INSERT 策略（允许认证用户上传到 resources 桶）
-- 注意：不检查 owner，因为前端上传时没有设置 owner
CREATE POLICY "Allow authenticated insert on resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- 创建 UPDATE 策略（允许认证用户更新 resources 桶的文件）
CREATE POLICY "Allow authenticated update on resources"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- 创建 DELETE 策略（允许认证用户删除 resources 桶的文件）
CREATE POLICY "Allow authenticated delete on resources"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resources');

-- 验证策略是否创建成功
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' AND qual LIKE '%resources%';
