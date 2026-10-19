const express = require("express");
require("dotenv").config();

const pool = require("./config/db");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const refundRoutes = require("./routes/refund.routes");
const cancellationRoutes = require("./routes/cancellation.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) { next(error); }
});

app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api", refundRoutes);
app.use("/api", cancellationRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Banking API listening on port ${port}`));
