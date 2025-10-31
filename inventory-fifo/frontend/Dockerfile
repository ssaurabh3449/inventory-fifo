# frontend/Dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV CI=true

EXPOSE 3000
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
