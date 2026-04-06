-- 只修复 INSERT 策略（不包含 buckets 部分）
-- 先删除现有的 INSERT 策略
DROP POLICY IF EXISTS "Allow authenticated insert on resources" ON storage.objects;

-- 重新创建 INSERT 策略
CREATE POLICY "Allow authenticated insert on resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- 验证
SELECT 
    policyname, 
    cmd, 
    qual as "限定符", 
    with_check as "带检查"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%resources%'
ORDER BY cmd;
