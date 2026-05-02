const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Static Files ─────────────────────────────────────────────
// Serves all HTML, JS (js/api.js, js/auth.js, js/utils.js, js/pages/*.js)
// CSS, images, and other assets from the frontend directory.
app.use(express.static(__dirname));

// ─── Routes ───────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

// Catch-all: serve any .html file directly by name
app.get('/:page', (req, res, next) => {
    const htmlFile = path.join(__dirname, req.params.page);
    if (htmlFile.endsWith('.html')) {
        res.sendFile(htmlFile, err => { if (err) next(); });
    } else {
        next();
    }
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('\n==========================================');
    console.log('  TrainMe Frontend');
    console.log(`  http://localhost:${PORT}`);
    console.log('------------------------------------------');
    console.log('  Backend API  -> http://localhost:8000');
    console.log('  API Docs     -> http://localhost:8000/docs');
    console.log('==========================================\n');
});
