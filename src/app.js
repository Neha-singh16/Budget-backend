// const express = require("express");
// const { connectDB } = require("./config/database");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const mongoose = require("mongoose"); // ✅ You need this for the Category model to work
// const { Category } = require("./config/model/category");
// require("dotenv").config();

// // const path = require("path");
// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// // Routers
// const auth           = require("./config/router/authRouter");
// const expenseRouter  = require("./config/router/expenseRouter");
// const categoryRouter = require("./config/router/categoryRouter");
// const budgetRouter   = require("./config/router/budgetRouter");
// const profileRouter  = require("./config/router/profileRouter");
// const incomeRouter   = require("./config/router/incomeRouter");

// // Default categories
// const defaultCategories = [
//   "Food",
//   "Transport",
//   "Bills & Utilities",
//   "Entertainment",
//   "Shopping",
//   "Education",
//   "Health",
//   "Travel",
//   "Groceries",
//   "Others",
// ];

// // Seed function (without connecting/disconnecting again)
// async function seedDefaultCategories() {
//   for (const name of defaultCategories) {
//     const exists = await Category.findOne({ name, userId: null });
//     if (!exists) {
//       await Category.create({ name });
//       console.log(`Created: ${name}`);
//     }
//   }
//   console.log("✅ Default categories seeded.");
// }

// // Connect DB, then seed, then start server
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
// // const _dirname = path.resolve();

// // Routes
// app.use("/", auth);
// app.use("/", expenseRouter);
// app.use("/", categoryRouter);
// app.use("/", budgetRouter);
// app.use("/", profileRouter);
// app.use("/", incomeRouter);

//  module.exports = app; 
// // app.use(express.static(path.join(_dirname, "../BudgetApp/dist")));
// // app.get("/", (req, res) => {
// //   res.sendFile(path.resolve(_dirname, "../BudgetApp/dist" , "index.html" ));
// // })



const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./config/database");
const { Category } = require("./config/model/category");
// … your routers …

const auth = require("./config/router/authRouter");
const expenseRouter = require("./config/router/expenseRouter");
const categoryRouter = require("./config/router/categoryRouter");
const budgetRouter = require("./config/router/budgetRouter");

const profileRouter = require("./config/router/profileRouter");
const incomeRouter = require("./config/router/incomeRouter");
const app = express();


// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
const FRONTEND_URL = process.env.FRONTEND_URL; 
const allowed = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,          // production
  process.env.FRONTEND_URL_PREVIEW   // your git-main preview
];

const corsOptions = {
  origin(origin, cb) {
    if(!origin) {
      // allow Postman/cURL etc
      return cb(null, true);
    }
    // allow localhost OR any .vercel.app domain
    if (
      origin === "http://localhost:5173" ||
      origin.endsWith(".vercel.app")
    ) {
      return cb(null, true);
    }
    cb(new Error(`CORS policy: ${origin} not allowed`));
  },
  credentials: true
};


app.use(cors(corsOptions));



app.use(express.json());
app.use(cookieParser());


app.use(express.json());
app.use(cookieParser());

// health check
app.get("/", (req, res) => res.send("🟢 Backend is live!"));


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
async function seedDefaultCategories() {
  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name, userId: null });
    if (!exists) await Category.create({ name });
  }
  console.log("✅ Default categories seeded.");
}

app.use("/", auth);
app.use("/", expenseRouter);
app.use("/", categoryRouter);
app.use("/", budgetRouter);
app.use("/", profileRouter);
app.use("/", incomeRouter);

// bootstrapping
async function startServer() {
  // 1) Connect to Mongo
  await connectDB();
  console.log("✅ MongoDB connected successfully");

  // 2) If we’re _not_ in production, seed defaults
  if (process.env.NODE_ENV !== "production") {
    await seedDefaultCategories().catch((e) => console.error("Seed error:", e));
  }

  // 3) Always start listening
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(
      `🟢 EXPRESS SERVER STARTED in ${
        process.env.NODE_ENV || "undefined"
      } on port ${port}`
    );
  });
}

// kick it off
startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

module.exports = app; // if you ever need to import for tests or serverless wrappers
