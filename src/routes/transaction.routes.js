const router = require("express").Router();
const controller = require("../controllers/transaction.controller");

router.post("/", controller.transfer);
router.get("/account/:id", controller.accountHistory);
router.get("/:id", controller.getById);

module.exports = router;
