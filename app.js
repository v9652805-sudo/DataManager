const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const graphqlHTTP = require("express-graphql");
const schema = require("./graphql/schema");
require("dotenv").config();

const emailRoutes = require("./routes/email");
const projectRoutes = require("./routes/project");
const aboutRoutes = require("./routes/about");
const skillRoutes = require("./routes/skill");

const port = process.env.PORT || 8000;
const app = express();

// CORS Configuration
const corsOriginsEnv = process.env.CORS_ORIGINS || "*";
const corsOrigins = corsOriginsEnv === "*" ? true : corsOriginsEnv.split(",");

app.use(cors({
  origin: corsOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// GraphQL Endpoint
app.use("/graphql", graphqlHTTP({
  schema: schema,
  graphiql: true,
  customFormatErrorFn: (error) => {
    console.error("❌ GraphQL Error:", error);
    return { message: error.message, locations: error.locations };
  }
}));

// REST Routes
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/email", emailRoutes);

// Pages
app.get("/", (req, res) => res.render("home", { message: null }));
app.get("/Hierme", (req, res) => res.render("HierMe"));
app.get("/api/status", (req, res) => res.json({
  status: "🟢 Server running",
  graphql: "http://localhost:8000/graphql"
}));

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).render("error", { message: err.message || "Server error" });
});

app.use((req, res) => res.status(404).render("error", { message: "Not found" }));

// Start
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server: http://localhost:${port}`);
    console.log(`📊 GraphQL: http://localhost:${port}/graphql`);
  });
}

module.exports = app;
