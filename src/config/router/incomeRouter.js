
// src/routes/incomeRouter.js
const express = require("express");
const { Income } = require("../model/income");
const { userAuth } = require("../middleware/auth");

const incomeRouter = express.Router();

// Create a new income entry
incomeRouter.post("/user/income", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, date, source, description } = req.body;
    const income = new Income({ userId, amount, date, source, description });
    const saved = await income.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all incomes for the authenticated user
incomeRouter.get("/user/income", userAuth, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single income by its ID
incomeRouter.get("/user/income/:incomeId", userAuth, async (req, res) => {
  try {
    const inc = await Income.findOne({ _id: req.params.incomeId, userId: req.user._id });
    if (!inc) return res.status(404).json({ error: "Income not found" });
    res.json(inc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an existing income
incomeRouter.patch("/user/income/:incomeId", userAuth, async (req, res) => {
  try {
    const updates = req.body;
    const inc = await Income.findOneAndUpdate(
      { _id: req.params.incomeId, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!inc) return res.status(404).json({ error: "Income not found" });
    res.json(inc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an income entry
incomeRouter.delete("/user/income/:incomeId", userAuth, async (req, res) => {
  try {
    const inc = await Income.findOneAndDelete({ _id: req.params.incomeId, userId: req.user._id });
    if (!inc) return res.status(404).json({ error: "Income not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = incomeRouter;