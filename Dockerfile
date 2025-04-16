# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

COPY . .

# Command to run the application
CMD ["npm", "run", "deploy"]