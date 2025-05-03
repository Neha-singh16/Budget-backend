const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
      index: true,
    },
    expenseId : { 
      type : mongoose.Schema.Types.ObjectId,
      ref : "Expense",
      // required : true,
    } ,
    budgetId :{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Budget",
      // required : true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    }, spent: {
      type: Number,
      min: [0, "Spent Should be Non-negative"],
      default: 0,
    },
    icons: {
      type: String,
      default: "💰",
    },
    description: {
      type: String,
      default: "",
    },
    color: { type: String, default: "#CCCCCC" },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.virtual('children', {
  ref: 'Category',               
  localField: '_id',             
  foreignField: 'parentCategoryId', 
  justOne: false                 
});

const Category = mongoose.model("Category", categorySchema);

module.exports = {
  Category,
};
