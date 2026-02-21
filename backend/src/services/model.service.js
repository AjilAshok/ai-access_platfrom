const prisma = require("../config/prisma");
const modelMapping = require("../config/modelMapping");

// Simple token estimation
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

exports.processRequest = async (userId, userModel, prompt) => {

  const internalModel = modelMapping[userModel];

  if (!internalModel) {
    throw new Error("Invalid model selected");
  }

  const inputTokens = estimateTokens(prompt);

  // ================= GET TODAY RANGE =================
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // ================= GET TODAY USAGE =================
  const usageResult = await prisma.tokenUsage.aggregate({
    _sum: {
      total_tokens: true
    },
    where: {
      user_id: userId,
      created_at: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  const todayUsage = usageResult._sum.total_tokens || 0;

  // ================= GET USER DAILY LIMIT =================
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { daily_limit: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const dailyLimit = user.daily_limit;

  if (todayUsage + inputTokens > dailyLimit) {
    throw new Error("Daily token limit exceeded");
  }

  // ================= MOCK AI RESPONSE =================
  const outputText = "AI response to: " + prompt;
  const outputTokens = estimateTokens(outputText);
  const totalTokens = inputTokens + outputTokens;

  // ================= STORE USAGE =================
  await prisma.tokenUsage.create({
    data: {
      user_id: userId,
      model: userModel,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens
    }
  });

  return {
    model: internalModel,
    response: outputText,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens
    }
  };
};