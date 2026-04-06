# 广东北江中学校园网 - 体验优化规格

## Why

用户反馈当前实现存在以下问题：
1. 灵动效果在页面内体现不足
2. "我的"页面显示加载用户信息失败
3. "消息"页面显示加载失败且页面变成电脑比例（没有手机竖屏适配）
4. "论坛"即为贴吧页，不用分频道
5. 发布帖子的功能太简陋
6. 首页最新帖子显示加载失败
7. 整体体验不如登录页面美观

## What Changes

### 问题修复
1. **"我的"页面加载失败** - 修复 Supabase 查询代码
2. **"消息"页面加载失败** - 修复 Supabase 查询代码
3. **"消息"页面手机适配** - 修复 viewport 和布局适配
4. **首页最新帖子加载失败** - 修复 Supabase 查询代码

### 灵动效果增强
1. **按钮交互** - 点击缩放 + 波纹效果
2. **卡片动画** - 悬停上浮 + 阴影加深 + 边框高亮
3. **列表动画** - 逐条淡入 + 交错延迟
4. **页面转场** - 淡入淡出效果
5. **加载动画** - 骨架屏或优雅的加载动画
6. **Toast提示** - 从顶部滑入滑出 + 颜色区分
7. **输入框** - 聚焦时边框动画

### 发布帖子功能丰富
1. **发帖弹窗** - 更大的输入框
2. **频道选择** - 美观的标签选择器
3. **字数统计** - 实时显示字数
4. **预览功能** - 发布前预览

### 整体美观提升
1. **统一的设计语言** - 保持与登录页一致的视觉风格
2. **更精致的卡片** - 更好的阴影和圆角
3. **图标优化** - Font Awesome 图标
4. **间距优化** - 更好的留白
5. **字体层级** - 清晰的标题/正文/辅助文字

## Impact
- 需要修改 home.html, tieba.html, messages.html, profile.html
- 需要增强所有页面的动画效果
- 需要优化移动端适配

## Technical Requirements

### 白色简洁设计
```css
--bg-color: #ffffff;
--text-primary: #1a1a1a;
--text-secondary: #666666;
--text-tertiary: #999999;
--border-color: #f0f0f0;
--shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
--gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

### 灵动动画
```css
/* 按钮点击 */
.btn:active {
    transform: scale(0.96);
    transition: transform 0.15s ease;
}

/* 卡片悬停 */
.card {
    transition: all 0.25s ease;
}
.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* 列表项动画 */
.list-item {
    opacity: 0;
    animation: slideUp 0.3s ease forwards;
}
.list-item:nth-child(1) { animation-delay: 0.05s; }
.list-item:nth-child(2) { animation-delay: 0.1s; }
.list-item:nth-child(3) { animation-delay: 0.15s; }

/* 页面淡入 */
.page-content {
    animation: fadeIn 0.4s ease;
}

/* Toast */
@keyframes toastIn {
    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 移动端适配
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
    body {
        max-width: 480px;
        margin: 0 auto;
    }
</style>
```

### Supabase 修复
```javascript
// 修复关联查询
const { data: posts } = await supabaseClient
    .from('posts')
    .select(`
        *,
        profiles (
            name,
            user_type,
            is_vip
        )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10);
```

## 页面清单
1. `pages/home.html` - **优化**
2. `pages/tieba.html` - **优化**
3. `pages/messages.html` - **优化**
4. `pages/profile.html` - **优化**
