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
const databaseRoutes = require("./routes/database");
const botRoutes = require("./routes/bot");

const port = process.env.PORT || 8000;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const startApolloServer = async () => {
  const server = new ApolloServer({ typeDefs: schema, resolvers: {}, introspection: true });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
};
startApolloServer();

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => res.render("home", { message: null }));
app.get("/Hierme", (req, res) => res.render("HierMe"));

app.get("/api/status", (req, res) => res.json({ status: "🟢 Running" }));

app.use((req, res) => res.status(404).send("Page not found"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Server Error");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
