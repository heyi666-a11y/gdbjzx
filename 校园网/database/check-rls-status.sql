-- 检查 storage.objects 表的 RLS 状态
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as force_rls
FROM pg_class
WHERE relname = 'objects' 
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');

-- 检查是否有其他策略（非 resources 相关的）
SELECT 
    policyname, 
    cmd,
    roles::text
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname NOT LIKE '%resources%'
ORDER BY policyname;
