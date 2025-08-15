#!/bin/bash

echo "🎮 Starting Fukimori High School Game..."
echo "=================================="
echo ""

# Start the backend server
echo "📦 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo ""
echo "🌐 Starting public tunnel..."
npx localtunnel --port 3001 --subdomain fukimori-game &
TUNNEL_PID=$!

# Wait for tunnel to establish
sleep 5

echo ""
echo "=================================="
echo "✅ Game is running!"
echo ""
echo "🎮 Open your browser and go to:"
echo "   https://fukimori-high-school.netlify.app"
echo ""
echo "⚠️  Keep this terminal open while playing!"
echo "=================================="
echo ""
echo "Press Ctrl+C to stop the game"

# Keep the script running
wait $BACKEND_PID