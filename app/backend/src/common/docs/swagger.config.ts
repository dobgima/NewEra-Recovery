import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recovery Health Aid API',
      version: '1.0.0',
      description: 'API for the Recovery Health Aid application - supporting mental health recovery through daily check-ins, peer support, crisis planning, and resource access.',
      contact: {
        name: 'API Support',
        email: 'support@recoveryhealthaid.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.recoveryhealthaid.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            errorId: {
              type: 'string',
              description: 'Unique error identifier for debugging',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
            },
            code: {
              type: 'string',
              description: 'Error code for programmatic handling',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['USER', 'PEER', 'ADMIN', 'CLINICIAN'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            profile: { $ref: '#/components/schemas/UserProfile' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            displayName: { type: 'string' },
            zipCode: { type: 'string' },
            sobrietyDate: { type: 'string', format: 'date-time' },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CheckIn: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            mood: { type: 'string', enum: ['VERY_LOW', 'LOW', 'NEUTRAL', 'GOOD', 'GREAT'] },
            cravingsLevel: { type: 'integer', minimum: 0, maximum: 10 },
            triggers: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
            feltUnsafe: { type: 'boolean' },
            needsSupport: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RiskAssessment: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            score: { type: 'integer', minimum: 0, maximum: 100 },
            explanation: { type: 'string' },
            factors: { type: 'array', items: { type: 'string' } },
            recommendedAction: { type: 'string' },
            encouragement: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/**/*.routes.ts', './src/**/*.controller.ts'], // Paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };