
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

// Application shutdown state
let isShuttingDown = false;

// Liveness: checks whether Node.js process is alive
app.get("/live", (req, res) => {
  res.status(200).json({
    status: "alive",
  });
});

// Readiness: checks whether API can serve requests
const readinessHandler = async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: "shutting_down",
    });
  }

  try {
    await pool.query("SELECT 1");

    return res.status(200).json({
      status: "ready",
      database: "connected",
    });
  } catch (error) {
    console.error("Readiness check failed:", error.message);

    return res.status(503).json({
      status: "not_ready",
      database: "disconnected",
    });
  }
};

app.get("/ready", readinessHandler);

// Keep the existing health endpoint for compatibility
app.get("/health", readinessHandler);

// API routes
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api", refundRoutes);
app.use("/api", cancellationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start HTTP server
const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(`Banking API listening on port ${port}`);
});

// Graceful shutdown
let shutdownStarted = false;

async function gracefulShutdown(signal) {
  if (shutdownStarted) {
    return;
  }

  shutdownStarted = true;
  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  // Force-close connections if shutdown takes too long
  const forceShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timeout. Closing remaining connections.");

    server.closeAllConnections();
  }, 25000);

  forceShutdownTimer.unref();

  // Stop accepting new HTTP connections
  server.close(async (error) => {
    clearTimeout(forceShutdownTimer);

    if (error) {
      console.error("HTTP server shutdown error:", error.message);
    }

    try {
      await pool.end();
      console.log("PostgreSQL pool closed successfully.");
    } catch (dbError) {
      console.error("Database pool shutdown error:", dbError.message);
    }

    console.log("Graceful shutdown completed.");
  });
}

// Kubernetes sends SIGTERM when terminating a Pod
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Useful for local development and manual termination
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
