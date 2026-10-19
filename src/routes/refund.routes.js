const router = require("express").Router();
const controller = require("../controllers/refund.controller");

router.post("/transactions/:transactionId/refunds", controller.create);
router.get("/refunds/:id", controller.getById);

module.exports = router;
