const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectToMongo } = require("./mongo/connect");
const { presetsRouter } = require("./routes/presets");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "algorithm-visualizer-api",
    time: new Date().toISOString(),
  });
});

app.use("/api/presets", presetsRouter);

const port = Number(process.env.PORT || 4000);

async function start() {
  await connectToMongo(process.env.MONGODB_URI);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

