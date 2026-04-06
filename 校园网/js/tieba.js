// 广东北江中学校园网 - 贴吧功能模块

// 帖子数据存储（使用 localStorage 模拟数据库）
const STORAGE_KEY = 'beijiang_posts';
const COMMENTS_KEY = 'beijiang_comments';
const LIKES_KEY = 'beijiang_likes';

// 当前选中的分类
let currentCategory = 'all';

// 当前查看评论的帖子ID
let currentPostId = null;

// 选中的图片文件
let selectedImages = [];

// 模拟帖子数据
const mockPosts = [
    {
        id: 'post_1',
        title: '【求助】数学必修二第三章练习题答案分享',
        content: '有没有同学有数学必修二第三章的练习题答案？最近在做复习，有些题目不太会，想参考一下答案思路。谢谢各位大佬！',
        author: '高一(3)班 小明',
        authorId: 'user_001',
        isVip: false,
        category: 'study',
        images: [],
        likes: 128,
        comments: 45,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likedBy: []
    },
    {
        id: 'post_2',
        title: '食堂二楼新出的麻辣烫真的超好吃！',
        content: '今天去尝试了食堂二楼新开的麻辣烫，味道真的很不错！辣度适中，菜品也很新鲜。推荐大家可以去试试，特别是那个牛肉丸，超级Q弹！',
        author: '高二(5)班 美食家',
        authorId: 'user_002',
        isVip: true,
        category: 'life',
        images: ['https://picsum.photos/400/300?random=1'],
        likes: 96,
        comments: 32,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likedBy: []
    },
    {
        id: 'post_3',
        title: '有人一起组队参加物理竞赛吗？',
        content: '下个月有省级物理竞赛，想找几个志同道合的同学一起组队准备。有兴趣的同学可以留言或者私信我，我们可以一起刷题讨论！',
        author: '高三(1)班 物理爱好者',
        authorId: 'user_003',
        isVip: false,
        category: 'study',
        images: [],
        likes: 67,
        comments: 28,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        likedBy: []
    },
    {
        id: 'post_4',
        title: '🎉 校园歌手大赛报名开始啦！',
        content: '各位同学，一年一度的校园歌手大赛即将开始！报名时间：本周一至周五下午5点-6点，地点：学生会办公室。有才艺的同学不要错过这个展示自己的机会哦！',
        author: '学生会文艺部',
        authorId: 'user_004',
        isVip: true,
        category: 'activity',
        images: ['https://picsum.photos/400/300?random=2', 'https://picsum.photos/400/300?random=3'],
        likes: 234,
        comments: 56,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likedBy: []
    },
    {
        id: 'post_5',
        title: '图书馆开放时间调整通知',
        content: '由于期末考试临近，图书馆从下周一开始延长开放时间：周一至周五 7:00-22:00，周末 8:00-21:00。祝大家考试顺利！',
        author: '图书馆管理员',
        authorId: 'user_005',
        isVip: true,
        category: 'notice',
        images: [],
        likes: 189,
        comments: 23,
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        likedBy: []
    },
    {
        id: 'post_6',
        title: '闲聊：大家周末一般都怎么过？',
        content: '想了解一下同学们的周末生活，是宅在宿舍打游戏，还是出去逛街看电影？或者去图书馆自习？分享一下你们的周末安排吧！',
        author: '高一(7)班 好奇宝宝',
        authorId: 'user_006',
        isVip: false,
        category: 'fun',
        images: [],
        likes: 45,
        comments: 67,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        likedBy: []
    }
];

// 模拟评论数据
const mockComments = {
    'post_1': [
        { id: 'c1', author: '数学课代表', content: '我有答案，私聊发你', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { id: 'c2', author: '热心同学', content: '第三章是立体几何吧，那章确实有点难', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
    ],
    'post_2': [
        { id: 'c3', author: '吃货一枚', content: '真的吗？明天就去试试！', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: 'c4', author: '食堂常客', content: '价格怎么样？', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
    ]
};

// 初始化数据
function initData() {
    // 如果没有帖子数据，初始化模拟数据
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPosts));
    }
    if (!localStorage.getItem(COMMENTS_KEY)) {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(mockComments));
    }
    if (!localStorage.getItem(LIKES_KEY)) {
        localStorage.setItem(LIKES_KEY, JSON.stringify({}));
    }
}

// 获取所有帖子
function getPosts() {
    const posts = localStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
}

// 保存帖子
function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// 获取评论
function getComments(postId) {
    const comments = localStorage.getItem(COMMENTS_KEY);
    const allComments = comments ? JSON.parse(comments) : {};
    return allComments[postId] || [];
}

// 保存评论
function saveComment(postId, comment) {
    const comments = localStorage.getItem(COMMENTS_KEY);
    const allComments = comments ? JSON.parse(comments) : {};
    if (!allComments[postId]) {
        allComments[postId] = [];
    }
    allComments[postId].push(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
}

// 检查用户是否点赞
function hasLiked(postId) {
    const likes = localStorage.getItem(LIKES_KEY);
    const allLikes = likes ? JSON.parse(likes) : {};
    return allLikes[postId] && allLikes[postId].includes(currentUser.id);
}

// 切换点赞状态
function toggleLike(postId) {
    const likes = localStorage.getItem(LIKES_KEY);
    const allLikes = likes ? JSON.parse(likes) : {};
    
    if (!allLikes[postId]) {
        allLikes[postId] = [];
    }
    
    const index = allLikes[postId].indexOf(currentUser.id);
    let isLiked = false;
    
    if (index > -1) {
        allLikes[postId].splice(index, 1);
    } else {
        allLikes[postId].push(currentUser.id);
        isLiked = true;
    }
    
    localStorage.setItem(LIKES_KEY, JSON.stringify(allLikes));
    
    // 更新帖子点赞数
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes = allLikes[postId].length;
        savePosts(posts);
    }
    
    return isLiked;
}

// 渲染帖子列表
function renderPosts(posts = null) {
    const postList = document.getElementById('postList');
    const emptyState = document.getElementById('emptyState');
    
    if (!posts) {
        posts = getPosts();
        // 按分类筛选
        if (currentCategory !== 'all') {
            posts = posts.filter(p => p.category === currentCategory);
        }
    }
    
    // 按时间排序
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (posts.length === 0) {
        postList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    postList.innerHTML = posts.map(post => {
        const isLiked = hasLiked(post.id);
        const avatarColor = getAvatarColor(post.authorId);
        const avatarText = getAvatarText(post.author);
        
        let imagesHtml = '';
        if (post.images && post.images.length > 0) {
            const imageClass = post.images.length === 1 ? 'single' : '';
            imagesHtml = `
                <div class="post-images">
                    ${post.images.map(img => `
                        <div class="post-image ${imageClass}" onclick="event.stopPropagation(); previewImage('${img}')">
                            <img src="${img}" alt="帖子图片" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="post-card" onclick="viewPostDetail('${post.id}')">
                <div class="post-header">
                    <div class="post-avatar" style="background: ${avatarColor}">
                        ${avatarText}
                    </div>
                    <div class="post-meta">
                        <div class="post-author">
                            ${post.author}
                            ${post.isVip ? '<span class="vip-badge">VIP</span>' : ''}
                        </div>
                        <div class="post-time">${formatTime(post.createdAt)}</div>
                    </div>
                    <div class="post-more" onclick="event.stopPropagation(); showPostMenu('${post.id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-title">${escapeHtml(post.title)}</div>
                    <div class="post-text">${escapeHtml(post.content)}</div>
                    ${imagesHtml}
                </div>
                <div class="post-footer">
                    <div class="post-actions">
                        <div class="post-action like ${isLiked ? 'active' : ''}" onclick="event.stopPropagation(); handleLike('${post.id}', this)">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                            <span>${formatNumber(post.likes)}</span>
                        </div>
                        <div class="post-action" onclick="event.stopPropagation(); openCommentModal('${post.id}')">
                            <i class="far fa-comment"></i>
                            <span>${formatNumber(post.comments)}</span>
                        </div>
                        <div class="post-action" onclick="event.stopPropagation(); sharePost('${post.id}')">
                            <i class="far fa-share-square"></i>
                        </div>
                    </div>
                    <span class="post-category">${getCategoryIcon(post.category)} ${getCategoryName(post.category)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 处理点赞
function handleLike(postId, element) {
    const isLiked = toggleLike(postId);
    const icon = element.querySelector('i');
    const countSpan = element.querySelector('span');
    
    // 更新UI
    if (isLiked) {
        element.classList.add('active');
        icon.classList.remove('far');
        icon.classList.add('fas');
        // 添加动画效果
        createParticles(element);
    } else {
        element.classList.remove('active');
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
    
    // 更新数字
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        countSpan.textContent = formatNumber(post.likes);
    }
}

// 创建点赞粒子效果
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: #ff4757;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${centerX}px;
            top: ${centerY}px;
        `;
        document.body.appendChild(particle);
        
        const angle = (i / 6) * Math.PI * 2;
        const velocity = 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = 0;
        let y = 0;
        let opacity = 1;
        
        const animate = () => {
            x += vx * 0.1;
            y += vy * 0.1;
            opacity -= 0.03;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// 打开发帖弹窗
function openPostModal() {
    // 检查发帖限制
    if (!currentUser.isVip && currentUser.postsToday >= 1) {
        showToast('普通用户每日限发1帖，升级会员可无限发帖');
        return;
    }
    
    const modal = document.getElementById('postModal');
    const overlay = document.getElementById('postModalOverlay');
    
    // 更新限制提示
    const limitNotice = document.getElementById('limitNotice');
    if (currentUser.isVip) {
        limitNotice.innerHTML = '<i class="fas fa-crown"></i><span>会员用户，发帖无限制</span>';
        limitNotice.style.background = 'rgba(255, 215, 0, 0.1)';
        limitNotice.style.borderColor = 'rgba(255, 215, 0, 0.3)';
        limitNotice.style.color = '#b8860b';
    } else {
        limitNotice.innerHTML = `<i class="fas fa-info-circle"></i><span>今日还可发帖 ${1 - currentUser.postsToday} 次，升级会员可无限发帖</span>`;
    }
    
    // 控制图片上传按钮
    const uploadBtn = document.getElementById('uploadBtn');
    if (!currentUser.isVip) {
        uploadBtn.classList.add('disabled');
        uploadBtn.onclick = () => showToast('图片上传为会员专享功能');
    } else {
        uploadBtn.classList.remove('disabled');
        uploadBtn.onclick = selectImage;
    }
    
    modal.classList.add('active');
    overlay.classList.add('active');
    
    // 重置表单
    document.getElementById('postForm').reset();
    selectedImages = [];
    updateImagePreview();
}

// 关闭发帖弹窗
function closePostModal() {
    const modal = document.getElementById('postModal');
    const overlay = document.getElementById('postModalOverlay');
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

// 选择图片
function selectImage() {
    if (!currentUser.isVip) {
        showToast('图片上传为会员专享功能');
        return;
    }
    document.getElementById('imageInput').click();
}

// 处理图片选择
function handleImageSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // 限制最多3张图片
    const remainingSlots = 3 - selectedImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImages.push(e.target.result);
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    }
    
    if (files.length > remainingSlots) {
        showToast('最多只能上传3张图片');
    }
    
    // 清空input，允许重复选择相同文件
    event.target.value = '';
}

// 更新图片预览
function updateImagePreview() {
    const container = document.getElementById('imageUpload');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // 移除旧的预览
    container.querySelectorAll('.upload-preview').forEach(el => el.remove());
    
    // 添加新的预览
    selectedImages.forEach((img, index) => {
        const preview = document.createElement('div');
        preview.className = 'upload-preview';
        preview.innerHTML = `
            <img src="${img}" alt="预览">
            <button type="button" class="upload-remove" onclick="removeImage(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.insertBefore(preview, uploadBtn);
    });
    
    // 控制上传按钮显示
    if (selectedImages.length >= 3) {
        uploadBtn.style.display = 'none';
    } else {
        uploadBtn.style.display = 'flex';
    }
}

// 移除图片
function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImagePreview();
}

// 提交帖子
async function submitPost(event) {
    event.preventDefault();
    
    // 检查发帖限制
    if (!currentUser.isVip && currentUser.postsToday >= 1) {
        showToast('今日发帖次数已用完');
        return;
    }
    
    const category = document.getElementById('postCategory').value;
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!category || !title || !content) {
        showToast('请填写完整信息');
        return;
    }
    
    if (title.length < 2) {
        showToast('标题至少需要2个字符');
        return;
    }
    
    showLoading();
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPost = {
        id: 'post_' + Date.now(),
        title: title,
        content: content,
        author: currentUser.className + ' ' + currentUser.name,
        authorId: currentUser.id,
        isVip: currentUser.isVip,
        category: category,
        images: selectedImages,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        likedBy: []
    };
    
    // 保存帖子
    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);
    
    // 更新用户发帖计数
    currentUser.postsToday++;
    currentUser.lastPostDate = new Date().toDateString();
    saveUserToStorage();
    
    hideLoading();
    closePostModal();
    showToast('发布成功！');
    
    // 刷新列表
    renderPosts();
}

// 打开评论弹窗
function openCommentModal(postId) {
    currentPostId = postId;
    const modal = document.getElementById('commentModal');
    const overlay = document.getElementById('commentModalOverlay');
    
    // 加载评论
    renderComments(postId);
    
    modal.classList.add('active');
    overlay.classList.add('active');
}

// 关闭评论弹窗
function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    const overlay = document.getElementById('commentModalOverlay');
    modal.classList.remove('active');
    overlay.classList.remove('active');
    currentPostId = null;
}

// 渲染评论
function renderComments(postId) {
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    
    const comments = getComments(postId);
    commentCount.textContent = `(${comments.length})`;
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="far fa-comment-dots" style="font-size: 48px; margin-bottom: 12px; display: block;"></i>
                暂无评论，来说点什么吧
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => {
        const avatarColor = getAvatarColor(comment.author);
        const avatarText = getAvatarText(comment.author);
        
        return `
            <div class="comment-item">
                <div class="comment-avatar" style="background: ${avatarColor}">
                    ${avatarText}
                </div>
                <div class="comment-content">
                    <div class="comment-author">${escapeHtml(comment.author)}</div>
                    <div class="comment-text">${escapeHtml(comment.content)}</div>
                    <div class="comment-time">${formatTime(comment.createdAt)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 提交评论
async function submitComment() {
    if (!currentPostId) return;
    
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    
    if (!content) {
        showToast('请输入评论内容');
        return;
    }
    
    const comment = {
        id: 'c_' + Date.now(),
        author: currentUser.name,
        content: content,
        createdAt: new Date().toISOString()
    };
    
    saveComment(currentPostId, comment);
    
    // 更新帖子评论数
    const posts = getPosts();
    const post = posts.find(p => p.id === currentPostId);
    if (post) {
        post.comments++;
        savePosts(posts);
    }
    
    input.value = '';
    renderComments(currentPostId);
    renderPosts();
    showToast('评论成功');
}

// 搜索帖子
function searchPosts() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!keyword) {
        renderPosts();
        return;
    }
    
    const posts = getPosts();
    const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(keyword) || 
        post.content.toLowerCase().includes(keyword) ||
        post.author.toLowerCase().includes(keyword)
    );
    
    renderPosts(filtered);
}

// 刷新帖子
function refreshPosts() {
    const btn = document.querySelector('.header-btn i');
    btn.style.animation = 'spin 1s linear';
    
    setTimeout(() => {
        btn.style.animation = '';
        renderPosts();
        showToast('已刷新');
    }, 500);
}

// 查看帖子详情
function viewPostDetail(postId) {
    // 可以在这里实现帖子详情页跳转
    showToast('查看帖子详情：' + postId);
}

// 预览图片
function previewImage(url) {
    // 创建图片预览弹窗
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: zoom-out;
    `;
    
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
    `;
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(() => overlay.remove(), 300);
    });
}

// 显示帖子菜单
function showPostMenu(postId) {
    // 简单的菜单提示
    showToast('帖子菜单：' + postId);
}

// 分享帖子
function sharePost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        // 复制链接到剪贴板
        const shareText = `${post.title} - 来自广东北江中学校园网`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                showToast('分享内容已复制到剪贴板');
            });
        } else {
            showToast('分享：' + shareText);
        }
    }
}

// 分类标签切换
document.addEventListener('DOMContentLoaded', function() {
    initData();
    renderPosts();
    
    // 分类标签点击事件
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有active状态
            categoryTabs.forEach(t => t.classList.remove('active'));
            // 添加当前active状态
            this.classList.add('active');
            // 更新当前分类
            currentCategory = this.dataset.category;
            // 重新渲染帖子
            renderPosts();
        });
    });
    
    // 搜索框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPosts();
            }
        });
    }
    
    // 评论输入框回车事件
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitComment();
            }
        });
    }
});

// 导出函数供全局使用
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.selectImage = selectImage;
window.handleImageSelect = handleImageSelect;
window.removeImage = removeImage;
window.submitPost = submitPost;
window.handleLike = handleLike;
window.openCommentModal = openCommentModal;
window.closeCommentModal = closeCommentModal;
window.submitComment = submitComment;
window.searchPosts = searchPosts;
window.refreshPosts = refreshPosts;
window.viewPostDetail = viewPostDetail;
window.previewImage = previewImage;
window.showPostMenu = showPostMenu;
window.sharePost = sharePost;