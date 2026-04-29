FROM node:22-alpine AS build

WORKDIR /app
COPY . .

RUN npm ci

ARG ENVIRONMENT=prod
RUN npm run build:${ENVIRONMENT}

FROM nginx:alpine AS serve

COPY --from=build /app/dist/fuse/browser /usr/share/nginx/html

COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
