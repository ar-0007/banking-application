const { randomUUID } = require("crypto");
const repository = require("../repositories/account.repository");
const httpError = require("../utils/http-error");
const { isUuid, isNonNegativeMoneyString } = require("../utils/validation");

const ALLOWED_STATUSES = ["active", "blocked", "pending", "closed"];

async function createAccount(data) {
  if (!data || typeof data !== "object") throw httpError(400, "JSON body is required");

  const required = ["full_name", "account_number", "phone_number", "email"];
  for (const field of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw httpError(400, `${field} is required`);
    }
  }

  const balance = data.balance === undefined ? "0.00" : data.balance;
  if (!isNonNegativeMoneyString(balance)) {
    throw httpError(400, "balance must be a non-negative decimal string, e.g. 500.00");
  }

  return repository.createAccount({
    id: randomUUID(),
    full_name: data.full_name.trim(),
    account_number: data.account_number.trim(),
    phone_number: data.phone_number.trim(),
    email: data.email.trim().toLowerCase(),
    balance,
  });
}

async function getAccount(id) {
  if (!isUuid(id)) throw httpError(400, "Invalid account UUID");
  const account = await repository.findById(id);
  if (!account) throw httpError(404, "Account not found");
  return account;
}

async function getBalance(id) {
  const account = await getAccount(id);
  return { id: account.id, account_number: account.account_number, balance: account.balance, currency: account.currency };
}

async function updateStatus(id, status) {
  if (!isUuid(id)) throw httpError(400, "Invalid account UUID");
  if (!ALLOWED_STATUSES.includes(status)) throw httpError(400, "Invalid status");
  const account = await repository.updateStatus(id, status);
  if (!account) throw httpError(404, "Account not found");
  return account;
}

module.exports = { createAccount, getAccount, getBalance, updateStatus };
