# Specify the base image
FROM --platform=linux/amd64 node:15

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire app directory to the container
COPY . .

# Expose the port on which your Node.js app listens
EXPOSE 9285

# Set the command to run your Node.js app
CMD [ "npm", "start" ]
