# 修复全部页面加载失败问题

## 问题分析

所有页面显示"加载失败"的原因是 **Supabase API Key 不一致**：

### 当前状态
| 文件 | Supabase Key |
|------|--------------|
| `index.html` (登录页) | `sb_publishable_gtr_WIuZKiChZwJz8mR6pw_mk_SAYlG` (较短) |
| `pages/home.html` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT格式，但key有问题) |
| 其他页面 | 各不相同或缺失 |

### 需要确认的步骤

1. **确认正确的 Supabase anon/public key**
   - 需要用户提供正确的 anon key
   - 格式应该是：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT格式)

2. **统一所有页面的 Supabase 配置**
   - 所有页面使用相同的 URL 和 Key
   - 确保 `supabaseClient` 正确初始化

3. **检查数据库表是否存在**
   - 用户是否已执行 `database/fix.sql`

## 实施步骤

### 步骤 1: 提供正确的 Supabase Key
用户需要在 Supabase Dashboard 获取正确的 anon key:
1. 打开 https://supabase.com/dashboard
2. 进入项目 → Settings → API
3. 复制 `anon` key

### 步骤 2: 修复所有页面的 Supabase 配置
统一使用正确的 key，格式:
```javascript
const SUPABASE_URL = 'https://verskaemxqoukhnlwnbq.supabase.co';
const SUPABASE_KEY = '正确的anon key';
```

### 步骤 3: 确保数据库表存在
如果还没执行，请执行 `database/fix.sql`

## 待确认
需要用户提供正确的 Supabase anon key 才能继续修复。
