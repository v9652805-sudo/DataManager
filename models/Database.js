// models/Database.js
const { Schema, model } = require("mongoose");

const databaseSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    enum: ["about", "experience", "education", "achievement", "certificate", "other"],
    default: "other"
  },
  description: { 
    type: String, 
    required: true 
  },
  image: { type: String, default: "" },
  publicId: { type: String, default: "" },
  link: { type: String, default: "" },
  linkText: { type: String, default: "" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = model("Database", databaseSchema);
