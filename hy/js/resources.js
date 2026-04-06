/**
 * ========================================
 * 广东北江中学校园网 - 资源区功能
 * ========================================
 */

// 全局状态
let currentPage = 1;
let currentCategory = 'all';
let currentSort = 'newest';
let currentSearch = '';
let selectedFile = null;
let currentUser = null;
let isLoading = false;

// 文件类型映射
const FILE_TYPES = {
    pdf: { icon: 'fa-file-pdf', class: 'pdf' },
    doc: { icon: 'fa-file-word', class: 'doc' },
    docx: { icon: 'fa-file-word', class: 'doc' },
    xls: { icon: 'fa-file-excel', class: 'xls' },
    xlsx: { icon: 'fa-file-excel', class: 'xls' },
    ppt: { icon: 'fa-file-powerpoint', class: 'ppt' },
    pptx: { icon: 'fa-file-powerpoint', class: 'ppt' },
    jpg: { icon: 'fa-file-image', class: 'img' },
    jpeg: { icon: 'fa-file-image', class: 'img' },
    png: { icon: 'fa-file-image', class: 'img' },
    gif: { icon: 'fa-file-image', class: 'img' },
    mp4: { icon: 'fa-file-video', class: 'video' },
    mp3: { icon: 'fa-file-audio', class: 'audio' },
    zip: { icon: 'fa-file-archive', class: 'zip' },
    rar: { icon: 'fa-file-archive', class: 'zip' },
    '7z': { icon: 'fa-file-archive', class: 'zip' }
};

/**
 * 初始化页面
 */
document.addEventListener('DOMContentLoaded', async function() {
    // 检查用户登录状态
    await checkUserAuth();
    
    // 加载资源列表
    loadResources();
    
    // 初始化分类筛选
    initCategoryFilter();
    
    // 拖拽上传
    initDragAndDrop();
});

/**
 * 检查用户认证状态
 */
async function checkUserAuth() {
    const user = Auth.getCurrentUser();
    currentUser = user;
    
    // 更新上传按钮状态
    updateUploadButton();
}

/**
 * 更新上传按钮状态
 */
function updateUploadButton() {
    const uploadBtn = document.getElementById('uploadBtn');
    if (!uploadBtn) return;
    
    // 检查用户是否有上传权限
    // 教师、会员、管理员可以上传
    const canUpload = currentUser && (
        currentUser.role === 'teacher' || 
        currentUser.role === 'admin' ||
        currentUser.is_vip
    );
    
    if (!canUpload && currentUser) {
        uploadBtn.style.opacity = '0.5';
    }
}

/**
 * 检查是否可以上传
 */
function canUpload() {
    if (!currentUser) {
        showToast('请先登录');
        return false;
    }
    
    // 教师、会员、管理员可以上传
    if (currentUser.role === 'teacher' || 
        currentUser.role === 'admin' ||
        currentUser.is_vip) {
        return true;
    }
    
    // 普通学生显示VIP提示
    openVipModal();
    return false;
}

/**
 * 加载资源列表
 */
async function loadResources(append = false) {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const client = getSupabaseClient();
        if (!client) {
            showToast('系统初始化失败');
            return;
        }
        
        let query = client
            .from('resources')
            .select(`
                *,
                uploader:profiles(name, user_type)
            `)
            .eq('is_deleted', false)
            .order('created_at', { ascending: currentSort === 'oldest' })
            .range((currentPage - 1) * 10, currentPage * 10 - 1);
        
        // 分类筛选
        if (currentCategory !== 'all') {
            query = query.ilike('file_type', `%${currentCategory}%`);
        }
        
        // 搜索筛选
        if (currentSearch) {
            query = query.or(`title.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%`);
        }
        
        const { data: resources, error } = await query;
        
        if (error) {
            console.error('Load resources error:', error);
            showToast('加载资源失败');
            return;
        }
        
        renderResources(resources, append);
        updateResourceCount(resources?.length || 0);
        
    } catch (error) {
        console.error('Load resources error:', error);
        showToast('加载资源失败');
    } finally {
        isLoading = false;
    }
}

/**
 * 渲染资源列表
 */
function renderResources(resources, append = false) {
    const listEl = document.getElementById('resourceList');
    if (!listEl) return;
    
    if (!append) {
        listEl.innerHTML = '';
    }
    
    if (!resources || resources.length === 0) {
        if (!append) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <div class="empty-title">暂无资源</div>
                    <div class="empty-desc">成为第一个上传资源的人吧</div>
                </div>
            `;
        }
        return;
    }
    
    resources.forEach(resource => {
        const fileExt = resource.file_name?.split('.').pop().toLowerCase() || '';
        const fileType = FILE_TYPES[fileExt] || { icon: 'fa-file', class: 'default' };
        const fileSize = formatFileSize(resource.file_size);
        
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.innerHTML = `
            <div class="resource-header">
                <div class="file-icon ${fileType.class}">
                    <i class="fas ${fileType.icon}"></i>
                </div>
                <div class="resource-info">
                    <div class="resource-title">${escapeHtml(resource.title)}</div>
                    <div class="resource-meta">
                        <span><i class="fas fa-file"></i> ${fileExt.toUpperCase()}</span>
                        <span><i class="fas fa-hdd"></i> ${fileSize}</span>
                    </div>
                </div>
            </div>
            <div class="resource-footer">
                <div class="uploader-info">
                    <div class="uploader-avatar">
                        ${resource.uploader?.name?.charAt(0) || '?'}
                    </div>
                    <span class="uploader-name">${escapeHtml(resource.uploader?.name || '未知用户')}</span>
                </div>
                <div class="resource-stats">
                    <span><i class="fas fa-download"></i> ${resource.download_count || 0}</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(resource.created_at)}</span>
                </div>
            </div>
            <button class="download-btn" onclick="downloadResource('${resource.id}', '${resource.file_url}')">
                <i class="fas fa-download"></i> 下载
            </button>
        `;
        
        listEl.appendChild(item);
    });
}

/**
 * 更新资源数量显示
 */
function updateResourceCount(count) {
    const countEl = document.getElementById('resourcesCount');
    if (countEl) {
        countEl.textContent = `共 ${count} 个资源`;
    }
}

/**
 * 初始化分类筛选
 */
function initCategoryFilter() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    categoryList.addEventListener('click', function(e) {
        const item = e.target.closest('.category-item');
        if (!item) return;
        
        // 更新激活状态
        categoryList.querySelectorAll('.category-item').forEach(el => {
            el.classList.remove('active');
        });
        item.classList.add('active');
        
        // 更新当前分类并重载
        currentCategory = item.dataset.category;
        currentPage = 1;
        loadResources();
    });
}

/**
 * 搜索处理
 */
function handleSearch(value) {
    currentSearch = value.trim();
    currentPage = 1;
    
    // 显示/隐藏清除按钮
    const clearBtn = document.getElementById('searchClear');
    if (clearBtn) {
        clearBtn.classList.toggle('visible', value.length > 0);
    }
    
    // 延迟搜索，避免频繁请求
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        loadResources();
    }, 300);
}

/**
 * 清除搜索
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        handleSearch('');
    }
}

/**
 * 切换排序
 */
function toggleSort() {
    currentSort = currentSort === 'newest' ? 'oldest' : 'newest';
    const sortText = document.getElementById('sortText');
    if (sortText) {
        sortText.textContent = currentSort === 'newest' ? '最新上传' : '最早上传';
    }
    currentPage = 1;
    loadResources();
}

/**
 * 加载更多
 */
function loadMore() {
    currentPage++;
    loadResources(true);
}

/**
 * 打开上传弹窗
 */
function openUploadModal() {
    if (!canUpload()) return;
    
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * 关闭上传弹窗
 */
function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // 重置表单
    resetUploadForm();
}

/**
 * 重置上传表单
 */
function resetUploadForm() {
    selectedFile = null;
    const form = document.getElementById('uploadForm');
    if (form) form.reset();
    
    const filePreview = document.getElementById('filePreview');
    if (filePreview) filePreview.classList.add('hidden');
    
    const uploadArea = document.getElementById('fileUploadArea');
    if (uploadArea) uploadArea.classList.remove('has-file');
}

/**
 * 初始化拖拽上传
 */
function initDragAndDrop() {
    const uploadArea = document.getElementById('fileUploadArea');
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(102, 126, 234, 0.05)';
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });
    });
    
    uploadArea.addEventListener('drop', handleDrop);
}

/**
 * 处理文件拖放
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * 处理文件选择
 */
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
}

/**
 * 处理文件
 */
function handleFile(file) {
    // 检查文件大小（最大 50MB）
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('文件大小不能超过 50MB');
        return;
    }
    
    selectedFile = file;
    
    // 显示文件预览
    const filePreview = document.getElementById('filePreview');
    const previewFileName = document.getElementById('previewFileName');
    const previewFileSize = document.getElementById('previewFileSize');
    const uploadArea = document.getElementById('fileUploadArea');
    
    if (filePreview) filePreview.classList.remove('hidden');
    if (uploadArea) uploadArea.classList.add('has-file');
    if (previewFileName) previewFileName.textContent = file.name;
    if (previewFileSize) previewFileSize.textContent = formatFileSize(file.size);
    
    // 自动填充标题
    const titleInput = document.getElementById('resourceTitle');
    if (titleInput && !titleInput.value) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        titleInput.value = fileName;
    }
}

/**
 * 移除文件
 */
function removeFile() {
    selectedFile = null;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    const filePreview = document.getElementById('filePreview');
    if (filePreview) filePreview.classList.add('hidden');
    
    const uploadArea = document.getElementById('fileUploadArea');
    if (uploadArea) uploadArea.classList.remove('has-file');
}

/**
 * 处理上传
 */
async function handleUpload(e) {
    e.preventDefault();
    
    if (!selectedFile) {
        showToast('请选择要上传的文件');
        return;
    }
    
    const title = document.getElementById('resourceTitle')?.value.trim();
    const description = document.getElementById('resourceDesc')?.value.trim();
    
    if (!title) {
        showToast('请输入资源标题');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
    }
    
    try {
        const client = getSupabaseClient();
        if (!client) {
            showToast('系统初始化失败');
            return;
        }
        
        // 上传文件到存储
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `resources/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await client
            .storage
            .from('resources')
            .upload(filePath, selectedFile);
        
        if (uploadError) {
            throw uploadError;
        }
        
        // 获取文件URL
        const { data: { publicUrl } } = client
            .storage
            .from('resources')
            .getPublicUrl(filePath);
        
        // 保存资源记录到数据库
        const { data: resource, error: dbError } = await client
            .from('resources')
            .insert([{
                uploader_id: currentUser.id,
                title: title,
                description: description,
                file_url: publicUrl,
                file_name: selectedFile.name,
                file_size: selectedFile.size,
                file_type: selectedFile.type || fileExt,
                download_count: 0,
                is_deleted: false
            }])
            .select()
            .single();
        
        if (dbError) {
            throw dbError;
        }
        
        showToast('上传成功');
        closeUploadModal();
        
        // 刷新列表
        currentPage = 1;
        loadResources();
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('上传失败：' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '确认上传';
        }
    }
}

/**
 * 下载资源
 */
async function downloadResource(resourceId, fileUrl) {
    try {
        // 增加下载计数
        const client = getSupabaseClient();
        if (client) {
            await client
                .from('resources')
                .update({ download_count: client.rpc('increment', { x: 1 }) })
                .eq('id', resourceId);
        }
        
        // 打开下载链接
        window.open(fileUrl, '_blank');
        
    } catch (error) {
        console.error('Download error:', error);
        window.open(fileUrl, '_blank');
    }
}

/**
 * 打开VIP弹窗
 */
function openVipModal() {
    const modal = document.getElementById('vipModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * 关闭VIP弹窗
 */
function closeVipModal() {
    const modal = document.getElementById('vipModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * 联系管理员
 */
function contactAdmin() {
    showToast('请联系管理员开通会员');
    closeVipModal();
}

/**
 * 返回上一页
 */
function goBack() {
    window.history.back();
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
 * HTML转义
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 显示Toast提示
 */
function showToast(message) {
    // 移除已有的toast
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
