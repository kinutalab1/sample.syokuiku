/**
 * 食育・口腔機能向上アプリ 共通ユーティリティ
 */

const App = {
  // ===== セッション管理 =====
  getSession() {
    try {
      const s = sessionStorage.getItem('foodApp_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },

  setSession(data) {
    sessionStorage.setItem('foodApp_session', JSON.stringify(data));
  },

  clearSession() {
    sessionStorage.removeItem('foodApp_session');
  },

  // ===== ログイン確認・リダイレクト =====
  requireAuth(allowedRoles) {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'index.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      window.location.href = 'index.html';
      return null;
    }
    return session;
  },

  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },

  // ===== ロール別ホーム遷移 =====
  redirectByRole(role) {
    const routes = {
      child: 'child.html',
      parent: 'parent.html',
      teacher: 'teacher.html',
      admin: 'admin.html',
    };
    window.location.href = routes[role] || 'index.html';
  },

  // ===== API ラッパー =====
  async fetchUsers(search = '') {
    const url = search
      ? `tables/users?limit=100&search=${encodeURIComponent(search)}`
      : 'tables/users?limit=100';
    const res = await fetch(url);
    return await res.json();
  },

  async createUser(data) {
    const res = await fetch('tables/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async fetchActivityLogs(userId = null) {
    const url = userId
      ? `tables/activity_logs?limit=200&search=${encodeURIComponent(userId)}`
      : 'tables/activity_logs?limit=200';
    const res = await fetch(url);
    return await res.json();
  },

  async logActivity(data) {
    const res = await fetch('tables/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  // ===== ユーザー検索（ログイン用） =====
  async findUser(email, password, role) {
    const result = await this.fetchUsers();
    if (!result.data) return null;
    return result.data.find(u =>
      u.email === email &&
      u.password === password &&
      u.role === role
    ) || null;
  },

  async findChildByName(name) {
    const result = await this.fetchUsers();
    if (!result.data) return null;
    return result.data.find(u => u.child_name === name && u.role === 'child') || null;
  },

  // ===== アバター絵文字マップ =====
  avatarEmojis: ['🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙', '🦊', '🐰', '🐧'],

  getAvatar(num) {
    const idx = (parseInt(num) || 1) - 1;
    return this.avatarEmojis[idx % this.avatarEmojis.length];
  },

  // ===== ロールラベル =====
  roleLabel(role) {
    const labels = { child: 'こども', parent: 'ほごしゃ', teacher: 'せんせい', admin: '管理者' };
    return labels[role] || role;
  },

  // ===== スコアカラー =====
  scoreColor(score) {
    if (score >= 80) return '#27AE60';
    if (score >= 60) return '#F39C12';
    return '#E74C3C';
  },

  // ===== ローディング表示 =====
  showLoading(text = 'よみこみちゅう...') {
    const el = document.getElementById('loadingOverlay');
    if (el) {
      el.querySelector('.loading-text').textContent = text;
      el.classList.remove('hidden');
    }
  },

  hideLoading() {
    const el = document.getElementById('loadingOverlay');
    if (el) el.classList.add('hidden');
  },

  // ===== トースト通知 =====
  showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.cssText = `
      position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
      background:${type === 'success' ? '#27AE60' : type === 'error' ? '#E74C3C' : '#3498DB'};
      color:white; padding:14px 28px; border-radius:50px;
      font-weight:700; font-size:1rem; z-index:9999;
      box-shadow:0 4px 20px rgba(0,0,0,0.2);
      animation:fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // ===== 日付フォーマット =====
  formatDate(ts) {
    if (!ts) return '-';
    const d = new Date(parseInt(ts));
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  },

  // ===== アクティビティラベル =====
  activityLabel(type) {
    const l = { food_study: '🥦 たべもの学習', pronunciation: '🎤 はやくちことば', quiz: '❓ クイズ' };
    return l[type] || type;
  },
};

// グローバルに公開
window.App = App;
