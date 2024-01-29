# Use Node.js version 14 as the base image
FROM node:14

# Create app directory inside the image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source code inside the Docker image
COPY . .

# Your app binds to port 3000 by default
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "app.js" ]