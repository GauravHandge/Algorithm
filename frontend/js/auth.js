/**
 * AlgoVerse Universal Authentication Manager
 * Handles auth state, protected routes, navbar updates, and seamless sign-in/sign-out.
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

  const defaultUser = {
    name: 'Gaurav Handge',
    email: 'gaurav@algoverse.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role: 'Pro Developer',
    signedInAt: new Date().toISOString()
  };

  const AlgoAuth = {
    isAuthenticated: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return !!stored && stored !== 'null';
      } catch (e) {
        return false;
      }
    },

    getUser: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return null;
    },

    login: function (email, password, remember) {
      const user = {
        name: email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Learner',
        email: email || 'user@algoverse.io',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        role: 'Pro Learner',
        signedInAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      this.redirectAfterLogin();
    },

    loginWithGoogle: function () {
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
      } catch (e) {}
      window.location.href = '/static/signin.html';
    },

    redirectAfterLogin: function () {
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get('redirect_to') || '/static/dashboard.html';
      window.location.href = destination;
    },

    requireAuth: function () {
      if (!this.isAuthenticated()) {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = '/static/signin.html?redirect_to=' + encodeURIComponent(currentPath);
        return false;
      }
      return true;
    },

    syncNavbars: function () {
      const isAuth = this.isAuthenticated();
      const user = this.getUser() || defaultUser;

      // Update dedicated auth action containers
      document.querySelectorAll('.auth-nav-action, .header-actions').forEach(container => {
        if (!container) return;
        if (isAuth) {
          container.innerHTML = `
            <div style="display:inline-flex; align-items:center; gap:8px;">
              <a href="/static/dashboard.html" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding:4px 10px; border-radius:8px; background:#F1F5F9; border:1px solid #E2E8F0; transition:all 0.15s ease;">
                <img src="${user.avatar}" alt="${user.name}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
                <span style="font-size:0.82rem; font-weight:700; color:#0F172A;">${user.name}</span>
              </a>
              <button onclick="AlgoAuth.logout()" style="background:#FFFFFF; border:1px solid #E2E8F0; color:#DC2626; padding:0.4rem 0.75rem; font-size:0.8rem; font-weight:700; border-radius:8px; cursor:pointer; font-family:'Inter', sans-serif; transition:all 0.15s ease;" title="Sign Out of AlgoVerse">
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

      // Also attach click events to any standalone link with text 'Sign In' or 'Get Started'
      document.querySelectorAll('a, button').forEach(el => {
        const txt = (el.textContent || '').trim();
        if (txt === 'Sign In' && !el.getAttribute('href')?.includes('signin.html')) {
          el.setAttribute('href', '/static/signin.html');
          el.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/static/signin.html';
          });
        } else if (txt === 'Get Started' && !el.getAttribute('href')?.includes('signin.html')) {
          el.setAttribute('href', '/static/signin.html?mode=signup');
        }
      });
    }
  };

  // Run automatically on page load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => AlgoAuth.syncNavbars());
    } else {
      AlgoAuth.syncNavbars();
    }
  }

  return AlgoAuth;
});
