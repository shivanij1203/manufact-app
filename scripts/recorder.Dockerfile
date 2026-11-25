# Headless Chromium (from the Playwright image), the matching playwright package, and ffmpeg for the GIF.
FROM mcr.microsoft.com/playwright:v1.49.1-noble
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/rec
RUN npm init -y >/dev/null && npm install --ignore-scripts --no-audit --no-fund playwright@1.49.1
USER pwuser
