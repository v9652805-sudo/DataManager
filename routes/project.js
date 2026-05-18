const { Router } = require("express");
const Project = require("../models/project");
const cloudinary = require('cloudinary').v2;
const upload = require("../middleware/multerConfig");

const router = Router();

// ... (your GET routes remain the same)

router.post("/create", upload.single("projectImg"), async (req, res) => {
  try {
    const { name, title, description, projectsUrl, projectCodeViewurl } = req.body;

    if (!name || !title || !description || !projectsUrl || !projectCodeViewurl) {
      return res.status(400).render("edit-project", {
        project: req.body,
        message: "All fields are required",
      });
    }

    let projectImg = "";
    let publicId = "";

    if (req.file) {
      projectImg = req.file.path;           // Full Cloudinary URL
      publicId = req.file.public_id;        // ← FIXED: Use public_id
    }

    const newProject = new Project({
      name, title, description, projectImg, publicId,
      projectsUrl, projectCodeViewurl
    });

    await newProject.save();
    res.redirect("/api/projects/view");
  } catch (error) {
    console.error(error);
    res.status(500).render("edit-project", {
      project: req.body,
      message: `Failed to create project: ${error.message}`,
    });
  }
});

router.post("/update/:id", upload.single("projectImg"), async (req, res) => {
  try {
    const { name, title, description, projectsUrl, projectCodeViewurl } = req.body;
    let project = await Project.findById(req.params.id);

    if (!project) return res.status(404).send("Project not found");

    if (!name || !title || !description || !projectsUrl || !projectCodeViewurl) {
      return res.status(400).render("edit-project", { project, message: "All fields are required" });
    }

    let projectImg = project.projectImg;
    let publicId = project.publicId;

    if (req.file) {
      // Delete old image
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }
      projectImg = req.file.path;
      publicId = req.file.public_id;        // ← FIXED
    }

    await Project.findByIdAndUpdate(req.params.id, {
      name, title, description, projectImg, publicId, projectsUrl, projectCodeViewurl
    });

    res.redirect("/api/projects/view");
  } catch (error) {
    console.error(error);
    res.status(500).render("edit-project", {
      project: req.body,
      message: `Update failed: ${error.message}`,
    });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send("Project not found");

    if (project.publicId) {
      try {
        await cloudinary.uploader.destroy(project.publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.redirect("/api/projects/view");
  } catch (error) {
    console.error(error);
    res.status(500).send("Delete failed");
  }
});

module.exports = router;
