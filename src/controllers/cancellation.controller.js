const service = require("../services/cancellation.service");

async function create(req, res, next) {
  try {
    const cancellation = await service.create(req.params.transactionId, req.body);
    res.status(201).json({ message: "Cancellation request created", data: cancellation });
  } catch (error) { next(error); }
}

async function list(req, res, next) {
  try { res.json({ data: await service.list(req.params.transactionId) }); }
  catch (error) { next(error); }
}

module.exports = { create, list };
