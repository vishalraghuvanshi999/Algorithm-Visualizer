const express = require("express");
const { z } = require("zod");
const { Preset } = require("../models/Preset");

const presetsRouter = express.Router();

const createPresetSchema = z.object({
  kind: z.enum(["sorting", "pathfinding"]),
  name: z.string().min(1).max(80),
  data: z.unknown(),
});

presetsRouter.get("/", async (req, res) => {
  const kind = req.query.kind;
  const filter = typeof kind === "string" ? { kind } : {};

  const presets = await Preset.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({ presets });
});

presetsRouter.post("/", async (req, res) => {
  const parsed = createPresetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "invalid_payload",
      details: parsed.error.flatten(),
    });
  }

  const created = await Preset.create(parsed.data);
  res.status(201).json({ preset: created });
});

module.exports = { presetsRouter };

