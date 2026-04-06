/**
 * ========================================
 * 广东北江中学校园网 - 公共工具函数
 * ========================================
 */

/**
 * 显示 Toast 提示
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型: success, error, info
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * 本地存储封装
 */
const Storage = {
    /**
     * 设置本地存储
     * @param {string} key - 键名
     * @param {*} value - 值
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage set error:', e);
        }
    },

    /**
     * 获取本地存储
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {*}
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    /**
     * 移除本地存储
     * @param {string} key - 键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage remove error:', e);
        }
    },

    /**
     * 清空本地存储
     */
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Storage clear error:', e);
        }
    }
};

/**
 * 会话存储封装
 */
const SessionStorage = {
    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('SessionStorage set error:', e);
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('SessionStorage get error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.error('SessionStorage remove error:', e);
        }
    },

    clear() {
        try {
            sessionStorage.clear();
        } catch (e) {
            console.error('SessionStorage clear error:', e);
        }
    }
};

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式模板
 * @returns {string}
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 获取相对时间描述
 * @param {Date|string|number} date - 日期
 * @returns {string}
 */
function getRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;

    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else if (diff < week) {
        return Math.floor(diff / day) + '天前';
    } else if (diff < month) {
        return Math.floor(diff / week) + '周前';
    } else {
        return formatDate(date, 'YYYY-MM-DD');
    }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间(毫秒)
 * @returns {Function}
 */
function debounce(func, wait = 300) {
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

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间(毫秒)
 * @returns {Function}
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
function isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证学号/工号
 * @param {string} id - 学号或工号
 * @returns {boolean}
 */
function isValidSchoolId(id) {
    return /^\d{6,12}$/.test(id);
}

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string}
 */
function generateId(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (err) {
            document.body.removeChild(textarea);
            console.error('Copy failed:', err);
            return false;
        }
    }
}

/**
 * 截断文本
 * @param {string} text - 原文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string}
 */
function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
}

/**
 * 转义HTML特殊字符
 * @param {string} text - 原文本
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 检测设备类型
 * @returns {Object}
 */
function detectDevice() {
    const ua = navigator.userAgent;
    return {
        isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(ua),
        isIOS: /iPhone|iPad|iPod/i.test(ua),
        isAndroid: /Android/i.test(ua),
        isWeChat: /MicroMessenger/i.test(ua),
        isQQ: /QQ/i.test(ua)
    };
}

/**
 * 页面可见性检测
 * @param {Function} onVisible - 页面可见时回调
 * @param {Function} onHidden - 页面隐藏时回调
 */
function onVisibilityChange(onVisible, onHidden) {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            onHidden && onHidden();
        } else {
            onVisible && onVisible();
        }
    });
}

/**
 * 网络状态检测
 * @param {Function} onOnline - 在线时回调
 * @param {Function} onOffline - 离线时回调
 */
function onNetworkChange(onOnline, onOffline) {
    window.addEventListener('online', () => onOnline && onOnline());
    window.addEventListener('offline', () => onOffline && onOffline());
}

/**
 * 平滑滚动到指定元素
 * @param {string|Element} target - 目标元素或选择器
 * @param {number} offset - 偏移量
 */
function scrollToElement(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

/**
 * 图片懒加载
 * @param {string} selector - 图片选择器
 */
function lazyLoadImages(selector = 'img[data-src]') {
    const images = document.querySelectorAll(selector);
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // 降级方案
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * 表单验证
 * @param {HTMLFormElement} form - 表单元素
 * @param {Object} rules - 验证规则
 * @returns {Object}
 */
function validateForm(form, rules) {
    const errors = {};
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];

        if (rule.required && !value) {
            errors[field] = rule.message || `${field}不能为空`;
            continue;
        }

        if (value && rule.minLength && value.length < rule.minLength) {
            errors[field] = rule.message || `${field}长度不能少于${rule.minLength}个字符`;
            continue;
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors[field] = rule.message || `${field}长度不能超过${rule.maxLength}个字符`;
            continue;
        }

        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.message || `${field}格式不正确`;
            continue;
        }

        if (value && rule.validator && typeof rule.validator === 'function') {
            const result = rule.validator(value);
            if (result !== true) {
                errors[field] = result || rule.message || `${field}验证失败`;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        data
    };
}

/**
 * 安全地解析JSON
 * @param {string} json - JSON字符串
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
function safeJsonParse(json, defaultValue = null) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return defaultValue;
    }
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null}
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * 设置URL参数
 * @param {Object} params - 参数对象
 * @param {boolean} replace - 是否替换当前历史记录
 */
function setUrlParams(params, replace = false) {
    const url = new URL(window.location.href);
    
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    }

    if (replace) {
        window.history.replaceState({}, '', url);
    } else {
        window.history.pushState({}, '', url);
    }
}

// 导出（如果支持模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        Storage,
        SessionStorage,
        formatDate,
        getRelativeTime,
        debounce,
        throttle,
        isValidPhone,
        isValidEmail,
        isValidSchoolId,
        generateId,
        copyToClipboard,
        truncateText,
        escapeHtml,
        detectDevice,
        onVisibilityChange,
        onNetworkChange,
        scrollToElement,
        lazyLoadImages,
        validateForm,
        safeJsonParse,
        downloadFile,
        getUrlParam,
        setUrlParams
    };
}
