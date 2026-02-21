const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const prisma = require("../config/prisma");


// ================= VIEW ALL USERS =================
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


// ================= UPDATE DAILY LIMIT =================
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


// ================= ACTIVATE / DEACTIVATE USER =================
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


// ================= DAILY USAGE STATS =================
router.get(
  "/analytics/daily",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      // Get all token usage records ordered by date
      const records = await prisma.tokenUsage.findMany({
        select: { total_tokens: true, created_at: true },
        orderBy: { created_at: "asc" },
      });

      // Group by date string (YYYY-MM-DD)
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



// ================= PER USER USAGE =================
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


// ================= PER MODEL USAGE =================
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

      // Flatten _sum so frontend gets { model, total_tokens }
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