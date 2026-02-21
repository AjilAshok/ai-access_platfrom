const prisma = require("../config/prisma");

exports.checkLimit = async (userId, estimatedInputTokens) => {

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const usage = await prisma.tokenUsage.aggregate({
    _sum: { total_tokens: true },
    where: {
      user_id: userId,
      created_at: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  const todayUsage = usage._sum.total_tokens || 0;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { daily_limit: true }
  });

  if (!user) throw { statusCode: 404, message: "User not found" };

  if (todayUsage + estimatedInputTokens > user.daily_limit) {
    throw { statusCode: 403, message: "Daily token limit exceeded" };
  }
};