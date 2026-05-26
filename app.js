const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const emailRoutes = require("./routes/email");
const projectRoutes = require("./routes/project");
const aboutRoutes = require("./routes/about");
const skillRoutes = require("./routes/skill");
const databaseRoutes = require("./routes/Database");
const chatRoutes = require("./routes/chat");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection (with error handling)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err.message));

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/chat", chatRoutes);

// Pages
app.get("/", (req, res) => res.render("home"));
app.get("/api/status", (req, res) => res.json({ status: "🟢 Running" }));

// 404
app.use((req, res) => {
  res.status(404).send(`<h2>404 - Page Not Found</h2><p>Requested: ${req.url}</p>`);
});

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`🌐 Visit: https://datamanager-qwnc.onrender.com`);
});

module.exports = app;
