// routes/database.js
const { Router } = require("express");
const Database = require("../models/Database");
const cloudinary = require('cloudinary').v2;
const upload = require("../middleware/multerConfig");

const router = Router();

// ====================== GET ======================
router.get("/view", async (req, res) => {
  try {
    const items = await Database.find().sort({ order: 1, createdAt: -1 });
    res.render("viewDatabase", { items, message: null });
  } catch (error) {
    res.status(500).render("viewDatabase", { items: [], message: "Server Error" });
  }
});

router.get("/json", async (req, res) => {
  const items = await Database.find().sort({ order: 1, createdAt: -1 });
  res.json(items);
});

router.get("/create", (req, res) => {
  res.render("editDatabase", { 
    item: {}, 
    isEdit: false, 
    message: null 
  });
});

router.get("/edit/:id", async (req, res) => {
  try {
    const item = await Database.findById(req.params.id);
    if (!item) return res.redirect("/api/database/view");
    
    res.render("editDatabase", { 
      item, 
      isEdit: true, 
      message: null 
    });
  } catch (error) {
    res.redirect("/api/database/view");
  }
});

// ====================== POST ======================
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { title, category, description, link, linkText, order } = req.body;

    await Database.create({
      title,
      category: category || "other",
      description,
      link: link || "",
      linkText: linkText || "",
      order: Number(order) || 0,
      image: req.file ? req.file.path : "",
      publicId: req.file ? req.file.public_id : ""
    });

    res.redirect("/api/database/view");
  } catch (error) {
    res.status(500).render("editDatabase", { 
      item: req.body, 
      isEdit: false, 
      message: "Error creating entry: " + error.message 
    });
  }
});

router.post("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, category, description, link, linkText, order } = req.body;
    const item = await Database.findById(req.params.id);
    if (!item) return res.redirect("/api/database/view");

    let image = item.image;
    let publicId = item.publicId;

    if (req.file) {
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
      image = req.file.path;
      publicId = req.file.public_id;
    }

    await Database.findByIdAndUpdate(req.params.id, {
      title,
      category: category || "other",
      description,
      link: link || "",
      linkText: linkText || "",
      order: Number(order) || item.order,
      image,
      publicId
    });

    res.redirect("/api/database/view");
  } catch (error) {
    res.status(500).render("editDatabase", { 
      item: req.body, 
      isEdit: true, 
      message: "Error updating entry: " + error.message 
    });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const item = await Database.findById(req.params.id);
    if (item?.publicId) await cloudinary.uploader.destroy(item.publicId).catch(() => {});
    await Database.findByIdAndDelete(req.params.id);
    res.redirect("/api/database/view");
  } catch (error) {
    res.redirect("/api/database/view");
  }
});

module.exports = router;
