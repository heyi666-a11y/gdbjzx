-- 修复 INSERT 策略 - 使用更宽松的条件
-- 先删除现有的 INSERT 策略
DROP POLICY IF EXISTS "Allow authenticated insert on resources" ON storage.objects;

-- 重新创建 INSERT 策略 - 只检查 bucket_id，不限制其他条件
-- 注意：INSERT 策略不需要 USING，只需要 WITH CHECK
CREATE POLICY "Allow authenticated insert on resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- 同时检查 storage.buckets 表是否启用了 RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 确保 buckets 表有适当的策略
DROP POLICY IF EXISTS "Allow public select on buckets" ON storage.buckets;
CREATE POLICY "Allow public select on buckets"
ON storage.buckets
FOR SELECT
TO public
USING (true);

-- 验证所有策略
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
