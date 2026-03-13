const mongoose = require("mongoose");

let isConnected = false;

async function connectToMongo(uri) {
  if (isConnected) return;
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Set it in server/.env");
  }

  await mongoose.connect(uri, {
    autoIndex: true,
  });
  isConnected = true;
}

module.exports = { connectToMongo };

