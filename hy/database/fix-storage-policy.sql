-- 修复 storage.objects 表的 RLS 策略
-- 先删除所有旧的策略，然后创建正确的策略

-- 删除 storage.objects 表上的所有策略
DROP POLICY IF EXISTS "yunxu 128fyud_0 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "yunxushangchuan 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "允许上传 128fyud_0" ON storage.objects;
DROP POLICY IF EXISTS "yunxu 128fyud_0" ON storage.objects;

-- 删除可能存在的其他策略
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON storage.objects;

-- 创建 SELECT 策略（允许所有人下载）
CREATE POLICY "Allow public select on resources"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resources');

-- 创建 INSERT 策略（允许认证用户上传到 resources 桶）
CREATE POLICY "Allow authenticated insert on resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- 创建 UPDATE 策略（允许认证用户更新自己的文件）
CREATE POLICY "Allow authenticated update on resources"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resources' AND owner = auth.uid())
WITH CHECK (bucket_id = 'resources');

-- 创建 DELETE 策略（允许认证用户删除自己的文件）
CREATE POLICY "Allow authenticated delete on resources"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resources' AND owner = auth.uid());

-- 验证策略是否创建成功
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
