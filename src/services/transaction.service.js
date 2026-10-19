const { randomUUID } = require("crypto");
const repository = require("../repositories/transaction.repository");
const accountRepository = require("../repositories/account.repository");
const httpError = require("../utils/http-error");
const { isUuid, isPositiveMoneyString } = require("../utils/validation");

async function transfer(data, idempotencyKey) {
  if (!data) throw httpError(400, "JSON body is required");
  const { sender_account_id: senderId, receiver_account_id: receiverId, amount } = data;

  if (!isUuid(senderId) || !isUuid(receiverId)) throw httpError(400, "Valid sender_account_id and receiver_account_id UUIDs are required");
  if (senderId === receiverId) throw httpError(400, "Sender and receiver must be different accounts");
  if (!isPositiveMoneyString(amount)) throw httpError(400, 'amount must be a positive decimal string, e.g. "100.00"');
  if (typeof idempotencyKey !== "string" || !idempotencyKey.trim()) throw httpError(400, "Idempotency-Key header is required");

  return repository.transfer({
    id: randomUUID(),
    senderId,
    receiverId,
    amount,
    idempotencyKey: idempotencyKey.trim(),
  });
}

async function getTransaction(id) {
  if (!isUuid(id)) throw httpError(400, "Invalid transaction UUID");
  const transaction = await repository.findById(id);
  if (!transaction) throw httpError(404, "Transaction not found");
  return transaction;
}

async function accountHistory(accountId) {
  if (!isUuid(accountId)) throw httpError(400, "Invalid account UUID");
  const account = await accountRepository.findById(accountId);
  if (!account) throw httpError(404, "Account not found");
  return repository.listForAccount(accountId);
}

module.exports = { transfer, getTransaction, accountHistory };
