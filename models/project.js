const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    projectImg: { type: String, default: "" },
    publicId: { type: String, default: "" },
    projectsUrl: { type: String, required: true, trim: true },
    projectCodeViewurl: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 }, // Added price field
  },
  { timestamps: true }
);

module.exports = model("Project", projectSchema);
