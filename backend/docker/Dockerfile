ARG NODE_IMAGE_TAG=22.8-bullseye-slim

FROM ghcr.io/bcgov/citz-imb-node:${NODE_IMAGE_TAG}

ARG BACKEND_PORT=3200

WORKDIR /app

ENV NODE_ENV=development

COPY . .

RUN npm i --verbose

EXPOSE ${BACKEND_PORT}

CMD ["npm", "run", "dev"]
