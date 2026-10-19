
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Always load .env from the banking-api project root
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const sslEnabled =
  String(process.env.DB_SSL || "false").toLowerCase() === "true";

const poolConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME || "banking_db",
  user: process.env.DB_USER || "banking_user",
  password: process.env.DB_PASSWORD,
};

if (!poolConfig.password) {
  throw new Error("DB_PASSWORD missing from .env");
}

if (sslEnabled) {
  const caPath = path.resolve(
    process.cwd(),
    process.env.DB_SSL_CA || "global-bundle.pem"
  );

  poolConfig.ssl = {
    ca: fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  };
}

console.log("ENV FILE:", envPath);
console.log("DB_HOST:", poolConfig.host);
console.log("DB_PORT:", poolConfig.port);
console.log("DB_NAME:", poolConfig.database);
console.log("DB_USER:", poolConfig.user);
console.log("DB_PASSWORD loaded:", Boolean(poolConfig.password));

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

module.exports = pool;
