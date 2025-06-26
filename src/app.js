const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ You need this for the Category model to work
const { Category } = require("./config/model/category");
require("dotenv").config();

const app = express();

app.get('/', (req, res) => {
  res.send('🟢 Backend is live!');
});


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routers
const auth = require("./config/router/authRouter");
const  expenseRouter  = require("./config/router/expenseRouter");
const  categoryRouter  = require("./config/router/categoryRouter");
const  budgetRouter  = require("./config/router/budgetRouter");

const profileRouter = require("./config/router/profileRouter");
const incomeRouter = require("./config/router/incomeRouter");

// Default categories
const defaultCategories = [
"Food",
"Transport",
"Bills & Utilities",
"Entertainment",
"Shopping",
"Education",
"Health",
"Travel",
"Groceries",
"Others",
];

// Seed function (without connecting/disconnecting again)
async function seedDefaultCategories() {
  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name, userId: null });
    if (!exists) {
      await Category.create({ name });
      console.log(`Created: ${name}`);
    }
  }
  console.log("✅ Default categories seeded.");
}

// Routes
app.use("/", auth);
app.use("/", expenseRouter);
app.use("/", categoryRouter);
app.use("/", budgetRouter);
app.use("/", profileRouter);
app.use("/", incomeRouter);


connectDB()
  .then(async () => {
    console.log("✅ DB connected");
    if (process.env.NODE_ENV !== "production") {
      // only seed + listen when working locally
      await seedDefaultCategories();
      app.listen(3000, () =>
        console.log("🚀 Local server listening on http://localhost:3000")
      );
    }
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
  });

 module.exports = app;
