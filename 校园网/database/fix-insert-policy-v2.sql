-- 修复 INSERT 策略 - 限定符也需要设置
-- 先删除现有的 INSERT 策略
DROP POLICY IF EXISTS "Allow authenticated insert on resources" ON storage.objects;

-- 重新创建 INSERT 策略，使用 USING 和 WITH CHECK
CREATE POLICY "Allow authenticated insert on resources"
ON storage.objects
FOR INSERT
TO authenticated
USING (bucket_id = 'resources')
WITH CHECK (bucket_id = 'resources');

-- 验证
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname = 'Allow authenticated insert on resources';
