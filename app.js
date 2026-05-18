const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const emailRoutes = require("./routes/email");
const projectRoutes = require("./routes/project");
const aboutRoutes = require("./routes/about");
const skillRoutes = require("./routes/skill");

const port = process.env.PORT || 8000;
const app = express();

// ====================== CORS CONFIGURATION ======================
const corsOriginsEnv = process.env.CORS_ORIGINS || "*";
const corsOrigins = corsOriginsEnv === "*" ? true : corsOriginsEnv.split(",");

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ====================== MIDDLEWARE ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Important for form data

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====================== DATABASE CONNECTION ======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====================== ROUTES ======================
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/email", emailRoutes);

// ====================== PAGE ROUTES ======================
app.get("/", (req, res) => {
  res.render("home", { message: null });
});

app.get("/Hierme", (req, res) => {
  res.render("HierMe");
});

// ====================== ERROR HANDLING MIDDLEWARE ======================
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "MulterError") {
    return res.status(400).render("edit-project", {
      project: {},
      message: `Upload Error: ${err.message}`
    });
  }

  if (err.message && err.message.includes("File too large")) {
    return res.status(400).render("edit-project", {
      project: {},
      message: "File is too large. Maximum size is 5MB."
    });
  }

  // General error
  res.status(500).render("error", {
    message: err.message || "Something went wrong on the server"
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("error", { 
    message: "Page not found" 
  });
});

// ====================== START SERVER ======================
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server started at PORT: ${port}`);
    console.log(`http://localhost:${port}`);
  });
}

module.exports = app;
