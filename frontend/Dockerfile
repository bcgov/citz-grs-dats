# Development
FROM node:18-alpine
WORKDIR /frontend
COPY package*.json /frontend/
RUN yarn install
COPY . /frontend/
EXPOSE 3000
CMD ["yarn", "start"]