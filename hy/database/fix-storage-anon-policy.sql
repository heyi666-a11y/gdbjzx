-- 修改策略：允许匿名用户（anon）上传文件到 resources bucket
-- 先删除现有的 INSERT 策略
DROP POLICY IF EXISTS "Allow authenticated insert on resources" ON storage.objects;

-- 创建新的 INSERT 策略，允许 anon 和 authenticated 角色
CREATE POLICY "Allow insert on resources"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'resources');

-- 同时修改其他策略也允许 anon 访问
DROP POLICY IF EXISTS "Allow authenticated delete on resources" ON storage.objects;
CREATE POLICY "Allow delete on resources"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "Allow authenticated update on resources" ON storage.objects;
CREATE POLICY "Allow update on resources"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- 验证所有策略
SELECT 
    policyname, 
    cmd, 
    roles::text as "角色",
    qual as "限定符", 
    with_check as "带检查"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%resources%'
ORDER BY cmd;
