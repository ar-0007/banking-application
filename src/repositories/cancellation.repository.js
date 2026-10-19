const pool = require("../config/db");

async function create({ id, transactionId, reason }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const txResult = await client.query(
      "SELECT id, transaction_status FROM transactions WHERE id = $1 FOR UPDATE",
      [transactionId]
    );
    const tx = txResult.rows[0];
    if (!tx) {
      const error = new Error("Transaction not found"); error.statusCode = 404; throw error;
    }
    if (tx.transaction_status !== "pending") {
      const error = new Error("Only pending transactions can be cancellation-requested"); error.statusCode = 400; throw error;
    }

    const result = await client.query(
      `INSERT INTO cancellations (id, transaction_id, reason, cancellation_status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [id, transactionId, reason]
    );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    throw error;
  } finally { client.release(); }
}

async function listForTransaction(transactionId) {
  const result = await pool.query(
    "SELECT * FROM cancellations WHERE transaction_id = $1 ORDER BY created_at DESC",
    [transactionId]
  );
  return result.rows;
}

module.exports = { create, listForTransaction };
