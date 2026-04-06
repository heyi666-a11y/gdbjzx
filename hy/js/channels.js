/**
 * ========================================
 * 广东北江中学校园网 - 频道功能模块
 * ========================================
 */

const Channels = {
    // 当前频道
    currentChannel: 'student',
    
    // 帖子数据缓存
    postsCache: {
        student: [],
        teacher: [],
        all: []
    },
    
    // 当前用户信息
    currentUser: null,
    
    /**
     * 初始化频道模块
     */
    init() {
        // 获取当前用户
        this.currentUser = Auth.getCurrentUser();
        
        // 检查登录状态
        if (!this.currentUser) {
            window.location.href = '../index.html';
            return;
        }
        
        // 加载初始数据
        this.loadChannelPosts('student');
        this.loadChannelPosts('teacher');
        this.loadChannelPosts('all');
        
        // 设置实时订阅
        this.setupRealtimeSubscription();
    },
    
    /**
     * 切换频道
     * @param {string} channel - 频道类型 (student/teacher/all)
     */
    switchChannel(channel) {
        // 权限检查：教师频道只有教师和管理员可见
        if (channel === 'teacher' && !this.canAccessTeacherChannel()) {
            showToast('您没有权限访问教师频道');
            return;
        }
        
        this.currentChannel = channel;
        
        // 更新标签样式
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-channel="${channel}"]`).classList.add('active');
        
        // 切换内容显示
        document.querySelectorAll('.channel-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${channel}-channel`).classList.add('active');
        
        // 加载该频道帖子
        this.renderPosts(channel);
    },
    
    /**
     * 检查是否可以访问教师频道
     */
    canAccessTeacherChannel() {
        if (!this.currentUser) return false;
        return this.currentUser.role === 'teacher' || 
               this.currentUser.role === 'admin' || 
               this.currentUser.role === 'super_admin';
    },
    
    /**
     * 加载频道帖子
     * @param {string} channel - 频道类型
     */
    async loadChannelPosts(channel) {
        try {
            const client = getSupabaseClient();
            if (!client) return;
            
            // 从Supabase获取帖子
            const { data: posts, error } = await client
                .from('channel_posts')
                .select(`
                    *,
                    author:users(name, role, avatar, is_vip)
                `)
                .eq('channel_type', channel)
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) {
                console.error('Load posts error:', error);
                // 使用模拟数据
                this.postsCache[channel] = this.getMockPosts(channel);
            } else {
                this.postsCache[channel] = posts || [];
            }
            
            // 如果是当前频道，渲染帖子
            if (channel === this.currentChannel) {
                this.renderPosts(channel);
            }
            
        } catch (error) {
            console.error('Load channel posts error:', error);
            this.postsCache[channel] = this.getMockPosts(channel);
            this.renderPosts(channel);
        }
    },
    
    /**
     * 获取模拟帖子数据
     * @param {string} channel - 频道类型
     */
    getMockPosts(channel) {
        const mockData = {
            student: [
                {
                    id: 1,
                    content: '今天食堂的麻辣烫真的超好吃！推荐大家都去试试 🍜',
                    author: { name: '小明', role: 'student', is_vip: false },
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    likes: 24,
                    comments: 8,
                    is_liked: false
                },
                {
                    id: 2,
                    content: '有人一起组队参加下周的篮球赛吗？🏀',
                    author: { name: '运动达人', role: 'student', is_vip: true },
                    created_at: new Date(Date.now() - 7200000).toISOString(),
                    likes: 15,
                    comments: 12,
                    is_liked: true
                },
                {
                    id: 3,
                    content: '求推荐好用的数学辅导书，期中考试快到了 📚',
                    author: { name: '学霸之路', role: 'student', is_vip: false },
                    created_at: new Date(Date.now() - 10800000).toISOString(),
                    likes: 32,
                    comments: 20,
                    is_liked: false
                }
            ],
            teacher: [
                {
                    id: 4,
                    content: '各位老师，本周五下午3点召开教研会议，请准时参加。',
                    author: { name: '教务处', role: 'admin', is_vip: false },
                    created_at: new Date(Date.now() - 1800000).toISOString(),
                    likes: 45,
                    comments: 3,
                    is_liked: false
                },
                {
                    id: 5,
                    content: '期中考试试卷已审核完毕，请各位老师按时领取。',
                    author: { name: '王老师', role: 'teacher', is_vip: false },
                    created_at: new Date(Date.now() - 5400000).toISOString(),
                    likes: 28,
                    comments: 5,
                    is_liked: true
                }
            ],
            all: [
                {
                    id: 6,
                    content: '🎉 校园歌手大赛报名开始啦！有兴趣的同学请到学生会报名。',
                    author: { name: '学生会', role: 'admin', is_vip: false },
                    created_at: new Date(Date.now() - 900000).toISOString(),
                    likes: 156,
                    comments: 45,
                    is_liked: false
                },
                {
                    id: 7,
                    content: '图书馆新到了一批图书，欢迎大家前来借阅 📖',
                    author: { name: '李老师', role: 'teacher', is_vip: false },
                    created_at: new Date(Date.now() - 4500000).toISOString(),
                    likes: 67,
                    comments: 12,
                    is_liked: false
                },
                {
                    id: 8,
                    content: '感谢老师们在运动会期间的辛勤付出！',
                    author: { name: '班长', role: 'student', is_vip: true },
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    likes: 89,
                    comments: 15,
                    is_liked: true
                }
            ]
        };
        
        return mockData[channel] || [];
    },
    
    /**
     * 渲染帖子列表
     * @param {string} channel - 频道类型
     */
    renderPosts(channel) {
        const container = document.getElementById(`${channel}Posts`);
        if (!container) return;
        
        const posts = this.postsCache[channel];
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <div class="empty-title">暂无帖子</div>
                    <div class="empty-desc">成为第一个发帖的人吧！</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = posts.map(post => this.createPostHTML(post)).join('');
    },
    
    /**
     * 创建帖子HTML
     * @param {Object} post - 帖子数据
     */
    createPostHTML(post) {
        const time = this.formatTime(post.created_at);
        const badge = this.getAuthorBadge(post.author);
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar">
                        ${post.author.name.charAt(0)}
                    </div>
                    <div class="post-meta">
                        <div class="post-author">
                            ${post.author.name}
                            ${badge}
                        </div>
                        <div class="post-time">${time}</div>
                    </div>
                    <button class="post-menu" onclick="showPostMenu(${post.id})">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                <div class="post-content">${this.escapeHtml(post.content)}</div>
                <div class="post-footer">
                    <button class="action-btn ${post.is_liked ? 'active' : ''}" onclick="toggleLike(${post.id})">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="action-btn" onclick="showComments(${post.id})">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments || 0}</span>
                    </button>
                    <button class="action-btn" onclick="sharePost(${post.id})">
                        <i class="fas fa-share"></i>
                        <span>分享</span>
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * 获取作者徽章
     * @param {Object} author - 作者信息
     */
    getAuthorBadge(author) {
        if (!author) return '';
        
        if (author.role === 'teacher' || author.role === 'admin') {
            return '<span class="author-badge teacher">教师</span>';
        }
        if (author.is_vip) {
            return '<span class="author-badge vip">VIP</span>';
        }
        return '<span class="author-badge student">学生</span>';
    },
    
    /**
     * 格式化时间
     * @param {string} timestamp - ISO时间字符串
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }
        // 小于1小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        }
        // 小于24小时
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        }
        // 小于7天
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        }
        
        return date.toLocaleDateString('zh-CN');
    },
    
    /**
     * 创建新帖子
     * @param {string} channel - 频道类型
     */
    async createPost(channel) {
        const input = document.getElementById(`${channel}Input`);
        const content = input.value.trim();
        
        if (!content) {
            showToast('请输入内容');
            return;
        }
        
        // 检查是否是会员（限制功能）
        if (!this.currentUser.is_vip && content.length > 200) {
            showVipModal();
            return;
        }
        
        try {
            const client = getSupabaseClient();
            if (client) {
                const { data, error } = await client
                    .from('channel_posts')
                    .insert([{
                        channel_type: channel,
                        content: content,
                        author_id: this.currentUser.id,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                
                // 添加到缓存
                this.postsCache[channel].unshift({
                    ...data,
                    author: {
                        name: this.currentUser.name,
                        role: this.currentUser.role,
                        is_vip: this.currentUser.is_vip
                    },
                    likes: 0,
                    comments: 0,
                    is_liked: false
                });
            } else {
                // 模拟添加
                this.postsCache[channel].unshift({
                    id: Date.now(),
                    content: content,
                    author: {
                        name: this.currentUser.name,
                        role: this.currentUser.role,
                        is_vip: this.currentUser.is_vip
                    },
                    created_at: new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                    is_liked: false
                });
            }
            
            // 清空输入框
            input.value = '';
            
            // 重新渲染
            this.renderPosts(channel);
            
            showToast('发布成功！');
            
        } catch (error) {
            console.error('Create post error:', error);
            showToast('发布失败，请重试');
        }
    },
    
    /**
     * 切换点赞
     * @param {number} postId - 帖子ID
     */
    async toggleLike(postId) {
        const posts = this.postsCache[this.currentChannel];
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;
        
        post.is_liked = !post.is_liked;
        post.likes += post.is_liked ? 1 : -1;
        
        // 更新UI
        this.renderPosts(this.currentChannel);
        
        try {
            const client = getSupabaseClient();
            if (client) {
                await client
                    .from('channel_posts')
                    .update({ likes: post.likes })
                    .eq('id', postId);
            }
        } catch (error) {
            console.error('Toggle like error:', error);
        }
    },
    
    /**
     * 设置实时订阅
     */
    setupRealtimeSubscription() {
        try {
            const client = getSupabaseClient();
            if (!client) return;
            
            client
                .channel('channel_posts')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'channel_posts' },
                    (payload) => {
                        // 有新帖子时刷新当前频道
                        if (payload.new && payload.new.channel_type === this.currentChannel) {
                            this.loadChannelPosts(this.currentChannel);
                        }
                    }
                )
                .subscribe();
                
        } catch (error) {
            console.error('Setup realtime error:', error);
        }
    },
    
    /**
     * HTML转义
     * @param {string} text - 原始文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 全局函数
function switchChannel(channel) {
    Channels.switchChannel(channel);
}

function createPost(channel) {
    Channels.createPost(channel);
}

function toggleLike(postId) {
    Channels.toggleLike(postId);
}

function showComments(postId) {
    showToast('评论功能开发中...');
}

function sharePost(postId) {
    showToast('分享功能开发中...');
}

function showPostMenu(postId) {
    showToast('菜单功能开发中...');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Channels.init();
});
