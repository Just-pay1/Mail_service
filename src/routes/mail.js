const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const transporter = require('../utils/transporter');

// POST /send-email
router.post('/send-email', async (req, res) => {
  const { to, subject, content } = req.body;

  if (!to || !subject || !content) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'general.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const htmlContent = template({ to, subject, content });

    await transporter.sendMail({
      to,
      from: 'justpaay@gmail.com',
      subject,
      html: htmlContent
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

module.exports = router;
