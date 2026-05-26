const { Router } = require("express");
const Database = require("../models/Database");
const cloudinary = require('cloudinary').v2;
const upload = require("../middleware/multerConfig");

const router = Router();

// View
router.get("/view", async (req, res) => {
  try {
    const items = await Database.find().sort({ order: 1, createdAt: -1 });
    res.render("viewDatabase", { items });
  } catch (e) {
    res.status(500).render("viewDatabase", { items: [], message: "Error loading" });
  }
});

router.get("/json", async (req, res) => {
  const items = await Database.find().sort({ order: 1, createdAt: -1 });
  res.json(items);
});

// Forms
router.get("/create", (req, res) => res.render("editDatabase", { item: {}, isEdit: false }));
router.get("/edit/:id", async (req, res) => {
  const item = await Database.findById(req.params.id);
  res.render("editDatabase", { item, isEdit: true });
});

// Create & Update
router.post("/create", upload.single("image"), async (req, res) => {
  const { title, category, description, link, linkText, order } = req.body;
  await Database.create({
    title, category, description, link, linkText,
    order: Number(order) || 0,
    image: req.file?.path || "",
    publicId: req.file?.public_id || ""
  });
  res.redirect("/api/database/view");
});

router.post("/update/:id", upload.single("image"), async (req, res) => {
  const { title, category, description, link, linkText, order } = req.body;
  const item = await Database.findById(req.params.id);

  let image = item.image;
  let publicId = item.publicId;

  if (req.file) {
    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
    image = req.file.path;
    publicId = req.file.public_id;
  }

  await Database.findByIdAndUpdate(req.params.id, {
    title, category, description, link, linkText,
    order: Number(order) || item.order,
    image, publicId
  });
  res.redirect("/api/database/view");
});

router.post("/delete/:id", async (req, res) => {
  const item = await Database.findById(req.params.id);
  if (item?.publicId) await cloudinary.uploader.destroy(item.publicId).catch(() => {});
  await Database.findByIdAndDelete(req.params.id);
  res.redirect("/api/database/view");
});

module.exports = router;
