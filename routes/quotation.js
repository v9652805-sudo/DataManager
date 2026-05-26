const { Router } = require("express");
const Quotation = require("../models/quotation");
const router = Router();

// Submit quotation query (from frontend chatbot)
router.post("/submit", async (req, res) => {
  try {
    const { name, email, projectDetails, estimatedBudget } = req.body;

    if (!name || !email || !projectDetails) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and project details are required",
      });
    }

    const quotation = new Quotation({
      name,
      email,
      projectDetails,
      estimatedBudget: estimatedBudget || 0,
      status: "pending",
    });

    await quotation.save();

    res.status(201).json({
      success: true,
      message: "Your quotation request has been submitted successfully!",
      quotationId: quotation._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get quotation by ID (user can check status)
router.get("/status/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      data: {
        status: quotation.status,
        quotationPrice: quotation.quotationPrice,
        quotationNote: quotation.quotationNote,
        respondedAt: quotation.respondedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: View all quotations
router.get("/admin/all", async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.render("admin-quotations", { quotations, message: null });
  } catch (error) {
    res.status(500).render("admin-quotations", {
      quotations: [],
      message: error.message,
    });
  }
});

// Admin: View single quotation
router.get("/admin/view/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).render("error", {
        message: "Quotation not found",
      });
    }

    res.render("admin-quotation-detail", { quotation, message: null });
  } catch (error) {
    res.status(500).render("error", { message: error.message });
  }
});

// Admin: Send quotation response
router.post("/admin/respond/:id", async (req, res) => {
  try {
    const { quotationPrice, quotationNote, status } = req.body;

    if (!quotationPrice || !status) {
      return res.status(400).json({
        success: false,
        message: "Price and status are required",
      });
    }

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        quotationPrice,
        quotationNote,
        status,
        respondedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Quotation response sent successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: Delete quotation
router.post("/admin/delete/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
