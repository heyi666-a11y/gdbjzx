/**
 * ========================================
 * 广东北江中学校园网 - 管理员功能
 * ========================================
 */

// 全局状态
let currentPage = 1;
let currentTab = 'posts';
let currentUserFilter = {
    role: 'all',
    vip: 'all',
    sort: 'newest',
    search: ''
};
let selectedUserId = null;
let selectedContentId = null;
let confirmCallback = null;

// 管理员账号配置
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

/**
 * 检查管理员权限
 */
function checkAdminAuth() {
    const user = Auth.getCurrentUser();
    
    // 检查是否是管理员
    if (!user || (user.role !== 'admin' && user.username !== ADMIN_CREDENTIALS.username)) {
        showToast('请先使用管理员账号登录');
        window.location.href = '../index.html';
        return false;
    }
    
    return true;
}

/**
 * 切换侧边栏
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

/**
 * 页面跳转
 */
function goToPage(page) {
    const pageMap = {
        'dashboard': 'dashboard.html',
        'users': 'users.html',
        'content': 'content.html',
        'resources': 'resources.html',
        'announcements': 'announcements.html',
        'settings': 'settings.html'
    };
    
    const targetPage = pageMap[page];
    if (targetPage) {
        window.location.href = targetPage;
    }
}

/**
 * 退出登录
 */
function logout() {
    Auth.logout();
    showToast('已退出登录');
}

// ==================== 仪表盘功能 ====================

/**
 * 加载仪表盘统计数据
 */
async function loadDashboardStats() {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        // 并行获取统计数据
        const [
            { count: userCount },
            { count: postCount },
            { count: resourceCount },
            { count: vipCount }
        ] = await Promise.all([
            client.from('profiles').select('*', { count: 'exact', head: true }),
            client.from('posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
            client.from('resources').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
            client.from('profiles').select('*', { count: 'exact', head: true }).eq('is_vip', true)
        ]);
        
        // 更新显示
        updateStatValue('totalUsers', userCount || 0);
        updateStatValue('totalPosts', postCount || 0);
        updateStatValue('totalResources', resourceCount || 0);
        updateStatValue('totalVip', vipCount || 0);
        
    } catch (error) {
        console.error('Load dashboard stats error:', error);
    }
}

/**
 * 更新统计数值
 */
function updateStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        // 数字动画
        animateNumber(el, 0, value, 1000);
    }
}

/**
 * 数字动画
 */
function animateNumber(el, start, end, duration) {
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    
    let startTime = new Date().getTime();
    let endTime = startTime + duration;
    let timer;
    
    function run() {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        el.textContent = value;
        if (value == end) {
            clearInterval(timer);
        }
    }
    
    timer = setInterval(run, stepTime);
    run();
}

/**
 * 加载最近活动
 */
async function loadRecentActivities() {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        // 获取最近的用户注册、帖子、资源等活动
        const { data: activities, error } = await client
            .from('profiles')
            .select('id, name, created_at, user_type')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        renderActivities(activities);
        
    } catch (error) {
        console.error('Load activities error:', error);
    }
}

/**
 * 渲染活动列表
 */
function renderActivities(activities) {
    const listEl = document.getElementById('activityList');
    if (!listEl) return;
    
    if (!activities || activities.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><p>暂无活动</p></div>';
        return;
    }
    
    listEl.innerHTML = activities.map(activity => {
        const iconClass = activity.user_type === 'teacher' ? 'user' : 
                         activity.user_type === 'admin' ? 'user' : 'user';
        const actionText = '注册成为新用户';
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas fa-user"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${escapeHtml(activity.name)}</strong> ${actionText}
                    </div>
                    <div class="activity-time">${formatTime(activity.created_at)}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 打开发布公告弹窗
 */
function openAnnounceModal() {
    const modal = document.getElementById('announceModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * 关闭发布公告弹窗
 */
function closeAnnounceModal() {
    const modal = document.getElementById('announceModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // 重置表单
    const form = document.getElementById('announceForm');
    if (form) form.reset();
}

/**
 * 处理公告提交
 */
async function handleAnnounceSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('announceType')?.value;
    const title = document.getElementById('announceTitle')?.value.trim();
    const content = document.getElementById('announceContent')?.value.trim();
    
    if (!title || !content) {
        showToast('请填写完整信息');
        return;
    }
    
    const submitBtn = document.getElementById('submitAnnounceBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发布中...';
    }
    
    try {
        const client = getSupabaseClient();
        if (!client) {
            showToast('系统初始化失败');
            return;
        }
        
        // 保存公告到数据库
        const { data, error } = await client
            .from('announcements')
            .insert([{
                title: title,
                content: content,
                type: type,
                author_id: Auth.getCurrentUser()?.id,
                created_at: new Date().toISOString()
            }]);
        
        if (error) throw error;
        
        showToast('公告发布成功');
        closeAnnounceModal();
        
    } catch (error) {
        console.error('Announce error:', error);
        showToast('发布失败：' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '发布并推送';
        }
    }
}

// ==================== 用户管理功能 ====================

/**
 * 加载用户列表
 */
async function loadUsers(append = false) {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        let query = client
            .from('profiles')
            .select('*')
            .range((currentPage - 1) * 10, currentPage * 10 - 1);
        
        // 角色筛选
        if (currentUserFilter.role !== 'all') {
            query = query.eq('user_type', currentUserFilter.role);
        }
        
        // VIP筛选
        if (currentUserFilter.vip !== 'all') {
            query = query.eq('is_vip', currentUserFilter.vip === 'vip');
        }
        
        // 搜索筛选
        if (currentUserFilter.search) {
            query = query.or(`name.ilike.%${currentUserFilter.search}%,student_id.ilike.%${currentUserFilter.search}%`);
        }
        
        // 排序
        if (currentUserFilter.sort === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else if (currentUserFilter.sort === 'oldest') {
            query = query.order('created_at', { ascending: true });
        } else if (currentUserFilter.sort === 'name') {
            query = query.order('name', { ascending: true });
        }
        
        const { data: users, error } = await query;
        
        if (error) throw error;
        
        renderUsers(users, append);
        updateUserCount(users?.length || 0);
        
    } catch (error) {
        console.error('Load users error:', error);
        showToast('加载用户失败');
    }
}

/**
 * 渲染用户列表
 */
function renderUsers(users, append = false) {
    const listEl = document.getElementById('userList');
    if (!listEl) return;
    
    if (!append) {
        listEl.innerHTML = '';
    }
    
    if (!users || users.length === 0) {
        if (!append) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="empty-title">暂无用户</div>
                </div>
            `;
        }
        return;
    }
    
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.innerHTML = `
            <div class="user-avatar ${user.is_vip ? 'vip' : ''}">
                ${user.name?.charAt(0) || '?'}
            </div>
            <div class="user-info">
                <div class="user-name">
                    ${escapeHtml(user.name)}
                    ${user.is_vip ? '<span class="vip-badge">VIP</span>' : ''}
                </div>
                <div class="user-meta">
                    <span class="role-badge ${user.user_type}">${getRoleText(user.user_type)}</span>
                    <span><i class="fas fa-id-card"></i> ${user.student_id || '无学号'}</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(user.created_at)}</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="action-btn-small" onclick="openUserDetail('${user.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn-small danger" onclick="confirmDeleteUser('${user.id}', '${escapeHtml(user.name)}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        listEl.appendChild(item);
    });
}

/**
 * 更新用户数量显示
 */
function updateUserCount(count) {
    const countEl = document.getElementById('userCount');
    if (countEl) {
        countEl.textContent = `共 ${count} 位用户`;
    }
}

/**
 * 获取角色文本
 */
function getRoleText(role) {
    const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'admin': '管理员'
    };
    return roleMap[role] || role;
}

/**
 * 搜索处理
 */
function handleSearch(value) {
    currentUserFilter.search = value.trim();
    currentPage = 1;
    
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        loadUsers();
    }, 300);
}

/**
 * 筛选处理
 */
function handleFilter() {
    const roleFilter = document.getElementById('roleFilter');
    const vipFilter = document.getElementById('vipFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (roleFilter) currentUserFilter.role = roleFilter.value;
    if (vipFilter) currentUserFilter.vip = vipFilter.value;
    if (sortFilter) currentUserFilter.sort = sortFilter.value;
    
    currentPage = 1;
    loadUsers();
}

/**
 * 打开用户详情
 */
async function openUserDetail(userId) {
    selectedUserId = userId;
    
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { data: user, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        renderUserDetail(user);
        
        const modal = document.getElementById('userDetailModal');
        if (modal) modal.classList.add('active');
        
    } catch (error) {
        console.error('Load user detail error:', error);
        showToast('加载用户详情失败');
    }
}

/**
 * 渲染用户详情
 */
function renderUserDetail(user) {
    const contentEl = document.getElementById('userDetailContent');
    if (!contentEl) return;
    
    const isVip = user.is_vip;
    const vipExpireText = user.vip_expire_at ? 
        new Date(user.vip_expire_at).toLocaleDateString('zh-CN') : '永久';
    
    contentEl.innerHTML = `
        <div class="user-detail-header">
            <div class="user-detail-avatar ${isVip ? 'vip' : ''}">
                ${user.name?.charAt(0) || '?'}
            </div>
            <div class="user-detail-info">
                <h3>${escapeHtml(user.name)} ${isVip ? '<span class="vip-badge">VIP</span>' : ''}</h3>
                <p>${getRoleText(user.user_type)} · ${user.student_id || '无学号'}</p>
            </div>
        </div>
        
        <div class="detail-grid">
            <div class="detail-section">
                <div class="detail-label">注册时间</div>
                <div class="detail-value">${new Date(user.created_at).toLocaleDateString('zh-CN')}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">手机号</div>
                <div class="detail-value">${user.phone || '未绑定'}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">学科/班级</div>
                <div class="detail-value">${user.subject || user.class_id || '未设置'}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">会员到期</div>
                <div class="detail-value">${isVip ? vipExpireText : '非会员'}</div>
            </div>
        </div>
        
        <div class="action-group">
            ${!isVip ? `
                <button class="action-btn-full success" onclick="grantVip('${user.id}')">
                    <i class="fas fa-crown"></i> 开通会员
                </button>
            ` : `
                <button class="action-btn-full primary" onclick="revokeVip('${user.id}')">
                    <i class="fas fa-times-circle"></i> 取消会员
                </button>
            `}
            <button class="action-btn-full danger" onclick="confirmDeleteUser('${user.id}', '${escapeHtml(user.name)}')">
                <i class="fas fa-trash-alt"></i> 删除用户
            </button>
        </div>
    `;
}

/**
 * 关闭用户详情弹窗
 */
function closeUserDetailModal() {
    const modal = document.getElementById('userDetailModal');
    if (modal) modal.classList.remove('active');
    selectedUserId = null;
}

/**
 * 开通会员
 */
async function grantVip(userId) {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { error } = await client
            .from('profiles')
            .update({ 
                is_vip: true,
                vip_expire_at: null // 永久会员
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        showToast('会员开通成功');
        closeUserDetailModal();
        loadUsers();
        
    } catch (error) {
        console.error('Grant VIP error:', error);
        showToast('开通会员失败');
    }
}

/**
 * 取消会员
 */
async function revokeVip(userId) {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { error } = await client
            .from('profiles')
            .update({ 
                is_vip: false,
                vip_expire_at: null
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        showToast('会员已取消');
        closeUserDetailModal();
        loadUsers();
        
    } catch (error) {
        console.error('Revoke VIP error:', error);
        showToast('取消会员失败');
    }
}

/**
 * 确认删除用户
 */
function confirmDeleteUser(userId, userName) {
    selectedUserId = userId;
    confirmCallback = executeDeleteUser;
    
    const iconEl = document.getElementById('confirmIcon');
    const titleEl = document.getElementById('confirmTitle');
    const descEl = document.getElementById('confirmDesc');
    const btnEl = document.getElementById('confirmBtn');
    
    if (iconEl) iconEl.className = 'confirm-icon danger';
    if (iconEl) iconEl.innerHTML = '<i class="fas fa-trash-alt"></i>';
    if (titleEl) titleEl.textContent = '确认删除用户';
    if (descEl) descEl.textContent = `确定要删除用户 "${userName}" 吗？此操作不可恢复。`;
    if (btnEl) btnEl.className = 'confirm-btn danger';
    
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.add('active');
}

/**
 * 执行删除用户
 */
async function executeDeleteUser() {
    if (!selectedUserId) return;
    
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        const { error } = await client
            .from('profiles')
            .delete()
            .eq('id', selectedUserId);
        
        if (error) throw error;
        
        showToast('用户已删除');
        closeConfirmModal();
        closeUserDetailModal();
        loadUsers();
        
    } catch (error) {
        console.error('Delete user error:', error);
        showToast('删除用户失败');
    }
}

// ==================== 内容管理功能 ====================

/**
 * 切换标签
 */
function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;
    
    // 更新标签样式
    document.querySelectorAll('.tab').forEach(el => {
        el.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // 更新标题
    const titleMap = {
        'posts': { icon: 'fa-file-alt', text: '帖子列表' },
        'comments': { icon: 'fa-comments', text: '评论列表' },
        'resources': { icon: 'fa-folder-open', text: '资源列表' }
    };
    
    const titleInfo = titleMap[tab];
    const listTitle = document.getElementById('listTitle');
    if (listTitle && titleInfo) {
        listTitle.innerHTML = `<i class="fas ${titleInfo.icon}"></i> ${titleInfo.text}`;
    }
    
    loadContent(tab);
}

/**
 * 加载内容
 */
async function loadContent(type, append = false) {
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        let query;
        
        if (type === 'posts') {
            query = client
                .from('posts')
                .select(`
                    *,
                    author:profiles(name, user_type)
                `)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .range((currentPage - 1) * 10, currentPage * 10 - 1);
        } else if (type === 'comments') {
            query = client
                .from('comments')
                .select(`
                    *,
                    author:profiles(name, user_type),
                    post:posts(title)
                `)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .range((currentPage - 1) * 10, currentPage * 10 - 1);
        } else if (type === 'resources') {
            query = client
                .from('resources')
                .select(`
                    *,
                    uploader:profiles(name, user_type)
                `)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .range((currentPage - 1) * 10, currentPage * 10 - 1);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        renderContent(data, type, append);
        updateContentCount(data?.length || 0);
        
    } catch (error) {
        console.error('Load content error:', error);
        showToast('加载内容失败');
    }
}

/**
 * 渲染内容列表
 */
function renderContent(items, type, append = false) {
    const listEl = document.getElementById('contentList');
    if (!listEl) return;
    
    if (!append) {
        listEl.innerHTML = '';
    }
    
    if (!items || items.length === 0) {
        if (!append) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <div class="empty-title">暂无内容</div>
                </div>
            `;
        }
        return;
    }
    
    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'content-item';
        
        if (type === 'posts') {
            el.innerHTML = `
                <div class="content-header">
                    <div class="content-author">
                        ${item.author?.name?.charAt(0) || '?'}
                    </div>
                    <div class="content-info">
                        <div class="content-title">${escapeHtml(item.title)}</div>
                        <div class="content-meta">
                            <span>${escapeHtml(item.author?.name || '未知用户')}</span>
                            <span>${formatTime(item.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="content-preview">${escapeHtml(item.content)}</div>
                <div class="content-footer">
                    <div class="content-stats">
                        <span><i class="fas fa-heart"></i> ${item.likes_count || 0}</span>
                        <span><i class="fas fa-comment"></i> ${item.comments_count || 0}</span>
                    </div>
                    <div class="content-actions">
                        <button class="action-btn-small view" onclick="viewContent('${item.id}', 'post')">
                            <i class="fas fa-eye"></i> 查看
                        </button>
                        <button class="action-btn-small delete" onclick="confirmDeleteContent('${item.id}', 'post')">
                            <i class="fas fa-trash-alt"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'comments') {
            el.innerHTML = `
                <div class="content-header">
                    <div class="content-author">
                        ${item.author?.name?.charAt(0) || '?'}
                    </div>
                    <div class="content-info">
                        <div class="content-title">评论：${escapeHtml(item.post?.title || '未知帖子')}</div>
                        <div class="content-meta">
                            <span>${escapeHtml(item.author?.name || '未知用户')}</span>
                            <span>${formatTime(item.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="content-preview">${escapeHtml(item.content)}</div>
                <div class="content-footer">
                    <div class="content-actions">
                        <button class="action-btn-small delete" onclick="confirmDeleteContent('${item.id}', 'comment')">
                            <i class="fas fa-trash-alt"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'resources') {
            el.innerHTML = `
                <div class="content-header">
                    <div class="content-author">
                        ${item.uploader?.name?.charAt(0) || '?'}
                    </div>
                    <div class="content-info">
                        <div class="content-title">${escapeHtml(item.title)}</div>
                        <div class="content-meta">
                            <span>${escapeHtml(item.uploader?.name || '未知用户')}</span>
                            <span>${formatTime(item.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="content-preview">${escapeHtml(item.description || '无描述')}</div>
                <div class="content-footer">
                    <div class="content-stats">
                        <span><i class="fas fa-download"></i> ${item.download_count || 0}</span>
                    </div>
                    <div class="content-actions">
                        <button class="action-btn-small view" onclick="window.open('${item.file_url}', '_blank')">
                            <i class="fas fa-download"></i> 下载
                        </button>
                        <button class="action-btn-small delete" onclick="confirmDeleteContent('${item.id}', 'resource')">
                            <i class="fas fa-trash-alt"></i> 删除
                        </button>
                    </div>
                </div>
            `;
        }
        
        listEl.appendChild(el);
    });
}

/**
 * 更新内容数量
 */
function updateContentCount(count) {
    const countEl = document.getElementById('contentCount');
    if (countEl) {
        countEl.textContent = `共 ${count} 条`;
    }
}

/**
 * 查看内容详情
 */
async function viewContent(id, type) {
    selectedContentId = id;
    
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        let data;
        
        if (type === 'post') {
            const { data: post, error } = await client
                .from('posts')
                .select(`
                    *,
                    author:profiles(name, user_type)
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            data = post;
        }
        
        renderDetailContent(data, type);
        
        const modal = document.getElementById('detailModal');
        if (modal) modal.classList.add('active');
        
    } catch (error) {
        console.error('View content error:', error);
        showToast('加载详情失败');
    }
}

/**
 * 渲染详情内容
 */
function renderDetailContent(data, type) {
    const contentEl = document.getElementById('detailContent');
    if (!contentEl) return;
    
    if (type === 'post') {
        contentEl.innerHTML = `
            <div class="detail-content">
                <div class="detail-header">
                    <div class="detail-avatar">
                        ${data.author?.name?.charAt(0) || '?'}
                    </div>
                    <div class="detail-author-info">
                        <h4>${escapeHtml(data.author?.name || '未知用户')}</h4>
                        <p>${formatTime(data.created_at)}</p>
                    </div>
                </div>
                <h3 style="margin-bottom: 12px; color: var(--text-primary);">${escapeHtml(data.title)}</h3>
                <div class="detail-body">${escapeHtml(data.content)}</div>
                <div class="detail-images">
                    ${(data.images || []).map(() => `
                        <div class="detail-image"><i class="fas fa-image"></i></div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

/**
 * 关闭详情弹窗
 */
function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
    selectedContentId = null;
}

/**
 * 确认删除内容
 */
function confirmDeleteContent(id, type) {
    selectedContentId = id;
    confirmCallback = () => executeDeleteContent(type);
    
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.add('active');
}

/**
 * 执行删除内容
 */
async function executeDeleteContent(type) {
    if (!selectedContentId) return;
    
    try {
        const client = getSupabaseClient();
        if (!client) return;
        
        let table;
        switch (type) {
            case 'post': table = 'posts'; break;
            case 'comment': table = 'comments'; break;
            case 'resource': table = 'resources'; break;
            default: return;
        }
        
        const { error } = await client
            .from(table)
            .update({ is_deleted: true })
            .eq('id', selectedContentId);
        
        if (error) throw error;
        
        showToast('内容已删除');
        closeConfirmModal();
        loadContent(currentTab);
        
    } catch (error) {
        console.error('Delete content error:', error);
        showToast('删除失败');
    }
}

/**
 * 关闭确认弹窗
 */
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
}

/**
 * 执行确认操作
 */
function executeConfirm() {
    if (confirmCallback) {
        confirmCallback();
    }
}

// ==================== 通用工具函数 ====================

/**
 * HTML转义
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
}

/**
 * 显示Toast提示
 */
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
};
