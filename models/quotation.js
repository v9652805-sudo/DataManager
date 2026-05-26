const { Schema, model } = require("mongoose");

const quotationSchema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'], 
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    projectDetails: { 
      type: String, 
      required: [true, 'Project details are required'], 
      trim: true,
      minlength: [10, 'Project details must be at least 10 characters long']
    },
    estimatedBudget: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'accepted', 'rejected'],
      default: 'pending'
    },
    quotationPrice: {
      type: Number,
      default: null
    },
    quotationNote: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = model('Quotation', quotationSchema);
