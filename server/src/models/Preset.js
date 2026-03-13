const mongoose = require("mongoose");

const presetSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["sorting", "pathfinding"], required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

presetSchema.index({ kind: 1, createdAt: -1 });

const Preset = mongoose.model("Preset", presetSchema);

module.exports = { Preset };

