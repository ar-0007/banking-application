const pool = require("../config/db");

async function create({ id, transactionId, amount, reason }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const txResult = await client.query(
      "SELECT id, amount, transaction_status FROM transactions WHERE id = $1 FOR UPDATE",
      [transactionId]
    );
    const tx = txResult.rows[0];
    if (!tx) {
      const error = new Error("Transaction not found"); error.statusCode = 404; throw error;
    }
    if (tx.transaction_status !== "completed") {
      const error = new Error("Only completed transactions can be refunded"); error.statusCode = 400; throw error;
    }

    const totals = await client.query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total
       FROM refunds WHERE transaction_id = $1 AND refund_status IN ('pending', 'completed')`,
      [transactionId]
    );
    const alreadyRequested = Number(totals.rows[0].total);
    if (alreadyRequested + Number(amount) > Number(tx.amount)) {
      const error = new Error("Total requested refunds cannot exceed transaction amount"); error.statusCode = 400; throw error;
    }

    const result = await client.query(
      `INSERT INTO refunds (id, transaction_id, amount, reason, refund_status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [id, transactionId, amount, reason || null]
    );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    throw error;
  } finally { client.release(); }
}

async function findById(id) {
  const result = await pool.query("SELECT * FROM refunds WHERE id = $1", [id]);
  return result.rows[0] || null;
}

module.exports = { create, findById };
