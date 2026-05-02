const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;
const ROOT    = __dirname;

// ─── Static Assets ────────────────────────────────────
// Serves /js, /css, /assets, package files, etc.
app.use(express.static(ROOT));

// ─── Route Map ────────────────────────────────────────
// Each clean URL maps to its physical HTML file.
const ROUTES = {
  // Root
  '/':                    'homepage.html',

  // Auth
  '/login':               'pages/auth/login.html',
  '/register':            'pages/auth/role_selection.html',
  '/register/student':    'pages/auth/student_registration.html',
  '/register/company':    'pages/auth/company_registration.html',
  '/forgot-password':     'pages/auth/forgot_password.html',

  // Student
  '/discover':            'pages/student/discovery_feed.html',
  '/internship':          'pages/student/internship_detail.html',
  '/applications':        'pages/student/my_applications.html',
  '/profile':             'pages/student/student_profile.html',
  '/saved':               'pages/student/saved_internships.html',
  '/application-success': 'pages/student/application_success.html',

  // Company
  '/dashboard':           'pages/company/company_dashboard.html',
  '/applicants':          'pages/company/applicant_tracking.html',
  '/post-internship':     'pages/company/create_internship.html',
  '/company-profile':     'pages/company/company_profile_edit.html',
  '/companies':           'pages/company/companies_directory.html',

  // Shared
  '/messages':            'pages/shared/messages.html',
  '/notifications':       'pages/shared/notifications.html',

  // Info
  '/about':               'pages/info/about.html',
  '/privacy':             'pages/info/privacy.html',
  '/terms':               'pages/info/terms.html',
  '/settings':            'pages/info/settings.html',
};

Object.entries(ROUTES).forEach(([route, file]) => {
  app.get(route, (_req, res) => res.sendFile(path.join(ROOT, file)));
});

// ─── Start ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n==========================================');
  console.log('  TrainMe Frontend  →  http://localhost:' + PORT);
  console.log('  Backend API       →  http://localhost:8000');
  console.log('  API Docs          →  http://localhost:8000/docs');
  console.log('==========================================\n');
});
