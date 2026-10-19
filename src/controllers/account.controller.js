const service = require("../services/account.service");

async function create(req, res, next) {
  try {
    const account = await service.createAccount(req.body);
    res.status(201).json({ message: "Account created", data: account });
  } catch (error) { next(error); }
}

async function getById(req, res, next) {
  try { res.json({ data: await service.getAccount(req.params.id) }); }
  catch (error) { next(error); }
}

async function getBalance(req, res, next) {
  try { res.json({ data: await service.getBalance(req.params.id) }); }
  catch (error) { next(error); }
}

async function updateStatus(req, res, next) {
  try { res.json({ message: "Account status updated", data: await service.updateStatus(req.params.id, req.body.status) }); }
  catch (error) { next(error); }
}

module.exports = { create, getById, getBalance, updateStatus };
