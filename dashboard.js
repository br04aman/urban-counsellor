// Shared dashboard JS: renders sidebar and handles auth
function initDashboard(activePage) {
    const sb = window.supabase
        ? window.supabase.createClient(window.SUPABASE_URL || '', window.SUPABASE_ANON_KEY || '')
        : null;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', href: '/', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
        { id: 'onboarding', label: 'Onboarding', href: '/onboarding', icon: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>' },
        { id: 'therapist-email', label: 'Therapist Email', href: '/therapist-email', icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' },
        { id: 'nutrition', label: 'Nutrition Consultation', href: '/nutrition', icon: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' },
        { id: 'session-notes', label: 'Session Notes', href: '/session-notes', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
        { id: 'self-help', label: 'Self Help Programs', href: '/self-help', icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' },
        { id: 'assessment', label: 'Assessment', href: '/assessment', icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
        { id: 'reading', label: 'Reading', href: '/reading', icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
    ];

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
    <a href="/" class="sidebar-brand">
      <span class="brand-mark"></span>
      <span class="brand-name">URBAN<br>COUNSELLOR</span>
    </a>
    <div class="user-card">
      <div class="user-avatar" id="sb-avatar">U</div>
      <div class="user-name" id="sb-name">Welcome</div>
      <div class="user-email" id="sb-email">—</div>
      <div class="user-actions">
        <a href="#" class="logout" id="sb-logout">Logout</a>
        <a href="/onboarding">Edit Profile</a>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(n => `
        <a class="nav-item${n.id === activePage ? ' active' : ''}" href="${n.href}">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${n.icon}</svg>
          ${n.label}
        </a>`).join('')}
    </nav>`;

    // Auth
    if (sb) {
        sb.auth.getSession().then(({ data: { session } }) => {
            if (!session || !session.user) { window.location.replace('/signin'); return; }
            const email = session.user.email || '';
            const name = session.user.user_metadata?.full_name || email.split('@')[0];
            document.getElementById('sb-avatar').textContent = (name[0] || 'U').toUpperCase();
            document.getElementById('sb-name').textContent = name;
            document.getElementById('sb-email').textContent = email;
        });
        document.getElementById('sb-logout').addEventListener('click', async (e) => {
            e.preventDefault();
            await sb.auth.signOut();
            window.location.href = '/';
        });
    }
}
