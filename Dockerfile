FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /app/out /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]