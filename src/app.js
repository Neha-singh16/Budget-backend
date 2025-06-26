const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ You need this for the Category model to work
const { Category } = require("./config/model/category");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routers
const auth = require("./config/router/authRouter");
const { expenseRouter } = require("./config/router/expenseRouter");
const { categoryRouter } = require("./config/router/categoryRouter");
const { budgetRouter } = require("./config/router/budgetRouter");

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


// Connect DB, then seed, then start server
// connectDB()
//   .then(async () => {
//     console.log("✅ The database is now connected!!");

//     await seedDefaultCategories(); // 👈 Seed categories after DB is connected

//     app.listen(3000, () => {
//       console.log("🚀 Server running on port 3000.");
//     });
//   })
//   .catch((err) => {
//     console.error("❌ The database is not connected!!", err);
//   });

if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(async () => {
      console.log("✅ DB connected (local) + seeding…");
      await seedDefaultCategories();
      app.listen(3000, () => {
        console.log("🚀 Server running on port 3000.");
      });
    })
    .catch((err) => {
      console.error("❌ Local DB connection failed", err);
    });
}


 module.exports = app;
