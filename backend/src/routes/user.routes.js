const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const prisma = require("../config/prisma");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Authenticated user profile and token usage stats
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get the current logged-in user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile from JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     email: { type: string }
 *                     role: { type: string }
 *                     daily_limit: { type: integer }
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get today's token usage stats for the logged-in user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token usage stats for today
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 used:
 *                   type: integer
 *                   example: 1240
 *                   description: Tokens consumed today
 *                 limit:
 *                   type: integer
 *                   example: 10000
 *                   description: Daily token limit (always fresh from DB)
 *                 remaining:
 *                   type: integer
 *                   example: 8760
 *                   description: Remaining tokens for today
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch stats
 */
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [usageResult, user] = await Promise.all([
      prisma.tokenUsage.aggregate({
        where: { user_id: userId, created_at: { gte: today, lt: tomorrow } },
        _sum: { total_tokens: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { daily_limit: true },
      }),
    ]);

    const used = usageResult._sum.total_tokens || 0;
    const limit = user?.daily_limit || 10000;
    const remaining = Math.max(0, limit - used);

    res.json({ used, limit, remaining });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;