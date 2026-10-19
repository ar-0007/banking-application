const { randomUUID } = require("crypto");
const repository = require("../repositories/refund.repository");
const httpError = require("../utils/http-error");
const { isUuid, isPositiveMoneyString } = require("../utils/validation");

async function create(transactionId, data) {
  if (!isUuid(transactionId)) throw httpError(400, "Invalid transaction UUID");
  if (!data || !isPositiveMoneyString(data.amount)) throw httpError(400, 'amount must be a positive decimal string, e.g. "25.00"');
  if (data.reason !== undefined && typeof data.reason !== "string") throw httpError(400, "reason must be a string");
  return repository.create({
    id: randomUUID(),
    transactionId,
    amount: data.amount,
    reason: data.reason,
  });
}

async function getById(id) {
  if (!isUuid(id)) throw httpError(400, "Invalid refund UUID");
  const refund = await repository.findById(id);
  if (!refund) throw httpError(404, "Refund not found");
  return refund;
}

module.exports = { create, getById };
