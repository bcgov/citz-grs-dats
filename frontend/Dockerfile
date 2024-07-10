# Use the official Node.js image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY . .

# Install dependecies
#RUN npm set progress=false \
#    && npm config set depth 0 \
#    && npm i install
RUN npm i

# Get all the code needed to run the app
COPY . /usr/src/app

# Expose the port the app runs in
EXPOSE 3000

# Serve the app
CMD ["npm", "run", "serve"]
