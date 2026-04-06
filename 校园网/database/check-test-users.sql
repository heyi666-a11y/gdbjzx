-- 查看 profiles 表中叫"测试"的用户
SELECT id, name, user_type, is_vip, student_id
FROM profiles
WHERE name = '测试';

-- 查看所有用户（用于对比）
SELECT id, name, user_type, is_vip, student_id
FROM profiles
ORDER BY name, user_type;
