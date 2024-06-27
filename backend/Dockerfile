# Use the official Node.js image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm ci

COPY . /usr/src/app

EXPOSE 5000

CMD [ "npm", "run", "dev" ]
