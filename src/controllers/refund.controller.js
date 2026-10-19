const service = require("../services/refund.service");

async function create(req, res, next) {
  try {
    const refund = await service.create(req.params.transactionId, req.body);
    res.status(201).json({ message: "Refund request created; no money has been refunded yet", data: refund });
  } catch (error) { next(error); }
}

async function getById(req, res, next) {
  try { res.json({ data: await service.getById(req.params.id) }); }
  catch (error) { next(error); }
}

module.exports = { create, getById };
