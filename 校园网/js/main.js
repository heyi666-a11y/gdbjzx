// 广东北江中学校园网 - 主应用逻辑
// Supabase 配置
const SUPABASE_URL = 'https://verskaemxqoukhnlwnbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gtr_WIuZKiChZwJz8mR6pw_mk_SAYlG';

// 初始化 Supabase 客户端
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase 初始化成功');
} catch (error) {
    console.error('Supabase 初始化失败:', error);
}

// 当前用户信息（模拟数据，实际应从登录状态获取）
let currentUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: '游客用户',
    avatar: null,
    isVip: false,
    className: '高一(1)班',
    postsToday: 0,
    lastPostDate: null
};

// 从本地存储加载用户信息
function loadUserFromStorage() {
    const savedUser = localStorage.getItem('beijiang_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// 保存用户到本地存储
function saveUserToStorage() {
    localStorage.setItem('beijiang_user', JSON.stringify(currentUser));
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromStorage();
    checkDailyPostLimit();
    console.log('广东北江中学校园网已加载');
});

// 检查每日发帖限制
function checkDailyPostLimit() {
    const today = new Date().toDateString();
    if (currentUser.lastPostDate !== today) {
        currentUser.postsToday = 0;
        currentUser.lastPostDate = today;
        saveUserToStorage();
    }
}

// 显示加载动画
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

// 隐藏加载动画
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Toast 提示
function showToast(message, duration = 2000) {
    // 移除已存在的 toast
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
    }, duration);
}

// 格式化时间
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    }
    // 小于24小时
    if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    }
    // 小于7天
    if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前';
    }
    // 大于7天显示日期
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 格式化数字
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// 获取分类名称
function getCategoryName(category) {
    const categoryMap = {
        'all': '全部',
        'study': '学习交流',
        'life': '校园生活',
        'activity': '活动通知',
        'help': '求助问答',
        'fun': '闲聊灌水'
    };
    return categoryMap[category] || '其他';
}

// 获取分类图标
function getCategoryIcon(category) {
    const iconMap = {
        'study': '📚',
        'life': '🏫',
        'activity': '🎉',
        'help': '❓',
        'fun': '💬'
    };
    return iconMap[category] || '📝';
}

// 生成用户头像文字
function getAvatarText(name) {
    if (!name) return '?';
    // 取名字最后一个字
    return name.slice(-1);
}

// 生成随机颜色（用于头像背景）
function getAvatarColor(userId) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    // 根据用户ID选择固定颜色
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// 底部导航切换
function switchTab(page) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`[data-page="${page}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }

    // 页面跳转
    switch(page) {
        case 'tieba':
            if (!window.location.href.includes('tieba.html')) {
                window.location.href = 'tieba.html';
            }
            break;
        case 'channel':
            showToast('频道功能开发中...');
            break;
        case 'message':
            showToast('消息功能开发中...');
            break;
        case 'profile':
            showToast('我的页面开发中...');
            break;
        case 'home':
            if (!window.location.href.includes('home.html')) {
                window.location.href = 'home.html';
            }
            break;
    }
}

// 返回上一页
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'home.html';
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 模拟API请求（用于演示，实际应使用Supabase）
async function mockApiRequest(data, delay = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, data });
        }, delay);
    });
}

// 检查网络状态
function checkNetworkStatus() {
    if (!navigator.onLine) {
        showToast('网络连接已断开，请检查网络设置');
        return false;
    }
    return true;
}

// 监听网络状态变化
window.addEventListener('online', () => {
    showToast('网络已连接');
});

window.addEventListener('offline', () => {
    showToast('网络已断开');
});

// 图片懒加载
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// 导出全局函数和变量
window.app = {
    supabase,
    currentUser,
    showLoading,
    hideLoading,
    showToast,
    formatTime,
    formatNumber,
    getCategoryName,
    getCategoryIcon,
    getAvatarText,
    getAvatarColor,
    switchTab,
    goBack,
    debounce,
    throttle,
    mockApiRequest,
    checkNetworkStatus,
    lazyLoadImages,
    checkDailyPostLimit,
    saveUserToStorage
};

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkDailyPostLimit();
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise错误:', e.reason);
});
