-- 修改 resources bucket 的文件大小限制为 30MB (30 * 1024 * 1024 = 31457280 bytes)
UPDATE storage.buckets
SET file_size_limit = 31457280
WHERE name = 'resources';

-- 验证设置
SELECT 
    name,
    public,
    file_size_limit,
    file_size_limit / 1024 / 1024 as "大小限制(MB)"
FROM storage.buckets
WHERE name = 'resources';
