const router = require("express").Router();
const controller = require("../controllers/account.controller");

router.post("/", controller.create);
router.get("/:id/balance", controller.getBalance);
router.patch("/:id/status", controller.updateStatus);
router.get("/:id", controller.getById);

module.exports = router;
