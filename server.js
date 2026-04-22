const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist/tedx-ucasuncion/browser');

// Serve static files from the Angular build output
app.use(express.static(DIST_DIR));

// For all other routes, return the Angular index.html (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TEDxUCAsuncion server running on port ${PORT}`);
});
