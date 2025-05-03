const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();
// app.use(cookies());

app.use(express.json());
app.use(cookieParser());

const auth = require("./config/router/authRouter");
const { expenseRouter } = require("./config/router/expenseRouter");
const {categoryRouter} = require("./config/router/categoryRouter");
const {budgetRouter} = require("./config/router/budgetRouter")

app.use("/" , auth);
app.use("/" , expenseRouter);
app.use("/" , categoryRouter);
app.use("/" , budgetRouter);

connectDB().then(() => {
  console.log("The database is now connected!!");
  app.listen(3000, () => {
    console.log("The server is ruunning on port 3000.");
  });
}).catch((err) => {
    console.error("The database is not connected!!", err);
})
