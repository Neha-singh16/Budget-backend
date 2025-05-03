const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://FeedUs:UL8JU0spCMt2feZL@namastebuddy.u2xmv8k.mongodb.net/"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

module.exports = {
  connectDB,
};
