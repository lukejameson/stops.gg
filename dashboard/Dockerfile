FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ensure public assets are included (favicon, stylesheets, etc.)
RUN test -d public || mkdir -p public

EXPOSE 5173

CMD ["npm", "start"]
