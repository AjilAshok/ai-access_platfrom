const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const prisma = require("../config/prisma");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only user management and analytics endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   email: { type: string }
 *                   role: { type: string }
 *                   daily_limit: { type: integer }
 *                   is_active: { type: boolean }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 */
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        daily_limit: true,
        is_active: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/limit:
 *   patch:
 *     summary: Update a user's daily token limit
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daily_limit:
 *                 type: integer
 *                 example: 20000
 *     responses:
 *       200:
 *         description: Daily limit updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 */
router.patch(
  "/users/:id/limit",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { daily_limit } = req.body;
      await prisma.user.update({
        where: { id: Number(id) },
        data: { daily_limit }
      });
      res.json({ message: "Daily limit updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 */
router.patch(
  "/users/:id/status",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      await prisma.user.update({
        where: { id: Number(id) },
        data: { is_active }
      });
      res.json({ message: "User status updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/analytics/daily:
 *   get:
 *     summary: Get daily token usage aggregated by date
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of daily usage objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date: { type: string, example: "2026-02-21" }
 *                   total_tokens: { type: integer, example: 4500 }
 */
router.get(
  "/analytics/daily",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const records = await prisma.tokenUsage.findMany({
        select: { total_tokens: true, created_at: true },
        orderBy: { created_at: "asc" },
      });

      const grouped = {};
      for (const r of records) {
        const date = new Date(r.created_at).toISOString().slice(0, 10);
        grouped[date] = (grouped[date] || 0) + (r.total_tokens || 0);
      }

      const result = Object.entries(grouped).map(([date, total_tokens]) => ({ date, total_tokens }));
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get token usage and request count per user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Per-user analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email: { type: string }
 *                   total_tokens: { type: integer }
 *                   request_count: { type: integer }
 */
router.get(
  "/analytics/users",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const result = await prisma.tokenUsage.groupBy({
        by: ["user_id"],
        _sum: { total_tokens: true },
        _count: { id: true },
      });

      const usersWithEmail = await Promise.all(
        result.map(async (item) => {
          const user = await prisma.user.findUnique({
            where: { id: item.user_id }
          });
          return {
            email: user?.email,
            total_tokens: item._sum.total_tokens || 0,
            request_count: item._count.id || 0,
          };
        })
      );

      res.json(usersWithEmail);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/admin/analytics/models:
 *   get:
 *     summary: Get token usage breakdown by AI model
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Per-model analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   model: { type: string, example: "craftifai-gpt-5.2" }
 *                   total_tokens: { type: integer, example: 3200 }
 */
router.get(
  "/analytics/models",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const result = await prisma.tokenUsage.groupBy({
        by: ["model"],
        _sum: { total_tokens: true },
        orderBy: { _sum: { total_tokens: "desc" } }
      });

      const flat = result.map(r => ({
        model: r.model || "unknown",
        total_tokens: r._sum.total_tokens || 0,
      }));

      res.json(flat);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;