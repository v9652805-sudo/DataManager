const express = require('express');
const router = express.Router();
const emailjs = require('@emailjs/nodejs');

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    console.log("📧 Sending email to:", email);

    const templateParams = { name, email, message };

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("✅ Email sent successfully");
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error("❌ EmailJS Error:", error);
    console.error("Error Text:", error.text || error.message);
    
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.text || error.message 
    });
  }
});

module.exports = router;
