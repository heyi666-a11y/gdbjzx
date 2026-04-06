-- 为 messages 表添加 read_at 字段（用于标记消息已读）
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 为 group_messages 表也添加 read_at 字段
ALTER TABLE group_messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 验证
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
