const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const modelMapping = require("../config/modelMapping");

/**
 * @swagger
 * tags:
 *   name: Models
 *   description: Available AI models
 */

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get list of supported AI model names
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of available model names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["craftifai-gpt-5.2", "craftifai-gpt-5-pro", "craftifai-embedding-3"]
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, (req, res) => {
  const models = Object.keys(modelMapping);
  res.json(models);
});

module.exports = router;