/**
 * company_registration.html — Backend Integration
 */
document.addEventListener('DOMContentLoaded', () => {
  redirectIfLoggedIn();

  const form = document.getElementById('companyRegForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const name         = document.getElementById('contactName').value.trim();
    const email        = document.getElementById('email').value.trim();
    const password     = document.getElementById('password').value;
    const confirm      = document.getElementById('confirmPassword').value;
    const company_name = document.getElementById('companyName').value.trim();
    const ssm_number   = document.getElementById('ssmNumber')?.value.trim() || null;
    const industry     = document.getElementById('industry')?.value || null;

    if (password !== confirm) {
      showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      showFieldError(document.getElementById('password'), 'Password must be at least 8 characters.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const restore = setLoading(btn, 'Registering company…');

    try {
      const data = await Auth.registerCompany({ name, email, password, company_name, ssm_number, industry });
      AuthState.save(data);
      toast('Company registered! Welcome to TrainMe.', 'success');
      setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } catch (err) {
      restore();
      toast(err.message || 'Registration failed. Please try again.', 'error');
      if (err.message && err.message.toLowerCase().includes('email')) {
        showFieldError(document.getElementById('email'), 'This email is already registered.');
      }
    }
  });
});
