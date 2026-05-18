const express = require('express');
const router = express.Router();
const emailjs = require('@emailjs/nodejs');

emailjs.init({
  publicKey: 'lUYicfMscMJKE1eKj', 
  privateKey: 'xn7rq4KVbFcFcGqWWKuMC',
});

router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    const templateParams = {
      name,
      email,
      message,
    };

    await emailjs.send('service_jzre4ps', 'template_9g5qb7p', templateParams);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('EmailJS error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
