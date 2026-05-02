/**
 * student_registration.html — Backend Integration
 */
document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn();

  const form = document.getElementById('studentRegForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const name     = document.getElementById('fullName').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const university = document.getElementById('university').value.trim();

    if (password !== confirm) {
      showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      showFieldError(document.getElementById('password'), 'Password must be at least 8 characters.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const restore = setLoading(btn, 'Creating account…');

    try {
      const data = await Auth.registerStudent({ name, email, password, university });
      AuthState.save(data);
      toast('Account created! Welcome to TrainMe.', 'success');
      setTimeout(() => { window.location.href = 'discovery_feed.html'; }, 800);
    } catch (err) {
      restore();
      toast(err.message || 'Registration failed. Please try again.', 'error');
      if (err.message && err.message.toLowerCase().includes('email')) {
        showFieldError(document.getElementById('email'), 'This email is already registered.');
      }
    }
  });
});
