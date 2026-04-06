/**
 * ========================================
 * 广东北江中学校园网 - 个人中心功能模块
 * ========================================
 */

const Profile = {
    // 当前用户
    currentUser: null,
    
    // 用户统计数据
    stats: {
        posts: 0,
        comments: 0,
        likes: 0
    },
    
    // 用户帖子列表
    myPosts: [],
    
    // 用户评论列表
    myComments: [],
    
    /**
     * 初始化个人中心模块
     */
    init() {
        // 获取当前用户
        this.currentUser = Auth.getCurrentUser();
        
        // 检查登录状态
        if (!this.currentUser) {
            window.location.href = '../index.html';
            return;
        }
        
        // 加载用户信息
        this.loadUserInfo();
        
        // 加载统计数据
        this.loadStats();
        
        // 加载用户帖子
        this.loadMyPosts();
        
        // 加载用户评论
        this.loadMyComments();
    },
    
    /**
     * 加载用户信息
     */
    async loadUserInfo() {
        try {
            const client = getSupabaseClient();
            
            if (client) {
                // 从Supabase获取最新用户信息
                const { data: user, error } = await client
                    .from('users')
                    .select('*')
                    .eq('id', this.currentUser.id)
                    .single();
                
                if (!error && user) {
                    this.currentUser = { ...this.currentUser, ...user };
                    
                    // 更新本地存储
                    const storage = localStorage.getItem('campus_network_user') ? localStorage : sessionStorage;
                    storage.setItem('campus_network_user', JSON.stringify(this.currentUser));
                }
            }
            
            // 更新UI
            this.updateUserUI();
            
        } catch (error) {
            console.error('Load user info error:', error);
            this.updateUserUI();
        }
    },
    
    /**
     * 更新用户UI
     */
    updateUserUI() {
        // 更新用户名
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = this.currentUser.name || '未知用户';
        }
        
        // 更新学号/工号
        const userIdEl = document.querySelector('.user-id');
        if (userIdEl) {
            const label = this.currentUser.role === 'teacher' ? '工号' : '学号';
            userIdEl.textContent = `${label}: ${this.currentUser.username || ''}`;
        }
        
        // 更新角色标识
        const userRoleEl = document.getElementById('userRole');
        if (userRoleEl) {
            let roleHtml = '';
            switch (this.currentUser.role) {
                case 'teacher':
                    roleHtml = '<i class="fas fa-chalkboard-teacher"></i> 教师';
                    break;
                case 'admin':
                case 'super_admin':
                    roleHtml = '<i class="fas fa-user-shield"></i> 管理员';
                    break;
                default:
                    roleHtml = '<i class="fas fa-user-graduate"></i> 学生';
            }
            userRoleEl.innerHTML = roleHtml;
        }
        
        // 更新会员状态
        this.updateVipStatus();
    },
    
    /**
     * 更新会员状态UI
     */
    updateVipStatus() {
        const vipStatusEl = document.getElementById('vipStatus');
        if (!vipStatusEl) return;
        
        if (this.currentUser.is_vip) {
            vipStatusEl.classList.add('vip');
            vipStatusEl.innerHTML = `
                <div class="vip-icon">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="vip-info">
                    <div class="vip-title">VIP会员</div>
                    <div class="vip-desc">享受全部特权功能</div>
                </div>
                <button class="vip-btn" onclick="Profile.showVipDetails()">详情</button>
            `;
        } else {
            vipStatusEl.classList.remove('vip');
            vipStatusEl.innerHTML = `
                <div class="vip-icon">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="vip-info">
                    <div class="vip-title">普通用户</div>
                    <div class="vip-desc">开通会员享受更多特权</div>
                </div>
                <button class="vip-btn" onclick="Profile.contactAdmin()">开通</button>
            `;
        }
    },
    
    /**
     * 加载统计数据
     */
    async loadStats() {
        try {
            const client = getSupabaseClient();
            
            if (client) {
                // 获取帖子数
                const { count: postsCount, error: postsError } = await client
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', this.currentUser.id);
                
                if (!postsError) {
                    this.stats.posts = postsCount || 0;
                }
                
                // 获取评论数
                const { count: commentsCount, error: commentsError } = await client
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', this.currentUser.id);
                
                if (!commentsError) {
                    this.stats.comments = commentsCount || 0;
                }
                
                // 获取获赞数
                const { data: likesData, error: likesError } = await client
                    .from('posts')
                    .select('likes')
                    .eq('author_id', this.currentUser.id);
                
                if (!likesError && likesData) {
                    this.stats.likes = likesData.reduce((sum, post) => sum + (post.likes || 0), 0);
                }
            } else {
                // 使用模拟数据
                this.stats = {
                    posts: 12,
                    comments: 48,
                    likes: 156
                };
            }
            
            // 更新UI
            this.updateStatsUI();
            
        } catch (error) {
            console.error('Load stats error:', error);
            // 使用默认数据
            this.updateStatsUI();
        }
    },
    
    /**
     * 更新统计数据UI
     */
    updateStatsUI() {
        const postsCountEl = document.getElementById('postsCount');
        const commentsCountEl = document.getElementById('commentsCount');
        const likesCountEl = document.getElementById('likesCount');
        
        if (postsCountEl) postsCountEl.textContent = this.stats.posts;
        if (commentsCountEl) commentsCountEl.textContent = this.stats.comments;
        if (likesCountEl) likesCountEl.textContent = this.stats.likes;
    },
    
    /**
     * 加载用户帖子
     */
    async loadMyPosts() {
        try {
            const client = getSupabaseClient();
            
            if (client) {
                const { data: posts, error } = await client
                    .from('posts')
                    .select(`
                        *,
                        comments:comments(count)
                    `)
                    .eq('author_id', this.currentUser.id)
                    .order('created_at', { ascending: false });
                
                if (!error) {
                    this.myPosts = posts || [];
                }
            } else {
                // 模拟数据
                this.myPosts = [
                    {
                        id: 1,
                        title: '今天食堂的麻辣烫真的超好吃！',
                        content: '推荐大家都去试试，特别是牛肉丸和金针菇...',
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        likes: 24,
                        comments: [{ count: 8 }]
                    },
                    {
                        id: 2,
                        title: '有人一起组队参加下周的篮球赛吗？',
                        content: '想组建一个班级篮球队，有兴趣的同学请联系我...',
                        created_at: new Date(Date.now() - 172800000).toISOString(),
                        likes: 15,
                        comments: [{ count: 12 }]
                    }
                ];
            }
            
        } catch (error) {
            console.error('Load my posts error:', error);
        }
    },
    
    /**
     * 加载用户评论
     */
    async loadMyComments() {
        try {
            const client = getSupabaseClient();
            
            if (client) {
                const { data: comments, error } = await client
                    .from('comments')
                    .select(`
                        *,
                        post:posts(title)
                    `)
                    .eq('author_id', this.currentUser.id)
                    .order('created_at', { ascending: false });
                
                if (!error) {
                    this.myComments = comments || [];
                }
            } else {
                // 模拟数据
                this.myComments = [
                    {
                        id: 1,
                        content: '同意！我也觉得很好吃',
                        post: { title: '今天食堂的麻辣烫真的超好吃！' },
                        created_at: new Date(Date.now() - 3600000).toISOString(),
                        likes: 5
                    },
                    {
                        id: 2,
                        content: '求推荐好用的数学辅导书',
                        post: { title: '期中考试复习资料分享' },
                        created_at: new Date(Date.now() - 7200000).toISOString(),
                        likes: 3
                    }
                ];
            }
            
        } catch (error) {
            console.error('Load my comments error:', error);
        }
    },
    
    /**
     * 显示我的帖子
     */
    showMyPosts() {
        if (this.myPosts.length === 0) {
            showToast('暂无帖子');
            return;
        }
        
        // 创建帖子列表弹窗
        const modal = document.createElement('div');
        modal.className = 'posts-modal';
        modal.innerHTML = `
            <div class="posts-modal-content">
                <div class="posts-modal-header">
                    <h3>我的帖子</h3>
                    <button class="close-btn" onclick="this.closest('.posts-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="posts-list">
                    ${this.myPosts.map(post => `
                        <div class="post-item">
                            <div class="post-title">${this.escapeHtml(post.title || post.content.substring(0, 50))}</div>
                            <div class="post-meta">
                                <span>${this.formatTime(post.created_at)}</span>
                                <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                                <span><i class="fas fa-comment"></i> ${post.comments?.[0]?.count || 0}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // 添加样式
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: flex-end;
            animation: fadeIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .posts-modal-content {
                background: white;
                width: 100%;
                max-width: 480px;
                margin: 0 auto;
                border-radius: 24px 24px 0 0;
                max-height: 80vh;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            .posts-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            .posts-modal-header h3 {
                font-size: 18px;
                font-weight: 600;
            }
            .close-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: #f1f5f9;
                cursor: pointer;
            }
            .posts-list {
                overflow-y: auto;
                max-height: calc(80vh - 80px);
                padding: 16px;
            }
            .post-item {
                padding: 16px;
                border-bottom: 1px solid #e2e8f0;
            }
            .post-title {
                font-size: 15px;
                font-weight: 500;
                margin-bottom: 8px;
            }
            .post-meta {
                font-size: 13px;
                color: #64748b;
                display: flex;
                gap: 16px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
    },
    
    /**
     * 显示我的评论
     */
    showMyComments() {
        if (this.myComments.length === 0) {
            showToast('暂无评论');
            return;
        }
        
        // 创建评论列表弹窗
        const modal = document.createElement('div');
        modal.className = 'comments-modal';
        modal.innerHTML = `
            <div class="comments-modal-content">
                <div class="comments-modal-header">
                    <h3>我的评论</h3>
                    <button class="close-btn" onclick="this.closest('.comments-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="comments-list">
                    ${this.myComments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-post">${this.escapeHtml(comment.post?.title || '')}</div>
                            <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                            <div class="comment-meta">
                                <span>${this.formatTime(comment.created_at)}</span>
                                <span><i class="fas fa-heart"></i> ${comment.likes || 0}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // 添加样式
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            align-items: flex-end;
            animation: fadeIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .comments-modal-content {
                background: white;
                width: 100%;
                max-width: 480px;
                margin: 0 auto;
                border-radius: 24px 24px 0 0;
                max-height: 80vh;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            .comments-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            .comments-modal-header h3 {
                font-size: 18px;
                font-weight: 600;
            }
            .close-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: #f1f5f9;
                cursor: pointer;
            }
            .comments-list {
                overflow-y: auto;
                max-height: calc(80vh - 80px);
                padding: 16px;
            }
            .comment-item {
                padding: 16px;
                border-bottom: 1px solid #e2e8f0;
            }
            .comment-post {
                font-size: 13px;
                color: #64748b;
                margin-bottom: 4px;
            }
            .comment-content {
                font-size: 15px;
                font-weight: 500;
                margin-bottom: 8px;
            }
            .comment-meta {
                font-size: 13px;
                color: #64748b;
                display: flex;
                gap: 16px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
    },
    
    /**
     * 显示会员详情
     */
    showVipDetails() {
        showToast('VIP特权：发送图片/文件、创建群聊、优先客服等');
    },
    
    /**
     * 联系管理员
     */
    contactAdmin() {
        window.location.href = 'messages.html?user=admin';
    },
    
    /**
     * 更换头像
     */
    async changeAvatar() {
        // 检查是否是会员
        if (!this.currentUser.is_vip) {
            showToast('更换头像需要VIP会员');
            setTimeout(() => this.contactAdmin(), 1000);
            return;
        }
        
        showToast('头像更换功能开发中...');
    },
    
    /**
     * 修改密码
     */
    async changePassword() {
        const oldPassword = prompt('请输入原密码：');
        if (!oldPassword) return;
        
        const newPassword = prompt('请输入新密码（至少6位）：');
        if (!newPassword || newPassword.length < 6) {
            showToast('密码长度至少6位');
            return;
        }
        
        const confirmPassword = prompt('请确认新密码：');
        if (newPassword !== confirmPassword) {
            showToast('两次输入的密码不一致');
            return;
        }
        
        try {
            const result = await Auth.changePassword(oldPassword, newPassword);
            showToast(result.message);
        } catch (error) {
            showToast('密码修改失败');
        }
    },
    
    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString('zh-CN');
    },
    
    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
});
