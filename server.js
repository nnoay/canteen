const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const VALID_FILE = path.join(__dirname, 'valid_ids.json');
const USED_FILE = path.join(__dirname, 'used_today.json');

// Check QR code
app.get('/check', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.send('❌ No ID provided');

  const validData = await fs.readJson(VALID_FILE);
  const usedData = await fs.readJson(USED_FILE);

  if (!validData.valid_ids.includes(id)) {
    return res.send(`<h1 style='color:red'>❌ Invalid QR</h1>`);
  }

  if (usedData.used_today.includes(id)) {
    return res.send(`<h1 style='color:red'>❌ Already Used Today</h1>`);
  }

  usedData.used_today.push(id);
  await fs.writeJson(USED_FILE, usedData, { spaces: 2 });

  res.send(`<h1 style='color:green'>✅ Access Granted</h1>`);
});

// Reset used_today (end of day)
app.get('/reset', async (req, res) => {
  await fs.writeJson(USED_FILE, { used_today: [] });
  res.send('✅ used_today reset');
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
