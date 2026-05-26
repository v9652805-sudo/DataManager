// routes/chat.js
const { Router } = require("express");
const Project = require("../models/project");
const Skill = require("../models/Skill");
const About = require("../models/about");
const Database = require("../models/Database");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.json({ success: false, reply: "Please ask something about me!" });
    }

    const query = message.toLowerCase().trim();

    // Fetch all data
    const [projects, skills, abouts, extraData] = await Promise.all([
      Project.find().lean(),
      Skill.find().lean(),
      About.find().lean(),
      Database.find().lean()
    ]);

    let reply = "";

    // ==================== SMART RESPONSES ====================

    if (query.includes("who are you") || query.includes("about you") || query.includes("vishant") || query.includes("yourself")) {
      reply = abouts.length > 0 
        ? abouts[0].content 
        : "I'm Vishant Velip, a passionate Full Stack Developer from Goa, India.";
    }

    else if (query.includes("skill") || query.includes("tech") || query.includes("know")) {
      if (skills.length === 0) {
        reply = "I work with Node.js, Express, MongoDB, React, Docker, and many modern technologies.";
      } else {
        reply = "Here are my main skills:\n";
        skills.slice(0, 6).forEach(s => {
          reply += `• ${s.skillName} - ${s.description}\n`;
        });
      }
    }

    else if (query.includes("project") || query.includes("work") || query.includes("built") || query.includes("made")) {
      if (projects.length === 0) {
        reply = "I've built several full-stack applications. Check the Projects section!";
      } else {
        reply = `I've built ${projects.length} projects. Some of them are:\n\n`;
        projects.slice(0, 3).forEach(p => {
          reply += `• ${p.name} - ${p.title}\n`;
        });
        reply += "\nWould you like to see details of any specific project?";
      }
    }

    else if (query.includes("goa") || query.includes("from") || query.includes("live") || query.includes("location")) {
      reply = "I'm from Goa, India. Beautiful place with amazing beaches! 🌴";
    }

    else if (query.includes("contact") || query.includes("email") || query.includes("phone") || query.includes("reach")) {
      reply = "You can reach me at vshntvelip@gmail.com or +91 90429 60701. Feel free to send a message!";
    }

    else if (query.includes("experience") || query.includes("education") || query.includes("learn")) {
      const education = extraData.filter(d => d.category === "education" || d.category === "experience");
      if (education.length > 0) {
        reply = education[0].description;
      } else {
        reply = "I'm a self-taught Full Stack Developer. I learned through consistent practice, documentation, and AI tools.";
      }
    }

    else {
      // Fallback: Search everything
      const allText = [
        ...projects.map(p => `${p.name} ${p.title} ${p.description}`),
        ...skills.map(s => `${s.skillName} ${s.description}`),
        ...extraData.map(d => `${d.title} ${d.description}`),
        ...abouts.map(a => a.content)
      ].join(" ").toLowerCase();

      if (allText.includes(query)) {
        reply = "Yes, that's part of my journey! Feel free to ask more specific questions about my skills or projects.";
      } else {
        reply = "I'm not sure about that yet. Try asking about my **skills**, **projects**, **background**, or **how to contact me**.";
      }
    }

    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.json({
      success: false,
      reply: "Sorry, I'm having trouble responding right now. Please try again!"
    });
  }
});

module.exports = router;
