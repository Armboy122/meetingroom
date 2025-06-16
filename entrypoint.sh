#!/bin/sh

echo "🚀 Starting Meeting Room Booking Application..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database not ready, waiting 2 seconds..."
  sleep 2
done

echo "✅ Database connection established!"

# Check if database has been seeded (check if any table has data)
SEED_CHECK=$(echo "SELECT COUNT(*) as count FROM \"MeetingRoom\";" | npx prisma db execute --stdin 2>/dev/null | grep -o '[0-9]\+' | tail -1)

if [ "$SEED_CHECK" = "0" ] || [ -z "$SEED_CHECK" ]; then
  echo "🌱 First time setup - Running database seed..."
  npx prisma db seed
  echo "✅ Database seeded successfully!"
else
  echo "📊 Database already contains data, skipping seed..."
fi

echo "🎯 Starting application..."
exec npm run start 