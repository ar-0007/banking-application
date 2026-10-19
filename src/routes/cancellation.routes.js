const router = require("express").Router();
const controller = require("../controllers/cancellation.controller");

router.post("/transactions/:transactionId/cancellations", controller.create);
router.get("/transactions/:transactionId/cancellations", controller.list);

module.exports = router;
