const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const emailRoutes = require("./routes/email");
const projectRoutes = require("./routes/project");
const aboutRoutes = require("./routes/about");
const skillRoutes = require("./routes/skill");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 8000;
const app = express();

const corsOriginsEnv = process.env.CORS_ORIGINS || "*";
const corsOrigins = corsOriginsEnv === "*" ? "*" : corsOriginsEnv.split(",");
if (!process.env.CORS_ORIGINS) {
  console.warn('Warning: CORS_ORIGINS environment variable not set. Defaulting to "*"');
}
app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.render("home", { message: null });
});

app.get("/Hierme", (req, res) => {
  res.render("HierMe");
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).render("error", {
      message: `File upload error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).render("error", {
      message: err.message || "An error occurred",
    });
  }
  next();
});

if (require.main === module) {
  app.listen(port, () => console.log(`Server started at PORT: ${port}`));
}

module.exports = app;
