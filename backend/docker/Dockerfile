ARG NODE_IMAGE_TAG=22-bullseye-slim
ARG BACKEND_PORT=3200

FROM node:${NODE_IMAGE_TAG}

WORKDIR /app

ENV NODE_ENV=development

COPY . .

RUN npm i --verbose

EXPOSE ${BACKEND_PORT}

CMD ["npm", "run", "dev"]
