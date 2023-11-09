// swagger-components.ts
export const datsComponents = {
  schemas: {
    Transfer: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
    },
  },
  responses: {
    SuccessResponse: {
      description: "Successful response jl ",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
              // Add more properties as needed
            },
          },
        },
      },
    },
  },
};
