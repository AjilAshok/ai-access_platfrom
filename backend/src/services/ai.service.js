const prisma = require("../config/prisma");
const openai = require("../config/openai");
const modelMapping = require("../config/modelMapping");
const tokenLimiter = require("./tokenLimiter.service");

const MOCK_RESPONSES = [
  "That's a great question! Based on the information provided, I'd recommend breaking this down into smaller components and tackling each one systematically. Start by identifying the core requirements, then build iteratively.",
  "Here's a concise summary: The key points to consider are (1) clarity of purpose, (2) audience alignment, and (3) measurable outcomes. Each of these factors plays a critical role in determining the best approach.",
  "I can help with that! The most efficient solution here would be to use a modular approach. This allows for easier testing, maintenance, and scalability over time.",
  "Great prompt! Here are three things to keep in mind: First, context is everything — make sure your inputs are well-defined. Second, iteration is key — refine your outputs based on feedback. Third, simplicity often beats complexity.",
  "Absolutely. The answer depends on your specific context, but generally speaking, the best practice is to start simple, measure results, and scale what works. Avoid over-engineering early on.",
];

exports.generate = async (userId, modelName, prompt) => {

  // 1️⃣ Map Model
  const openaiModel = modelMapping[modelName];
  if (!openaiModel) {
    throw { statusCode: 400, message: `Model ${modelName} not supported` };
  }

  // 2️⃣ Estimate Input Tokens
  const estimatedInputTokens = Math.ceil(prompt.length / 4);

  // 3️⃣ Check Limit
  await tokenLimiter.checkLimit(userId, estimatedInputTokens);

  try {
    // 4️⃣ Call OpenAI
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [{ role: "user", content: prompt }],
    });

    const responseContent = completion.choices[0].message.content;
    const usage = completion.usage;

    // 5️⃣ Store Usage
    await prisma.tokenUsage.create({
      data: {
        user_id: userId,
        model: modelName,
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens
      }
    });

    return {
      response: responseContent,
      usage: {
        input: usage.prompt_tokens,
        output: usage.completion_tokens,
        total: usage.total_tokens
      }
    };

  } catch (error) {
    // 🔄 Mock fallback for any OpenAI API error (quota, invalid model, auth, etc.)
    const isOpenAIError = error?.status || error?.code || error?.type;
    if (isOpenAIError) {
      console.warn(`⚠️  OpenAI error (${error?.status || error?.code}) — returning mock response`);

      const mockTokens = estimatedInputTokens + Math.floor(Math.random() * 80 + 40);
      const mockResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

      await prisma.tokenUsage.create({
        data: {
          user_id: userId,
          model: modelName,
          input_tokens: estimatedInputTokens,
          output_tokens: mockTokens - estimatedInputTokens,
          total_tokens: mockTokens,
        }
      });

      return {
        response: `[Demo Mode] ${mockResponse}`,
        usage: { input: estimatedInputTokens, output: mockTokens - estimatedInputTokens, total: mockTokens },
        mock: true,
      };
    }

    console.error("OpenAI Error:", error);
    throw {
      statusCode: 502,
      message: "AI Service Provider Error",
      details: error.message
    };
  }
};

