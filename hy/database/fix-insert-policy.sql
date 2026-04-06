-- 单独创建 INSERT 策略
-- 先删除可能存在的同名策略
DROP POLICY IF EXISTS "Allow authenticated insert on resources" ON storage.objects;

-- 创建 INSERT 策略
CREATE POLICY "Allow authenticated insert on resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- 验证
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname = 'Allow authenticated insert on resources';
