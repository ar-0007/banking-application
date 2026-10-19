const pool = require("../config/db");

async function createAccount(account) {
  const result = await pool.query(
    `INSERT INTO accounts
      (id, full_name, account_number, balance, status, currency, phone_number, email)
     VALUES ($1, $2, $3, $4, 'active', 'PKR', $5, $6)
     RETURNING id, full_name, account_number, balance, status, currency,
               phone_number, email, created_at, updated_at`,
    [account.id, account.full_name, account.account_number, account.balance,
      account.phone_number, account.email]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT id, full_name, account_number, balance, status, currency,
            phone_number, email, created_at, updated_at
     FROM accounts WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE accounts SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, account_number, status, updated_at`,
    [id, status]
  );
  return result.rows[0] || null;
}

module.exports = { createAccount, findById, updateStatus };
