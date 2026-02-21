const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const prisma = require("../config/prisma");

// Get current user profile
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Get current user's token usage stats for today
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run both queries in parallel
    const [usageResult, user] = await Promise.all([
      prisma.tokenUsage.aggregate({
        where: { user_id: userId, created_at: { gte: today, lt: tomorrow } },
        _sum: { total_tokens: true },
      }),
      // Fetch fresh user so daily_limit reflects any admin changes
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