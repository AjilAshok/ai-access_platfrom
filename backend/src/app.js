

const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/ai.routes");
const modelRoutes = require("./routes/model.routes");
const userRoutes = require("./routes/user.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/user", userRoutes);



app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.use(errorMiddleware);

module.exports = app;
