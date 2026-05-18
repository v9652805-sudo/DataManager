const { Router } = require("express");
const Project = require("../models/project");
const cloudinary = require('cloudinary').v2;
const upload = require("../middleware/multerConfig");

const router = Router();

router.get("/view", async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const query = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { title: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};
    const projects = await Project.find(query);
    res.render("view-project", { projects, message: null, searchQuery });
  } catch (error) {
    res.status(500).render("view-project", {
      projects: [],
      message: `Error loading projects: ${error.message}`,
      searchQuery: "",
    });
  }
});

router.get("/json", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to load projects", error: error.message });
  }
});

router.get("/create", (req, res) => {
  res.render("edit-project", { project: {}, message: null });
});

router.post("/create", upload.single("projectImg"), async (req, res) => {
  try {
    const { name, title, description, projectsUrl, projectCodeViewurl, price } = req.body;
    if (!name || !title || !description || !projectsUrl || !projectCodeViewurl || !price) {
      return res.status(400).render("edit-project", {
        project: req.body,
        message: "All fields are required, including Project URL, Code View URL, and Price",
      });
    }
    let projectImg = "";
    let publicId = "";
    if (req.file) {
      projectImg = req.file.path; // Cloudinary URL
      publicId = req.file.filename; // Cloudinary public_id
    }
    const newProject = new Project({
      name,
      title,
      description,
      projectImg,
      publicId,
      projectsUrl,
      projectCodeViewurl,
      price, // Add price
    });
    await newProject.save();
    res.redirect("/api/projects/view");
  } catch (error) {
    res.status(500).render("edit-project", {
      project: req.body,
      message: `Failed to create project: ${error.message}`,
    });
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      const projects = await Project.find();
      return res.status(404).render("view-project", {
        projects,
        message: "Project not found",
        searchQuery: "",
      });
    }
    res.render("edit-project", { project, message: null });
  } catch (error) {
    const projects = await Project.find();
    res.status(500).render("view-project", {
      projects,
      message: `Error loading project: ${error.message}`,
      searchQuery: "",
    });
  }
});

router.post("/update/:id", upload.single("projectImg"), async (req, res) => {
  try {
    const { name, title, description, projectsUrl, projectCodeViewurl, price } = req.body;
    let project = await Project.findById(req.params.id);
    if (!project) {
      const projects = await Project.find();
      return res.status(404).render("view-project", {
        projects,
        message: "Project not found",
        searchQuery: "",
      });
    }
    if (!name || !title || !description || !projectsUrl || !projectCodeViewurl || !price) {
      return res.status(400).render("edit-project", {
        project,
        message: "All fields are required, including Project URL, Code View URL, and Price",
      });
    }
    let projectImg = project.projectImg;
    let publicId = project.publicId;
    if (req.file) {
      // Delete old image if it exists
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
        } catch (err) {
          console.error("Error deleting old image from Cloudinary:", err);
        }
      }
      projectImg = req.file.path; // New Cloudinary URL
      publicId = req.file.filename; // New Cloudinary public_id
    }
    await Project.findByIdAndUpdate(req.params.id, {
      name,
      title,
      description,
      projectImg,
      publicId,
      projectsUrl,
      projectCodeViewurl,
      price, // Add price
    });
    res.redirect("/api/projects/view");
  } catch (error) {
    const project = await Project.findById(req.params.id);
    res.status(500).render("edit-project", {
      project,
      message: `Failed to update project: ${error.message}`,
    });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      const projects = await Project.find();
      return res.status(404).render("view-project", {
        projects,
        message: "Project not found",
        searchQuery: "",
      });
    }
    if (project.publicId) {
      try {
        await cloudinary.uploader.destroy(`portfolio_uploads/${project.publicId}`);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
    }
    await Project.findByIdAndDelete(req.params.id);
    res.redirect("/api/projects/view");
  } catch (error) {
    const projects = await Project.find();
    res.status(500).render("view-project", {
      projects,
      message: `Failed to delete project: ${error.message}`,
      searchQuery: "",
    });
  }
});

module.exports = router;
