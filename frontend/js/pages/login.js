/**
 * login.html — Backend Integration
 */
document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn();

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = form.querySelector('button[type="submit"]');
    const restore  = setLoading(btn, 'Signing in…');

    try {
      const data = await Auth.login({ email, password });
      AuthState.save(data);

      toast('Welcome back, ' + data.name + '!', 'success');

      setTimeout(() => {
        const home = data.role === 'company' ? '/dashboard' : '/discover';
        window.location.href = home;
      }, 600);

    } catch (err) {
      restore();
      toast(err.message || 'Invalid email or password.', 'error');
      showFieldError(document.getElementById('email'), ' ');
      showFieldError(document.getElementById('password'), 'Invalid email or password.');
    }
  });
});
