const mongoose = require("mongoose");

function getMongoUri() {
  return (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    ""
  );
}

async function connectDB() {
  const uri = getMongoUri();
  if (!uri || typeof uri !== "string") {
    console.error(
      "Missing MongoDB URI. In backend/.env add a line:\n  MONGO_URI=mongodb+srv://...\n(See .env.example. You can also use MONGODB_URI or DATABASE_URL.)"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

module.exports = connectDB;
