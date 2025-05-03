const express = require("express");

const budgetRouter = express.Router();
const { Budget } = require("../model/Budget");
const { userAuth } = require("../middleware/auth");
const { Category } = require("../model/category");

budgetRouter.post("/user/budget", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryId, limit, period } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const budget = new Budget({
      userId: userId,
      categoryId: categoryId,
      parentCategoryId: category.parentCategoryId || null,
      limit,
      period,
      
    });

    const saved = await budget.save();

    return res.status(201).json(saved);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

budgetRouter.get("/user/budget", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const allBudget = await Budget.find({ userId: userId });
    res.json(allBudget);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

module.exports = {
  budgetRouter,
};
