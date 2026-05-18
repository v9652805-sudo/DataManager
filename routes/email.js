const { Router } = require("express");
const router = Router();

router.post("/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, Email and Message are required" 
      });
    }

    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        from_name: name,
        from_email: email,
        message: message,
        to_name: "Vishant Velip",
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.text();

    if (response.ok) {
      console.log("Email sent successfully");
      return res.json({ 
        success: true, 
        message: "Email sent successfully! Thank you." 
      });
    } else {
      console.error("EmailJS Error:", result);
      return res.status(400).json({ 
        success: false, 
        message: "Failed to send email. Please try again later." 
      });
    }

  } catch (error) {
    console.error("Send Email Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while sending email" 
    });
  }
});

module.exports = router;
