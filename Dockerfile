FROM node:22-slim

WORKDIR /app

# Enable corepack so pnpm is available without npm install -g
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy all source files
COPY . .

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build frontend then API
RUN BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/slideo run build && \
    pnpm --filter @workspace/api-server run build

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
