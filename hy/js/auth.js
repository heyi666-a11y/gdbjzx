/**
 * ========================================
 * 广东北江中学校园网 - 认证相关函数
 * ========================================
 */

/**
 * 认证模块
 */
const Auth = {
    // 当前用户信息
    currentUser: null,
    
    // 存储键名
    STORAGE_KEY: 'campus_network_user',
    TOKEN_KEY: 'campus_network_token',
    
    /**
     * 初始化认证状态
     */
    init() {
        // 从本地存储恢复会话
        const savedUser = Storage.get(this.STORAGE_KEY);
        const savedToken = Storage.get(this.TOKEN_KEY);
        
        if (savedUser && savedToken) {
            this.currentUser = savedUser;
            // 验证token是否有效
            this.validateSession();
        }
    },
    
    /**
     * 用户登录
     * @param {string} username - 学号/工号
     * @param {string} password - 密码
     * @param {boolean} rememberMe - 是否记住登录状态
     * @returns {Promise<Object>}
     */
    async login(username, password, rememberMe = false) {
        try {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: '系统初始化失败' };
            }
            
            // 验证输入
            if (!username || !password) {
                return { success: false, message: '请输入学号/工号和密码' };
            }
            
            // 查询用户
            const { data: user, error } = await client
                .from(DB_TABLES.USERS)
                .select('*')
                .eq('username', username)
                .single();
            
            if (error || !user) {
                return { success: false, message: '用户名或密码错误' };
            }
            
            // 验证密码（实际项目中应该使用加密比较）
            // 这里简化处理，实际应该使用 bcrypt 等库
            const isPasswordValid = await this.verifyPassword(password, user.password);
            
            if (!isPasswordValid) {
                return { success: false, message: '用户名或密码错误' };
            }
            
            // 检查用户状态
            if (user.status === 'disabled') {
                return { success: false, message: '账号已被禁用，请联系管理员' };
            }
            
            if (user.status === 'pending') {
                return { success: false, message: '账号待审核，请耐心等待' };
            }
            
            // 生成会话token
            const token = this.generateToken(user);
            
            // 保存用户信息（不包含密码）
            const userInfo = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                class_id: user.class_id,
                department: user.department
            };
            
            this.currentUser = userInfo;
            
            // 根据rememberMe选择存储方式
            if (rememberMe) {
                Storage.set(this.STORAGE_KEY, userInfo);
                Storage.set(this.TOKEN_KEY, token);
            } else {
                SessionStorage.set(this.STORAGE_KEY, userInfo);
                SessionStorage.set(this.TOKEN_KEY, token);
            }
            
            // 更新最后登录时间
            await client
                .from(DB_TABLES.USERS)
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);
            
            return {
                success: true,
                message: '登录成功',
                user: userInfo
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: '登录失败，请稍后重试' };
        }
    },
    
    /**
     * 访客登录
     * @returns {Promise<Object>}
     */
    async guestLogin() {
        try {
            const guestUser = {
                id: 'guest_' + generateId(8),
                username: 'guest',
                name: '访客用户',
                role: 'guest',
                avatar: null,
                isGuest: true
            };
            
            this.currentUser = guestUser;
            SessionStorage.set(this.STORAGE_KEY, guestUser);
            SessionStorage.set(this.TOKEN_KEY, 'guest_token');
            
            return {
                success: true,
                message: '访客登录成功',
                user: guestUser
            };
            
        } catch (error) {
            console.error('Guest login error:', error);
            return { success: false, message: '访客登录失败' };
        }
    },
    
    /**
     * 用户注册
     * @param {Object} userData - 用户数据
     * @returns {Promise<Object>}
     */
    async register(userData) {
        try {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: '系统初始化失败' };
            }
            
            // 检查用户名是否已存在
            const { data: existingUser } = await client
                .from(DB_TABLES.USERS)
                .select('id')
                .eq('username', userData.username)
                .single();
            
            if (existingUser) {
                return { success: false, message: '该学号/工号已被注册' };
            }
            
            // 加密密码
            const hashedPassword = await this.hashPassword(userData.password);
            
            // 创建用户
            const { data: newUser, error } = await client
                .from(DB_TABLES.USERS)
                .insert([{
                    username: userData.username,
                    password: hashedPassword,
                    name: userData.name,
                    role: userData.role || 'student',
                    status: 'pending', // 默认待审核
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) {
                console.error('Register error:', error);
                return { success: false, message: '注册失败，请稍后重试' };
            }
            
            return {
                success: true,
                message: '注册成功，请等待管理员审核',
                user: newUser
            };
            
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: '注册失败，请稍后重试' };
        }
    },
    
    /**
     * 用户登出
     */
    logout() {
        this.currentUser = null;
        Storage.remove(this.STORAGE_KEY);
        Storage.remove(this.TOKEN_KEY);
        SessionStorage.remove(this.STORAGE_KEY);
        SessionStorage.remove(this.TOKEN_KEY);
        
        // 跳转到登录页
        window.location.href = '../index.html';
    },
    
    /**
     * 获取当前用户
     * @returns {Object|null}
     */
    getCurrentUser() {
        if (!this.currentUser) {
            this.currentUser = Storage.get(this.STORAGE_KEY) || SessionStorage.get(this.STORAGE_KEY);
        }
        return this.currentUser;
    },
    
    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!this.getCurrentUser();
    },
    
    /**
     * 检查是否是访客
     * @returns {boolean}
     */
    isGuest() {
        const user = this.getCurrentUser();
        return user && user.isGuest === true;
    },
    
    /**
     * 检查是否是管理员
     * @returns {boolean}
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'super_admin');
    },
    
    /**
     * 检查是否是教师
     * @returns {boolean}
     */
    isTeacher() {
        const user = this.getCurrentUser();
        return user && user.role === 'teacher';
    },
    
    /**
     * 检查是否是学生
     * @returns {boolean}
     */
    isStudent() {
        const user = this.getCurrentUser();
        return user && user.role === 'student';
    },
    
    /**
     * 验证会话是否有效
     * @returns {Promise<boolean>}
     */
    async validateSession() {
        try {
            const token = Storage.get(this.TOKEN_KEY) || SessionStorage.get(this.TOKEN_KEY);
            if (!token) return false;
            
            // 简单验证token格式
            if (!this.verifyToken(token)) {
                this.logout();
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    },
    
    /**
     * 修改密码
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Promise<Object>}
     */
    async changePassword(oldPassword, newPassword) {
        try {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: '系统初始化失败' };
            }
            
            const user = this.getCurrentUser();
            if (!user) {
                return { success: false, message: '用户未登录' };
            }
            
            // 获取用户完整信息
            const { data: userData } = await client
                .from(DB_TABLES.USERS)
                .select('password')
                .eq('id', user.id)
                .single();
            
            // 验证旧密码
            const isOldPasswordValid = await this.verifyPassword(oldPassword, userData.password);
            if (!isOldPasswordValid) {
                return { success: false, message: '原密码错误' };
            }
            
            // 加密新密码
            const hashedNewPassword = await this.hashPassword(newPassword);
            
            // 更新密码
            const { error } = await client
                .from(DB_TABLES.USERS)
                .update({ password: hashedNewPassword })
                .eq('id', user.id);
            
            if (error) {
                return { success: false, message: '密码修改失败' };
            }
            
            return { success: true, message: '密码修改成功' };
            
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: '密码修改失败' };
        }
    },
    
    /**
     * 更新用户信息
     * @param {Object} updates - 更新的字段
     * @returns {Promise<Object>}
     */
    async updateProfile(updates) {
        try {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: '系统初始化失败' };
            }
            
            const user = this.getCurrentUser();
            if (!user) {
                return { success: false, message: '用户未登录' };
            }
            
            // 不允许更新的字段
            const protectedFields = ['id', 'username', 'role', 'status', 'password'];
            const safeUpdates = {};
            
            for (const [key, value] of Object.entries(updates)) {
                if (!protectedFields.includes(key)) {
                    safeUpdates[key] = value;
                }
            }
            
            const { data, error } = await client
                .from(DB_TABLES.USERS)
                .update(safeUpdates)
                .eq('id', user.id)
                .select()
                .single();
            
            if (error) {
                return { success: false, message: '更新失败' };
            }
            
            // 更新本地存储
            const updatedUser = { ...user, ...safeUpdates };
            this.currentUser = updatedUser;
            
            if (Storage.get(this.STORAGE_KEY)) {
                Storage.set(this.STORAGE_KEY, updatedUser);
            } else {
                SessionStorage.set(this.STORAGE_KEY, updatedUser);
            }
            
            return { success: true, message: '更新成功', user: updatedUser };
            
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: '更新失败' };
        }
    },
    
    /**
     * 生成Token
     * @param {Object} user - 用户信息
     * @returns {string}
     */
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7天过期
        };
        return btoa(JSON.stringify(payload));
    },
    
    /**
     * 验证Token
     * @param {string} token - Token字符串
     * @returns {boolean}
     */
    verifyToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            return payload.exp > Date.now();
        } catch (error) {
            return false;
        }
    },
    
    /**
     * 密码加密（简化版，实际应使用bcrypt等）
     * @param {string} password - 明文密码
     * @returns {Promise<string>}
     */
    async hashPassword(password) {
        // 实际项目中应该使用 bcrypt 或 argon2
        // 这里使用简单的 base64 + salt 作为示例
        const salt = 'beijiang_school_2025';
        const saltedPassword = password + salt;
        
        // 使用 Web Crypto API 进行 SHA-256 哈希
        const encoder = new TextEncoder();
        const data = encoder.encode(saltedPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    },
    
    /**
     * 验证密码
     * @param {string} password - 明文密码
     * @param {string} hashedPassword - 加密后的密码
     * @returns {Promise<boolean>}
     */
    async verifyPassword(password, hashedPassword) {
        const hash = await this.hashPassword(password);
        return hash === hashedPassword;
    },
    
    /**
     * 请求密码重置
     * @param {string} username - 学号/工号
     * @returns {Promise<Object>}
     */
    async requestPasswordReset(username) {
        try {
            const client = getSupabaseClient();
            if (!client) {
                return { success: false, message: '系统初始化失败' };
            }
            
            // 查询用户
            const { data: user } = await client
                .from(DB_TABLES.USERS)
                .select('id, email')
                .eq('username', username)
                .single();
            
            if (!user) {
                return { success: false, message: '用户不存在' };
            }
            
            // 生成重置token
            const resetToken = generateId(32);
            const resetExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30分钟有效
            
            // 保存重置token
            await client
                .from(DB_TABLES.USERS)
                .update({
                    reset_token: resetToken,
                    reset_expires: resetExpires
                })
                .eq('id', user.id);
            
            // 实际项目中应该发送邮件
            // 这里仅作演示
            console.log('Password reset token:', resetToken);
            
            return {
                success: true,
                message: '密码重置链接已发送到您的邮箱'
            };
            
        } catch (error) {
            console.error('Password reset request error:', error);
            return { success: false, message: '请求失败' };
        }
    },
    
    /**
     * 权限检查
     * @param {string|Array} requiredRoles - 所需角色
     * @returns {boolean}
     */
    hasRole(requiredRoles) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (typeof requiredRoles === 'string') {
            requiredRoles = [requiredRoles];
        }
        
        return requiredRoles.includes(user.role);
    },
    
    /**
     * 页面权限守卫
     * @param {string|Array} requiredRoles - 所需角色
     */
    guard(requiredRoles) {
        if (!this.isLoggedIn()) {
            showToast('请先登录', 'error');
            window.location.href = '../index.html';
            return false;
        }
        
        if (requiredRoles && !this.hasRole(requiredRoles)) {
            showToast('权限不足', 'error');
            window.history.back();
            return false;
        }
        
        return true;
    }
};

// 页面加载时初始化认证状态
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// 导出（如果支持模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Auth };
}
