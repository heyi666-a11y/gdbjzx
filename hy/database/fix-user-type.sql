-- 统一 user_type 为中文
UPDATE profiles SET user_type = '学生' WHERE user_type = 'student';
UPDATE profiles SET user_type = '教师' WHERE user_type = 'teacher';
UPDATE profiles SET user_type = '管理员' WHERE user_type = 'admin';

-- 验证
SELECT id, name, user_type, is_vip FROM profiles ORDER BY name;
