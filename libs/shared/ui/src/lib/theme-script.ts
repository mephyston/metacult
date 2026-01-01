export const themeScript = `(function() {
  function getTheme() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Check both potential keys
        return localStorage.getItem('theme-color') || 'claude';
      }
    } catch (e) {}
    return 'claude';
  }
  function getDark() {
    try {
      if (typeof localStorage !== 'undefined') {
        // Check vueuse key first (Nuxt/shared), then 'theme' (legacy Astro)
        const val = localStorage.getItem('vueuse-color-scheme') || localStorage.getItem('theme');
        if (val === 'dark' || val === 'light') return val;
        if (val === 'auto') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  const theme = getTheme();
  const mode = getDark();
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  
  // Force immediate repaint check
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
})();`;
