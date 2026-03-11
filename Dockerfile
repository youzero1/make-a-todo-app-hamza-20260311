FROM node:20-alpine

RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["npm", "start"]
