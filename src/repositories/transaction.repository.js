const pool = require("../config/db");

async function transfer({ id, senderId, receiverId, amount, idempotencyKey }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const keyInsert = await client.query(
      `INSERT INTO idempotency (idempotency_key, transaction_id)
       VALUES ($1, NULL) ON CONFLICT DO NOTHING RETURNING idempotency_key`,
      [idempotencyKey]
    );

    if (keyInsert.rowCount === 0) {
      const existing = await client.query(
        `SELECT transaction_id FROM idempotency WHERE idempotency_key = $1`,
        [idempotencyKey]
      );
      await client.query("ROLLBACK");
      if (existing.rows[0] && existing.rows[0].transaction_id) {
        return { duplicate: true, transaction: await findById(existing.rows[0].transaction_id) };
      }
      const error = new Error("This idempotency key is already being processed; retry shortly");
      error.statusCode = 409;
      throw error;
    }

    const accountIds = [senderId, receiverId].sort();
    const locked = await client.query(
      `SELECT id, balance, status, currency FROM accounts
       WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE`,
      [accountIds]
    );
    if (locked.rows.length !== 2) {
      const error = new Error("Sender or receiver account not found");
      error.statusCode = 404;
      throw error;
    }

    const sender = locked.rows.find(a => a.id === senderId);
    const receiver = locked.rows.find(a => a.id === receiverId);

    if (sender.status !== "active" || receiver.status !== "active") {
      const error = new Error("Both accounts must be active");
      error.statusCode = 400;
      throw error;
    }
    if (sender.currency !== receiver.currency) {
      const error = new Error("Sender and receiver currencies must match");
      error.statusCode = 400;
      throw error;
    }

    const debit = await client.query(
      `UPDATE accounts SET balance = balance - $1::numeric, updated_at = NOW()
       WHERE id = $2 AND balance >= $1::numeric
       RETURNING id`,
      [amount, senderId]
    );
    if (debit.rowCount !== 1) {
      const error = new Error("Insufficient balance");
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `UPDATE accounts SET balance = balance + $1::numeric, updated_at = NOW()
       WHERE id = $2`,
      [amount, receiverId]
    );

    const inserted = await client.query(
      `INSERT INTO transactions
       (id, sender_account_id, receiver_account_id, amount, currency, transaction_status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       RETURNING *`,
      [id, senderId, receiverId, amount, sender.currency]
    );

    await client.query(
      `UPDATE idempotency SET transaction_id = $2 WHERE idempotency_key = $1`,
      [idempotencyKey, id]
    );

    await client.query("COMMIT");
    return { duplicate: false, transaction: inserted.rows[0] };
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    throw error;
  } finally {
    client.release();
  }
}

async function findById(id) {
  const result = await pool.query(
    `SELECT t.*,
       s.full_name AS sender_name, s.account_number AS sender_account_number,
       r.full_name AS receiver_name, r.account_number AS receiver_account_number
     FROM transactions t
     JOIN accounts s ON s.id = t.sender_account_id
     JOIN accounts r ON r.id = t.receiver_account_id
     WHERE t.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function listForAccount(accountId, limit = 50) {
  const result = await pool.query(
    `SELECT * FROM transactions
     WHERE sender_account_id = $1 OR receiver_account_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [accountId, limit]
  );
  return result.rows;
}

module.exports = { transfer, findById, listForAccount };
