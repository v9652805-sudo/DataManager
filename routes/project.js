const { Router } = require("express");
const Project = require("../models/project");
const cloudinary = require('cloudinary').v2;
const upload = require("../middleware/multerConfig");

const router = Router();

// ====================== GET ROUTES ======================
router.get("/view", async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const query = searchQuery ? {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { title: { $regex: searchQuery, $options: "i" } },
      ]
    } : {};

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.render("view-project", { projects, message: null, searchQuery });
  } catch (error) {
    console.error(error);
    res.status(500).render("view-project", { projects: [], message: "Error loading projects", searchQuery: "" });
  }
});

router.get("/create", (req, res) => {
  res.render("edit-project", { project: {}, message: null });
});

router.get("/edit/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.redirect("/api/projects/view");
    res.render("edit-project", { project, message: null });
  } catch (error) {
    console.error(error);
    res.redirect("/api/projects/view");
  }
});

// ====================== POST ROUTES ======================
router.post("/create", upload.single("projectImg"), async (req, res) => {
  try {
    const { name, title, description, projectsUrl, projectCodeViewurl } = req.body;

    if (!name || !title || !description || !projectsUrl || !projectCodeViewurl) {
      return res.status(400).render("edit-project", {
        project: req.body,
        message: "All fields are required!"
      });
    }

    const newProject = new Project({
      name,
      title,
      description,
      projectImg: req.file ? req.file.path : "",
      publicId: req.file ? req.file.public_id : "",
      projectsUrl,
      projectCodeViewurl,
    });

    await newProject.save();
    res.redirect("/api/projects/view");
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).render("edit-project", {
      project: req.body,
      message: `Failed to create project: ${error.message}`
    });
  }
});

router.post("/update/:id", upload.single("projectImg"), async (req, res) => {
  try {
    const { name, title, description, projectsUrl, projectCodeViewurl } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.redirect("/api/projects/view");

    if (!name || !title || !description || !projectsUrl || !projectCodeViewurl) {
      return res.status(400).render("edit-project", {
        project,
        message: "All fields are required!"
      });
    }

    let projectImg = project.projectImg;
    let publicId = project.publicId;

    // Delete old image if new one is uploaded
    if (req.file) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }
      projectImg = req.file.path;
      publicId = req.file.public_id;
    }

    await Project.findByIdAndUpdate(req.params.id, {
      name, title, description, projectImg, publicId, projectsUrl, projectCodeViewurl
    });

    res.redirect("/api/projects/view");
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).render("edit-project", {
      project: req.body,
      message: `Failed to update project: ${error.message}`
    });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.redirect("/api/projects/view");

    if (project.publicId) {
      try {
        await cloudinary.uploader.destroy(project.publicId);
      } catch (err) {
        console.error("Delete image error:", err);
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.redirect("/api/projects/view");
  } catch (error) {
    console.error(error);
    res.redirect("/api/projects/view");
  }
});

module.exports = router;
