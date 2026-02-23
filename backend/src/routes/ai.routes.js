const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const aiController = require("../controllers/ai.controller");

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI text generation endpoint
 */

/**
 * @swagger
 * /api/ai/generate:
 *   post:
 *     summary: Generate an AI response for a given prompt
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [model, prompt]
 *             properties:
 *               model:
 *                 type: string
 *                 example: craftifai-gpt-5.2
 *                 description: Model name from the supported models list
 *               prompt:
 *                 type: string
 *                 example: Explain quantum computing in simple terms
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: Quantum computing uses quantum bits...
 *                 usage:
 *                   type: object
 *                   properties:
 *                     input: { type: integer }
 *                     output: { type: integer }
 *                     total: { type: integer }
 *                 mock:
 *                   type: boolean
 *                   description: true if response is a demo fallback
 *       400:
 *         description: Unsupported model
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Daily token limit exceeded
 */
router.post("/generate", authenticate, aiController.generate);

module.exports = router;