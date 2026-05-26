const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const schema = require("./graphql/schema");
require("dotenv").config();

const emailRoutes = require("./routes/email");
const projectRoutes = require("./routes/project");
const aboutRoutes = require("./routes/about");
const skillRoutes = require("./routes/skill");
const databaseRoutes = require("./routes/database");   // ← New
const botRoutes = require("./routes/bot");             // ← New

const port = process.env.PORT || 8000;
const app = express();

// ====================== CORS ======================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// GraphQL
const startApolloServer = async () => {
  const server = new ApolloServer({ typeDefs: schema, resolvers: {}, introspection: true });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
};
startApolloServer();

// ====================== ROUTES ======================
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/database", databaseRoutes);   // ← New
app.use("/api/bot", botRoutes);             // ← New
app.use("/api/email", emailRoutes);

// Page Routes
app.get("/", (req, res) => res.render("home", { message: null }));
app.get("/Hierme", (req, res) => res.render("HierMe"));

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "🟢 Running", message: "Portfolio Server Active" });
});

// 404 & Error
app.use((req, res) => res.status(404).render("error", { message: "Page not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { message: "Server Error" });
});

// Start Server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📊 GraphQL: http://localhost:${port}/graphql`);
  });
}

module.exports = app;
