// const express = require("express");
// const router = express.Router();
// const { authenticate } = require("../middleware/auth.middleware");
// const modelService = require("../services/model.service");

// router.post("/", authenticate, async (req, res) => {
//   try {
//     const { model, prompt } = req.body;

//     const result = await modelService.processRequest(
//       req.user.id,
//       model,
//       prompt
//     );

//     res.json(result);

//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const modelMapping = require("../config/modelMapping");

router.get("/", authenticate, (req, res) => {
  const models = Object.keys(modelMapping);
  res.json(models);
});

module.exports = router;