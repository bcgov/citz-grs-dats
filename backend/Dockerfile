# Use the official Node.js image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY ./backend .

RUN npm i

COPY . /usr/src/app

EXPOSE 5000

CMD [ "npm", "run", "dev" ]
