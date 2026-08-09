FROM oven/bun:1.3.9

WORKDIR /app/src

COPY src/package.json src/bun.lock ./
RUN bun install --frozen-lockfile

COPY src/ ./
COPY assets/ /app/assets/

CMD ["bun", "run", "bot.ts"]
