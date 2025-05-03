const mongoose = require("mongoose");

const budgetSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
 
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  parentCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null, // if the chosen node was already top-level
  },
  limit: {
    type: Number,
    min: [0, "Only Non negative value accepted"],
    required: true,
  },
  period: {
    type: String,
    enum: ["weekly", "monthly", "yearly"],
    default: "monthly",
  },
  spent: {
    type: Number,
    min: [0, "Spent Should be Non-negative"],
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});



const Budget = mongoose.model("Budget", budgetSchema);

module.exports = {
  Budget,
};
