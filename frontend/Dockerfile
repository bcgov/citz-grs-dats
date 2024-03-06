# Development
FROM node:18-alpine
WORKDIR /frontend
COPY package*.json /frontend/
RUN yarn install
COPY . /frontend/
EXPOSE 3000
EXPOSE 35729
CMD ["yarn", "start"]