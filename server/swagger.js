const swaggerJsDoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat App API",
      version: "1.0.0",
      description: "API documentation for Chat Application of MOOJA",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
 apis: ["./routes/*.js", "./models/*.js"]
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;