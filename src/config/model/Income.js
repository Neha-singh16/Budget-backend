const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Income must be non-negative"],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: "Salary",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Income = mongoose.model("Income", incomeSchema);
module.exports = { Income };