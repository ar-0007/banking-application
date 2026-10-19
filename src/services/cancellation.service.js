const { randomUUID } = require("crypto");
const repository = require("../repositories/cancellation.repository");
const transactionRepository = require("../repositories/transaction.repository");
const httpError = require("../utils/http-error");
const { isUuid } = require("../utils/validation");

async function create(transactionId, data) {
  if (!isUuid(transactionId)) throw httpError(400, "Invalid transaction UUID");
  if (!data || typeof data.reason !== "string" || !data.reason.trim()) throw httpError(400, "reason is required");
  // Confirm the transaction exists before repository-level locked validation.
  await transactionRepository.findById(transactionId).then(tx => {
    if (!tx) throw httpError(404, "Transaction not found");
  });
  return repository.create({ id: randomUUID(), transactionId, reason: data.reason.trim() });
}

async function list(transactionId) {
  if (!isUuid(transactionId)) throw httpError(400, "Invalid transaction UUID");
  const tx = await transactionRepository.findById(transactionId);
  if (!tx) throw httpError(404, "Transaction not found");
  return repository.listForTransaction(transactionId);
}

module.exports = { create, list };
