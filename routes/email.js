router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    console.log("📧 Attempting to send email with:");
    console.log("Service ID:", process.env.EMAILJS_SERVICE_ID);
    console.log("Template ID:", process.env.EMAILJS_TEMPLATE_ID);

    const templateParams = { name, email, message };

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID, 
      process.env.EMAILJS_TEMPLATE_ID, 
      templateParams
    );

    console.log("✅ Email sent successfully:", response);
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error("❌ Full EmailJS Error:", error);
    console.error("Error Text:", error.text);
    console.error("Error Status:", error.status);
    
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.text || error.message 
    });
  }
});
