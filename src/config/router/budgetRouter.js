const express = require("express");

const budgetRouter = express.Router();
const { Budget } = require("../model/budget");
const { userAuth } = require("../middleware/auth");
const { Category } = require("../model/category");
const mongoose = require("mongoose");

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

budgetRouter.get("/user/budget/:budgetId", userAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOne({ _id: budgetId, userId: userId })
      .populate("categoryId")
      .populate("parentCategoryId")
      .lean();
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json(budget);
  } catch (err) {
    res.status(400).send(`Error : ${err.message}`);
  }
});

budgetRouter.patch("/user/budget/:budgetId", userAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user._id;

    const budget = await Budget.findOneAndUpdate(
      {
        _id: budgetId,
        userId: userId,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runvalidators: true,
      }
    )
      .populate("categoryId")
      .lean();

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    return res.status(200).json({
      message: `${budget.categoryId._id} and ${budget.categoryId.name} has been updated!`,
      budget,
    });
  } catch (err) {
    res.status(400).send(`Error : ${err.message}`);
  }
});



budgetRouter.delete("/user/budget/:id", userAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const budget = await Budget.findOneAndDelete({ _id: id, userId });

  if (!budget) return res.status(404).json({ error: "Budget not found" });

  const Expense = mongoose.model("Expense");
  const Category = mongoose.model("Category");

  await Expense.deleteMany({ budget: budget._id });
  await Category.deleteMany({ budgetId: budget._id });

  res.json({ success: true, message: "Budget and its children deleted." });
});


module.exports =  budgetRouter

