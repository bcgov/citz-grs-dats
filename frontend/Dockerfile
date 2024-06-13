# Use the official Node.js image
FROM node:14 as build

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy local code to the container image and build it
COPY . .
RUN npm run build

# Use nginx to serve the build files
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
