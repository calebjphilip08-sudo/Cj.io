// theme.js — small, dependency-free theme toggle
(() => {
  const STORAGE_KEY = 'site-theme'; // 'light' | 'dark' | null
  const DOC = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const metaThemeColor = document.getElementById('meta-theme-color');

  function applyTheme(theme) {
    if (theme === 'dark') {
      DOC.setAttribute('data-theme', 'dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', getComputedStyle(DOC).getPropertyValue('--theme-meta').trim() || '#071025');
      if (toggle) {
        toggle.setAttribute('aria-pressed', 'true');
        toggle.title = 'Switch to light mode';
      }
    } else if (theme === 'light') {
      DOC.setAttribute('data-theme', 'light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', getComputedStyle(DOC).getPropertyValue('--theme-meta').trim() || '#ffffff');
      if (toggle) {
        toggle.setAttribute('aria-pressed', 'false');
        toggle.title = 'Switch to dark mode';
      }
    } else {
      // remove attribute to fall back to CSS/media preference
      DOC.removeAttribute('data-theme');
      if (toggle) {
        // determine current effective theme via computed color contrast
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        toggle.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
      }
      if (metaThemeColor) {
        // read from :root computed var
        metaThemeColor.setAttribute('content', getComputedStyle(DOC).getPropertyValue('--theme-meta').trim() || '#ffffff');
      }
    }
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      if (theme === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore
    }
  }

  // Initialize
  const stored = getStoredTheme();
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    // No explicit choice — let CSS media query decide (we still update meta)
    applyTheme(null);
  }

  // Respond to system preference changes if the user hasn't chosen explicitly
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', e => {
      const storedTheme = getStoredTheme();
      if (!storedTheme) {
        applyTheme(null);
      }
    });
  } else if (mq && mq.addListener) {
    mq.addListener(e => {
      const storedTheme = getStoredTheme();
      if (!storedTheme) applyTheme(null);
    });
  }

  // Toggle handler
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = getStoredTheme();
      // if no stored preference, get effective theme
      let effective = current;
      if (!effective) {
        effective = (window.getComputedStyle(document.documentElement).getPropertyValue('--bg') || '').trim();
        // simple heuristic: if effective bg equals dark theme var, treat as dark
        // but safer to check aria-pressed
        effective = toggle.getAttribute('aria-pressed') === 'true' ? 'dark' : 'light';
      }

      const next = (effective === 'dark') ? 'light' : 'dark';
      setStoredTheme(next);
      applyTheme(next);
    });

    // keyboard accessibility: space/enter already triggers click
  }

  // Expose a small API (optional)
  window.siteTheme = {
    get: getStoredTheme,
    set: (t) => {
      if (t === 'dark' || t === 'light' || t === null) {
        setStoredTheme(t);
        applyTheme(t);
      }
    },
    reset: () => {
      setStoredTheme(null);
      applyTheme(null);
    }
  };
})();
