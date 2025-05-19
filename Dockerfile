FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG PUBLIC_MY_NAME
ARG PUBLIC_MY_EMAIL
ARG PUBLIC_MY_LINKED_IN_URL
ARG PUBLIC_AVATAR_IMG_PATH
ENV PUBLIC_MY_NAME=${PUBLIC_MY_NAME}
ENV PUBLIC_MY_EMAIL=${PUBLIC_MY_EMAIL}
ENV PUBLIC_AVATAR_IMG_PATH=${PUBLIC_AVATAR_IMG_PATH}
ENV PUBLIC_MY_LINKED_IN_URL=${PUBLIC_MY_LINKED_IN_URL}

RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "build"] 