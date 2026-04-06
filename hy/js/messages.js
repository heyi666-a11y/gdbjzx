/**
 * ========================================
 * 广东北江中学校园网 - 消息功能模块
 * ========================================
 */

const Messages = {
    // 当前用户
    currentUser: null,
    
    // 当前聊天对象
    currentChat: null,
    
    // 联系人列表
    contacts: [],
    
    // 消息缓存
    messagesCache: {},
    
    // 是否会员
    isVip: false,
    
    /**
     * 初始化消息模块
     */
    init() {
        // 获取当前用户
        this.currentUser = Auth.getCurrentUser();
        
        // 检查登录状态
        if (!this.currentUser) {
            window.location.href = '../index.html';
            return;
        }
        
        // 检查会员状态
        this.isVip = this.currentUser.is_vip || false;
        
        // 加载联系人列表
        this.loadContacts();
        
        // 设置实时消息订阅
        this.setupRealtimeSubscription();
        
        // 检查URL参数
        this.checkUrlParams();
    },
    
    /**
     * 加载联系人列表
     */
    async loadContacts() {
        try {
            const client = getSupabaseClient();
            if (!client) {
                this.loadMockContacts();
                return;
            }
            
            // 获取私聊联系人
            const { data: privateContacts, error: privateError } = await client
                .from('conversations')
                .select(`
                    *,
                    other_user:users(id, name, role, avatar, is_vip, last_seen)
                `)
                .eq('user_id', this.currentUser.id)
                .order('last_message_at', { ascending: false });
            
            if (privateError) throw privateError;
            
            // 获取群聊
            const { data: groups, error: groupsError } = await client
                .from('group_members')
                .select(`
                    group:groups(id, name, avatar, member_count)
                `)
                .eq('user_id', this.currentUser.id);
            
            if (groupsError) throw groupsError;
            
            // 处理数据
            this.contacts = [
                // 管理员始终排第一
                {
                    id: 'admin',
                    name: '管理员',
                    type: 'admin',
                    avatar: null,
                    is_admin: true,
                    last_message: '有问题随时联系我~',
                    last_message_time: new Date().toISOString(),
                    unread_count: 1
                },
                ...(privateContacts || []).map(c => ({
                    id: c.other_user.id,
                    name: c.other_user.name,
                    type: 'private',
                    avatar: c.other_user.avatar,
                    is_vip: c.other_user.is_vip,
                    role: c.other_user.role,
                    last_message: c.last_message,
                    last_message_time: c.last_message_at,
                    unread_count: c.unread_count || 0
                })),
                ...(groups || []).map(g => ({
                    id: g.group.id,
                    name: g.group.name,
                    type: 'group',
                    avatar: g.group.avatar,
                    member_count: g.group.member_count,
                    last_message: '',
                    last_message_time: null,
                    unread_count: 0
                }))
            ];
            
            this.renderContacts();
            
        } catch (error) {
            console.error('Load contacts error:', error);
            this.loadMockContacts();
        }
    },
    
    /**
     * 加载模拟联系人数据
     */
    loadMockContacts() {
        this.contacts = [
            {
                id: 'admin',
                name: '管理员',
                type: 'admin',
                avatar: null,
                is_admin: true,
                last_message: '有问题随时联系我~',
                last_message_time: new Date().toISOString(),
                unread_count: 1
            },
            {
                id: 'user1',
                name: '李老师',
                type: 'private',
                avatar: null,
                role: 'teacher',
                is_vip: false,
                last_message: '明天记得交作业',
                last_message_time: new Date(Date.now() - 3600000).toISOString(),
                unread_count: 0
            },
            {
                id: 'user2',
                name: '王小明',
                type: 'private',
                avatar: null,
                role: 'student',
                is_vip: true,
                last_message: '一起打球吗？',
                last_message_time: new Date(Date.now() - 7200000).toISOString(),
                unread_count: 2
            },
            {
                id: 'user3',
                name: '张同学',
                type: 'private',
                avatar: null,
                role: 'student',
                is_vip: false,
                last_message: '谢谢！',
                last_message_time: new Date(Date.now() - 86400000).toISOString(),
                unread_count: 0
            }
        ];
        
        this.renderContacts();
    },
    
    /**
     * 渲染联系人列表
     */
    renderContacts() {
        const container = document.getElementById('privateList');
        if (!container) return;
        
        // 保留管理员（第一个），替换其他联系人
        const adminHtml = container.querySelector('.contact-item');
        
        const contactsHtml = this.contacts.map(contact => this.createContactHTML(contact)).join('');
        
        container.innerHTML = contactsHtml;
    },
    
    /**
     * 创建联系人HTML
     */
    createContactHTML(contact) {
        const time = this.formatTime(contact.last_message_time);
        const avatarClass = contact.type === 'admin' ? 'admin' : (contact.type === 'group' ? 'group' : '');
        const icon = contact.type === 'admin' ? 'user-shield' : (contact.type === 'group' ? 'users' : 'user');
        const badge = contact.type === 'admin' ? '<span class="contact-badge admin">官方</span>' : 
                      (contact.is_vip ? '<span class="contact-badge vip">VIP</span>' : '');
        
        return `
            <div class="contact-item" onclick="Messages.openChat('${contact.id}', '${contact.name}', '${contact.type}')">
                <div class="contact-avatar ${avatarClass}">
                    <i class="fas fa-${icon}"></i>
                    ${contact.type === 'admin' ? '<span class="online-status"></span>' : ''}
                </div>
                <div class="contact-info">
                    <div class="contact-name">
                        ${contact.name}
                        ${badge}
                    </div>
                    <div class="contact-preview">${this.escapeHtml(contact.last_message || '')}</div>
                </div>
                <div class="contact-meta">
                    <div class="contact-time">${time}</div>
                    ${contact.unread_count > 0 ? `<span class="unread-badge">${contact.unread_count}</span>` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * 打开聊天窗口
     */
    async openChat(userId, userName, type) {
        this.currentChat = { id: userId, name: userName, type: type };
        
        // 更新UI
        document.getElementById('chatUserName').textContent = userName;
        document.getElementById('chatContainer').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 加载聊天记录
        await this.loadMessages(userId, type);
        
        // 标记消息已读
        this.markAsRead(userId);
    },
    
    /**
     * 关闭聊天窗口
     */
    closeChat() {
        document.getElementById('chatContainer').classList.remove('active');
        document.body.style.overflow = '';
        this.currentChat = null;
    },
    
    /**
     * 加载聊天记录
     */
    async loadMessages(chatId, type) {
        try {
            const client = getSupabaseClient();
            const container = document.getElementById('chatMessages');
            
            if (!client) {
                this.loadMockMessages(chatId);
                return;
            }
            
            let messages = [];
            
            if (type === 'group') {
                // 群聊消息
                const { data, error } = await client
                    .from('group_messages')
                    .select(`
                        *,
                        sender:users(id, name, avatar)
                    `)
                    .eq('group_id', chatId)
                    .order('created_at', { ascending: true })
                    .limit(50);
                
                if (error) throw error;
                messages = data || [];
            } else {
                // 私聊消息
                const { data, error } = await client
                    .from('private_messages')
                    .select(`
                        *,
                        sender:users(id, name, avatar)
                    `)
                    .or(`and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${this.currentUser.id})`)
                    .order('created_at', { ascending: true })
                    .limit(50);
                
                if (error) throw error;
                messages = data || [];
            }
            
            // 缓存消息
            this.messagesCache[chatId] = messages;
            
            // 渲染消息
            this.renderMessages(messages);
            
        } catch (error) {
            console.error('Load messages error:', error);
            this.loadMockMessages(chatId);
        }
    },
    
    /**
     * 加载模拟消息
     */
    loadMockMessages(chatId) {
        const mockMessages = {
            'admin': [
                { id: 1, content: '你好！有什么可以帮助你的吗？', sender_id: 'admin', created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, content: '我想了解一下会员怎么开通', sender_id: 'me', created_at: new Date(Date.now() - 3000000).toISOString() },
                { id: 3, content: '会员可以享受发送图片、文件等功能，你可以通过联系我来开通', sender_id: 'admin', created_at: new Date(Date.now() - 2400000).toISOString() }
            ],
            'user1': [
                { id: 4, content: '明天记得交作业', sender_id: 'user1', created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 5, content: '好的老师', sender_id: 'me', created_at: new Date(Date.now() - 3500000).toISOString() }
            ],
            'user2': [
                { id: 6, content: '一起打球吗？', sender_id: 'user2', created_at: new Date(Date.now() - 7200000).toISOString() },
                { id: 7, content: '好啊，几点？', sender_id: 'me', created_at: new Date(Date.now() - 7000000).toISOString() },
                { id: 8, content: '下午4点操场见', sender_id: 'user2', created_at: new Date(Date.now() - 6800000).toISOString() }
            ]
        };
        
        const messages = mockMessages[chatId] || [];
        this.messagesCache[chatId] = messages;
        this.renderMessages(messages);
    },
    
    /**
     * 渲染消息列表
     */
    renderMessages(messages) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        container.innerHTML = messages.map(msg => this.createMessageHTML(msg)).join('');
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
    },
    
    /**
     * 创建消息HTML
     */
    createMessageHTML(message) {
        const isSent = message.sender_id === this.currentUser.id || message.sender_id === 'me';
        const time = this.formatMessageTime(message.created_at);
        
        return `
            <div class="message-item ${isSent ? 'sent' : 'received'}">
                <div class="message-avatar">
                    <i class="fas fa-${isSent ? 'user' : 'user-shield'}"></i>
                </div>
                <div class="message-content">
                    <div>${this.escapeHtml(message.content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
    },
    
    /**
     * 发送消息
     */
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (!content || !this.currentChat) return;
        
        // 清空输入框
        input.value = '';
        
        // 创建临时消息
        const tempMessage = {
            id: Date.now(),
            content: content,
            sender_id: this.currentUser.id,
            created_at: new Date().toISOString()
        };
        
        // 添加到UI
        this.addMessageToUI(tempMessage);
        
        try {
            const client = getSupabaseClient();
            if (!client) return;
            
            if (this.currentChat.type === 'group') {
                await client
                    .from('group_messages')
                    .insert([{
                        group_id: this.currentChat.id,
                        sender_id: this.currentUser.id,
                        content: content,
                        created_at: new Date().toISOString()
                    }]);
            } else {
                await client
                    .from('private_messages')
                    .insert([{
                        sender_id: this.currentUser.id,
                        receiver_id: this.currentChat.id,
                        content: content,
                        created_at: new Date().toISOString()
                    }]);
            }
            
            // 更新会话最后消息
            await this.updateConversation(content);
            
        } catch (error) {
            console.error('Send message error:', error);
            showToast('发送失败，请重试');
        }
    },
    
    /**
     * 添加消息到UI
     */
    addMessageToUI(message) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        const messageHtml = this.createMessageHTML(message);
        container.insertAdjacentHTML('beforeend', messageHtml);
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
    },
    
    /**
     * 更新会话
     */
    async updateConversation(lastMessage) {
        try {
            const client = getSupabaseClient();
            if (!client) return;
            
            await client
                .from('conversations')
                .upsert({
                    user_id: this.currentUser.id,
                    other_user_id: this.currentChat.id,
                    last_message: lastMessage,
                    last_message_at: new Date().toISOString()
                });
                
        } catch (error) {
            console.error('Update conversation error:', error);
        }
    },
    
    /**
     * 标记消息已读
     */
    async markAsRead(chatId) {
        try {
            const client = getSupabaseClient();
            if (!client) return;
            
            // 更新未读数
            await client
                .from('conversations')
                .update({ unread_count: 0 })
                .eq('user_id', this.currentUser.id)
                .eq('other_user_id', chatId);
            
            // 更新本地数据
            const contact = this.contacts.find(c => c.id === chatId);
            if (contact) {
                contact.unread_count = 0;
                this.renderContacts();
            }
            
            // 更新总未读数
            this.updateTotalUnread();
            
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    },
    
    /**
     * 更新总未读数
     */
    updateTotalUnread() {
        const total = this.contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        const badge = document.getElementById('messageBadge');
        if (badge) {
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        }
    },
    
    /**
     * 设置实时订阅
     */
    setupRealtimeSubscription() {
        try {
            const client = getSupabaseClient();
            if (!client) return;
            
            // 订阅私聊消息
            client
                .channel('private_messages')
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'private_messages' },
                    (payload) => {
                        const msg = payload.new;
                        // 如果是当前聊天的消息
                        if (this.currentChat && 
                            (msg.sender_id === this.currentChat.id || msg.receiver_id === this.currentChat.id)) {
                            this.addMessageToUI(msg);
                        }
                        // 刷新联系人列表
                        this.loadContacts();
                    }
                )
                .subscribe();
                
        } catch (error) {
            console.error('Setup realtime error:', error);
        }
    },
    
    /**
     * 检查URL参数
     */
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const user = urlParams.get('user');
        if (user === 'admin') {
            setTimeout(() => this.openChat('admin', '管理员', 'admin'), 500);
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
        
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    },
    
    /**
     * 格式化消息时间
     */
    formatMessageTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
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
    Messages.init();
});
