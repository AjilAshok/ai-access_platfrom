const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const aiController = require("../controllers/ai.controller");

router.post("/generate", authenticate, aiController.generate);

module.exports = router;