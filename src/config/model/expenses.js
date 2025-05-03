const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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
      min: 0,
    },
    date: {
      type: Date,
      index: true,
      default: Date.now,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategories: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      default: "Hey there! please take care of my expenses🥲",
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.pre("save", async function (next) {
  if (!this.isNew) {
    const existing = await this.constructor.findById(this._id).lean();
    this._originalAmount = existing ? existing.amount : 0;
  }
  next();
});

async function updateSpent(catId, amountDiff) {
  const Category = mongoose.model("Category");
  const Budget = mongoose.model("Budget");

  let cat = await Category.findById(catId);
  while (cat) {
    await Category.findByIdAndUpdate(
      cat._id,
      { $inc: { spent: amountDiff } },
      { new: true }
    );

    if (!cat.parentCategoryId) {
      await Budget.findOneAndUpdate(
        { categoryId: cat._id },
        { $inc: { spent: amountDiff } },
        { new: true }
      );
      break;
    }

    cat = await Category.findById(cat.parentCategoryId);
  }
}

expenseSchema.post("save", async function () {
  if (this.isNew) {
    await updateSpent(this.category, this.amount);
  } else {
    const oldAmt = this._originalAmount || 0;
    const diff = this.amount - oldAmt; // 350 - 250 = +100
    if (diff !== 0) {
      await updateSpent(this.category, diff);
    }
  }
});

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = { Expense };
