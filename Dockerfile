FROM node:16-bullseye

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgdk-pixbuf-2.0-0 \
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
    libxkbcommon0 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN (npm ci --ignore-scripts --no-audit --no-fund || npm install --ignore-scripts --no-audit --no-fund) \
 && node node_modules/puppeteer/install.js

COPY . .

RUN sed -i 's/id="5555"/id="SignalEventDefinition_5555"/' test/fixtures/bpmn/draw/boundary-event-z-index.bpmn \
 && npm run distro

RUN CHROME_PATH=$(node -e "console.log(require('puppeteer').executablePath())") \
 && printf '#!/bin/sh\nexec "%s" --no-sandbox --disable-setuid-sandbox "$@"\n' "$CHROME_PATH" > /usr/local/bin/chrome-headless \
 && chmod +x /usr/local/bin/chrome-headless

ENV PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/chrome-headless
ENV TEST_BROWSERS=ChromeHeadless

CMD ["npm", "test"]
