// Supabase 配置
const SUPABASE_URL = 'https://verskaemxqoukhnlwnbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gtr_WIuZKiChZwJz8mR6pw_mk_SAYlG';

let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabase;
        return supabase;
    }
    console.warn('Supabase library not loaded yet');
    return null;
}

// 等待 DOM 加载完成后初始化
function waitForSupabase(callback) {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        initSupabase();
        callback(supabase);
    } else {
        // 等待一小段时间后重试
        setTimeout(() => waitForSupabase(callback), 100);
    }
}

const TABLES = {
    profiles: 'profiles',
    posts: 'posts',
    comments: 'comments',
    likes: 'likes',
    messages: 'messages',
    groups: 'groups',
    group_members: 'group_members',
    group_messages: 'group_messages',
    resources: 'resources',
    memberships: 'membership_records',
    daily_post_limits: 'daily_post_limits'
};

window.TABLES = TABLES;
window.waitForSupabase = waitForSupabase;
window.getSupabase = () => supabase;
