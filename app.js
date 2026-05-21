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
app.use(express.urlencoded({ extended: true }));

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

// ====================== GRAPHQL SETUP ======================
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: {},
    introspection: true,
    formatError: (error) => {
      console.error("❌ GraphQL Error:", error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
};

startApolloServer();

// ====================== REST API ROUTES ======================
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

// ====================== API STATUS ======================
app.get("/api/status", (req, res) => {
  res.json({
    status: "🟢 Server is running",
    apis: {
      rest: "Available at /api/*",
      graphql: "Available at /graphql",
    },
    endpoints: {
      projects: "/api/projects",
      skills: "/api/skills",
      about: "/api/about",
      email: "/api/email",
    },
  });
});

// ====================== ERROR HANDLING MIDDLEWARE ======================
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "MulterError") {
    return res.status(400).render("edit-project", {
      project: {},
      message: `Upload Error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("File too large")) {
    return res.status(400).render("edit-project", {
      project: {},
      message: "File is too large. Maximum size is 5MB.",
    });
  }

  // General error
  res.status(500).render("error", {
    message: err.message || "Something went wrong on the server",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("error", {
    message: "Page not found",
  });
});

// ====================== START SERVER ======================
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server started at PORT: ${port}`);
    console.log(`📍 http://localhost:${port}`);
    console.log(`📊 GraphQL IDE: http://localhost:${port}/graphql`);
    console.log(`📝 API Status: http://localhost:${port}/api/status`);
  });
}

module.exports = app;
