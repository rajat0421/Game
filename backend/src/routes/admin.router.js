const router = require("express").Router();
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/admin.controller");

router.use(adminMiddleware);

router.get("/daily", adminController.getDailyWord);
router.post("/daily", adminController.setDailyWord);
router.delete("/daily", adminController.clearDailyWord);

module.exports = router;
