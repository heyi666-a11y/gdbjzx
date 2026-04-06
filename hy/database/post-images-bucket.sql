-- 创建帖子图片存储 bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 允许认证用户上传图片
DROP POLICY IF EXISTS "Allow authenticated upload post images" ON storage.objects;
CREATE POLICY "Allow authenticated upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- 允许公开访问图片
DROP POLICY IF EXISTS "Allow public select post images" ON storage.objects;
CREATE POLICY "Allow public select post images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'post-images');

-- 允许认证用户删除自己的图片
DROP POLICY IF EXISTS "Allow authenticated delete post images" ON storage.objects;
CREATE POLICY "Allow authenticated delete post images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images');

-- 验证
SELECT * FROM storage.buckets WHERE name = 'post-images';
