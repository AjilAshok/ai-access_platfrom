// const express = require("express");
// const cors = require("cors");
// const prisma = require("./src/config/prisma");
// require("dotenv").config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({ message: "API running successfully 🚀" });
// });

// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// const authRoutes = require("./src/routes/auth.routes");
// const userRoutes = require("./src/routes/user.routes");
// const adminRoutes = require("./src/routes/admin.routes");
// const modelRoutes = require("./src/routes/model.routes");
// const aiRoutes = require("./src/routes/ai.routes");
// app.use("/api/auth", authRoutes);

// app.use("/api/user", userRoutes);

// app.use("/api/admin", adminRoutes);


// app.use("/api/model", modelRoutes);

// app.use("/api/ai", aiRoutes);
require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});