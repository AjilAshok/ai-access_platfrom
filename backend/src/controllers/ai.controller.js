const aiService = require("../services/ai.service");

exports.generate = async (req, res, next) => {
  try {
    const { model, prompt } = req.body;
    const userId = req.user.id; // from auth middleware

    const result = await aiService.generate(userId, model, prompt);

    res.json(result);

  } catch (error) {
    next(error);
  }
};