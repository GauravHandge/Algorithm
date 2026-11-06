/**
 * AlgoVerse Universal Authentication Manager
 * Connects directly to FastAPI Python Backend (/api/auth)
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AlgoAuth = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const STORAGE_KEY = 'algoverse_auth_user';
  const TOKEN_KEY = 'algoverse_auth_token';

  const defaultUser = {
    name: 'Gaurav Handge',
    email: 'gaurav@algoverse.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role: 'Admin',
    is_admin: true
  };

  const AlgoAuth = {
    isAuthenticated: function () {
      const token = this.getToken();
      const user = this.getUser();
      return Boolean(token && user && user.email);
    },

    getUser: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored !== 'null') {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) return parsed;
        }
      } catch (e) {}
      return null;
    },

    getToken: function () {
      try {
        const t = localStorage.getItem(TOKEN_KEY);
        if (t) return t;
      } catch (e) {}
      return '';
    },

    ensureSession: async function () {
      // Validates stored token without performing automatic fallback login
      const token = this.getToken();
      if (!token) return;
      try {
        const resp = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
          this.syncNavbars();
        }
      } catch (e) {}
    },

    /**
     * Authenticate against Python Backend (/api/auth/login)
     */
    login: async function (email, password, remember) {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Sign in failed. Please check your credentials.');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    },

    /**
     * Create Account against Python Backend (/api/auth/register)
     */
    register: async function (name, email, password) {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    },

    loginWithGoogle: function () {
      // Mock Google OAuth flow linking into user session
      const user = {
        name: 'Gaurav Handge (Google)',
        email: 'gaurav.handge@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'Google Verified',
        signedInAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this.redirectAfterLogin();
    },

    logout: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } catch (e) {}
      window.location.href = '/static/signin.html';
    },

    redirectAfterLogin: function () {
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get('redirect_to') || '/static/dashboard.html';
      window.location.href = destination;
    },

    requireAuth: function () {
      this.ensureSession();
      return true;
    },

    syncNavbars: function () {
      const isAuth = this.isAuthenticated();
      const user = this.getUser();

      document.querySelectorAll('.auth-nav-action, .header-actions').forEach(container => {
        if (!container) return;
        if (isAuth) {
          container.innerHTML = `
            <div style="display:inline-flex; align-items:center; gap:8px;">
              <a href="/static/dashboard.html" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding:4px 10px; border-radius:8px; background:#F1F5F9; border:1px solid #E2E8F0; transition:all 0.15s ease;">
                <img src="${user.avatar || defaultUser.avatar}" alt="${user.name}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                <span style="font-size:0.82rem; font-weight:700; color:#0F172A;">${user.name}</span>
              </a>
              <button onclick="AlgoAuth.logout()" style="background:#FFFFFF; border:1px solid #E2E8F0; color:#DC2626; padding:0.4rem 0.75rem; font-size:0.8rem; font-weight:700; border-radius:8px; cursor:pointer; font-family:'Inter', sans-serif; transition:all 0.15s ease;" title="Sign Out">
                Sign Out
              </button>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div style="display:inline-flex; align-items:center; gap:8px;">
              <a href="/static/signin.html" style="text-decoration:none; background:#FFFFFF; color:#0F172A; border:1px solid #E2E8F0; padding:0.42rem 1.1rem; font-size:0.85rem; font-weight:600; border-radius:8px; transition:all 0.15s ease;">
                Sign In
              </a>
              <a href="/static/signin.html?mode=signup" style="text-decoration:none; background:#2563EB; color:#FFFFFF; padding:0.42rem 1.2rem; font-size:0.85rem; font-weight:700; border-radius:8px; box-shadow:0 2px 8px rgba(37,99,235,0.25); transition:all 0.15s ease;">
                Get Started
              </a>
            </div>
          `;
        }
      });
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        AlgoAuth.ensureSession();
        AlgoAuth.syncNavbars();
      });
    } else {
      AlgoAuth.ensureSession();
      AlgoAuth.syncNavbars();
    }
  }

  return AlgoAuth;
});
