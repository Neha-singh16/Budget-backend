const express = require("express");

const { userAuth } = require("../middleware/auth");
const expenseRouter = express.Router();
const { Expense } = require("../model/expenses");
const { User } = require("../model/users");
const { validateFeilds } = require("../utils/validate");

expenseRouter.post("/user/expense", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const expense = new Expense({ ...req.body, userId });
    const saved = await expense.save();

    return res.status(201).json(saved);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

expenseRouter.get("/user/expense", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const allExpenses = await Expense.find({ userId: loggedInUser });
    res.json(allExpenses);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

expenseRouter.get("/user/expense/:expenseId", userAuth, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user._id;
    const expense = await Expense.findOne({ _id: expenseId, userId: userId });
    res.json(expense);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

expenseRouter.delete("/user/expense/:expenseId", userAuth, async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user._id;

    const deleteExpense = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: userId,
    });
    res.json({
      message: "The expense is deleted!!",
      deleteExpense,
    });
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});



expenseRouter.patch(
  "/user/expense/:expenseId",
  userAuth,
  async (req, res) => {
    try {
      // 1) Validate incoming fields
      await validateFeilds(req);

      const { expenseId } = req.params;
      const userId = req.user._id;

      // 2) Load the expense and check for existence
      const expense = await Expense.findOne({ _id: expenseId, userId });
      if (!expense) {
        return res
          .status(404)
          .json({ error: "Expense not found for this user" });
      }

      // 3) Apply updates
      Object.keys(req.body).forEach((key) => {
        expense[key] = req.body[key];
      });

      // 4) Save & log
      await expense.save();
      console.log("Updated expense:", expense);

   
      return res.status(200).json({
        message: `${expense.subCategories} has been updated!`,
        expense,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ error: `Validation/update error: ${err.message}` });
    }
  }
);



module.exports = {
  expenseRouter,
};
