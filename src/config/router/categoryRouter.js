const express = require("express");

const { userAuth } = require("../middleware/auth");
const categoryRouter = express.Router();
const { Category } = require("../model/category");

categoryRouter.post("/user/category", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const category = new Category({ ...req.body, userId });
    const saved = await category.save();

    return res.status(201).json(saved);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

categoryRouter.get("/user/category", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const allCategory = await Category.find({ userId: loggedInUser });
    res.json(allCategory);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

categoryRouter.get("/user/category/:categoryId", userAuth, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user._id;

    const category = await Category.findOne({ _id: categoryId, userId: userId })
      .populate("parentCategoryId") // pulls in the parent doc
      .populate("children") // pulls in all direct sub-categories
      .lean();
    res.json(category);
  } catch (err) {
    res.status(400).send(` Error: ${err.message}`);
  }
});

categoryRouter.patch(
  "/user/category/:categoryId",
  userAuth,
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const userId = req.user._id;

      const category = await Category.findOneAndUpdate(
        { _id: categoryId, userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      return res.status(200).json({
        message: `${category.name} has been updated!`,
        category,
      });
    } catch (err) {
      res.status(400).send(` Error: ${err.message}`);
    }
  }
);

categoryRouter.delete(
  "/user/category/:categoryId",
  userAuth,
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const userId = req.user._id;

      const category = await Category.findOne({ _id: categoryId, userId });
      if (!category) {
        return res.status(400).json("No category found!");
      }

      const childCount = await Category.countDocuments({
        parentCategoryId: categoryId,
        userId,
      });

      if (childCount > 0) {
        return res.status(400).json({
          error:
            "Cannot delete this category because it has sub-categories. Please delete or reassign them first.",
        });
      }

       await Category.deleteOne({ _id: categoryId, userId });
      return res.status(200).json({
        message: `Category "${category.name}" has been deleted.`,
        category,
      });
    } catch (err) {}
  }
);

module.exports = {
  categoryRouter,
};
