import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Secure Customer Portal API',
      version: '1.0.0',
      description: 'OTP-based customer portal with admin approval workflow'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local' }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'secure.sid'
        }
      }
    },
    security: [{ sessionAuth: [] }]
  },
  apis: ['./src/routes/*.mjs']
});
