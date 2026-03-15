FROM node:20-alpine

WORKDIR /app

# Install deps first (cached layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY . .

EXPOSE 4000

# Dev: run migrations, seed, then start watch mode
CMD sh -c "npx prisma migrate deploy && npx prisma db seed && npm run dev"
