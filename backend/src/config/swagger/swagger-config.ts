import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'A simple API for managing Todos'
    },
    servers: [
      {
        url: 'http://localhost:5000'
      }
    ],
  },
  apis: ['./src/routes/*.ts'], // paths to files with documentation
};

const specs = swaggerJsDoc(options);

export { swaggerUi, specs };
