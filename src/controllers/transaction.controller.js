const service = require("../services/transaction.service");

async function transfer(req, res, next) {
  try {
    const result = await service.transfer(req.body, req.get("Idempotency-Key"));
    res.status(result.duplicate ? 200 : 201).json({
      message: result.duplicate ? "Previously processed transfer returned" : "Transfer completed",
      data: result.transaction,
    });
  } catch (error) { next(error); }
}

async function getById(req, res, next) {
  try { res.json({ data: await service.getTransaction(req.params.id) }); }
  catch (error) { next(error); }
}

async function accountHistory(req, res, next) {
  try { res.json({ data: await service.accountHistory(req.params.id) }); }
  catch (error) { next(error); }
}

module.exports = { transfer, getById, accountHistory };
