const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Access Platform API",
      version: "1.0.0",
      description: "Backend APIs for Auth, Admin, AI Generate, Analytics",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },


  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

module.exports = swaggerJSDoc(options);