export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title:
      "Express API for documentation for the Digital Archive Transfer Service (DATS)",
    version: "1.0.0",
    description:
      "This is a MERN stack web application. It retrieves data from the Digital Archive Transfer Service (DATS).",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
    contact: {
      name: "Government Archives - Digital Records",
      url: "https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/government-archives",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Development server",
    },
  ],
};
