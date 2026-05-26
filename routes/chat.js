const { Router } = require("express");
const Quotation = require("../models/quotation");
const router = Router();

// Serve chatbot widget
router.get("/widget", (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/chatbot-widget.html'));
});

// Handle chatbot messages and quotation submission
router.post("/message", async (req, res) => {
  try {
    const { name, email, projectDetails, estimatedBudget } = req.body;

    // Validate required fields
    if (!name || !email || !projectDetails) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and project details are required",
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Create quotation in database
    const quotation = new Quotation({
      name,
      email,
      projectDetails,
      estimatedBudget: estimatedBudget || 0,
      status: "pending",
    });

    await quotation.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: "Your quotation request has been submitted successfully!",
      quotationId: quotation._id,
      data: {
        id: quotation._id,
        status: quotation.status,
        submittedAt: quotation.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error processing quotation:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request. Please try again later.",
    });
  }
});

// Check quotation status (user can check their quotation)
router.get("/check-status/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    // Return current status and quoted details if available
    res.json({
      success: true,
      data: {
        id: quotation._id,
        status: quotation.status,
        quotationPrice: quotation.quotationPrice,
        quotationNote: quotation.quotationNote,
        respondedAt: quotation.respondedAt,
        submittedAt: quotation.submittedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while checking the status",
    });
  }
});

// Admin: Get all quotations
router.get("/admin/quotations", async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: quotations,
      totalCount: quotations.length,
      pending: quotations.filter(q => q.status === 'pending').length,
      quoted: quotations.filter(q => q.status === 'quoted').length,
      accepted: quotations.filter(q => q.status === 'accepted').length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
    });
  }
});

// Admin: Get single quotation details
router.get("/admin/quotations/:id", async (req, res) => {
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
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation details",
    });
  }
});

// Admin: Send quotation reply
router.post("/admin/reply/:id", async (req, res) => {
  try {
    const { quotationPrice, quotationNote, status } = req.body;

    // Validate input
    if (!quotationPrice || !status) {
      return res.status(400).json({
        success: false,
        message: "Price and status are required",
      });
    }

    // Validate status
    const validStatuses = ['pending', 'quoted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Update quotation
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        quotationPrice,
        quotationNote,
        status,
        respondedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.json({
      success: true,
      message: "Quotation reply sent successfully",
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send quotation reply",
    });
  }
});

// Admin: Delete quotation
router.delete("/admin/quotations/:id", async (req, res) => {
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
      message: "Failed to delete quotation",
    });
  }
});

// Admin: Filter quotations by status
router.get("/admin/quotations/filter/:status", async (req, res) => {
  try {
    const validStatuses = ['pending', 'quoted', 'accepted', 'rejected'];
    const status = req.params.status;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const quotations = await Quotation.find({ status }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quotations,
      count: quotations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to filter quotations",
    });
  }
});

// Admin: Search quotations by email or name
router.get("/admin/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const quotations = await Quotation.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quotations,
      count: quotations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search quotations",
    });
  }
});

module.exports = router;
