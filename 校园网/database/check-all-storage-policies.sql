-- 检查 storage.objects 表上的所有策略
SELECT 
    policyname, 
    cmd, 
    permissive,
    roles::text,
    qual as "限定符", 
    with_check as "带检查"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname, cmd;
