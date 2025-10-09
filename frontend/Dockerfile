# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

RUN npm install

# Copy all remaining source files
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

