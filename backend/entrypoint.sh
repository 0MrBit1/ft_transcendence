#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Only seed if explicitly requested via environment variable
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Running database seed..."
  npx prisma db seed
else
  echo "⏭️  Skipping seed (set RUN_SEED=true to enable)"
fi

echo "🏗️  Building NestJS application..."
npx nest build

echo "🚀 Starting NestJS in watch mode..."
exec npm run dev
