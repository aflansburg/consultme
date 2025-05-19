FROM node:22-slim AS builder

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

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "build"] 