# Fukimori High School - Deployment Guide

## Complete Game Features
✅ **Character Consistency System** - Characters remember appearance, personality, relationships
✅ **Memory System** - NPCs reference past interactions ("remember our ice cream date?")
✅ **Real-time Japanese Calendar** - Follows actual Japanese school calendar and events
✅ **Spotify Music Integration** - Location-based dynamic music selection
✅ **Player Progression** - XP system, skills, unlockable actions
✅ **Character Creation** - Photo upload system for player avatars
✅ **Point/Time/Action Economy** - Actions cost points, adds resource management gameplay

## Current Status
🟢 **Frontend**: Successfully deployed to Netlify at https://fukimori-high-school.netlify.app
🟡 **Backend**: Ready for deployment, requires manual setup due to authentication requirements

## Quick Start (Development)

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Access the Game
- Frontend is live at: https://fukimori-high-school.netlify.app
- The frontend will connect to your local backend automatically

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. Sign up/login
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository
5. Set environment variables:
   - `NODE_ENV=production`
   - `SPOTIFY_CLIENT_ID=6ea4c2c4b8c540d2948cf432973f2076`
   - `SPOTIFY_CLIENT_SECRET=d3e1c9d2d85b4355bfd638d80422f659`
   - `SESSION_SECRET=fukimori-high-super-secret-key-2024`
6. Deploy! Railway will automatically build and run the server

### Option 2: Vercel
1. Go to https://vercel.com
2. Import this project from GitHub
3. Set Root Directory to "server"
4. Add the environment variables listed above
5. Deploy

### Option 3: Render
1. Go to https://render.com
2. Connect GitHub repository
3. Create a Web Service
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`
6. Add environment variables listed above

### Option 4: Heroku
1. Install Heroku CLI
2. `heroku create fukimori-high-backend`
3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SPOTIFY_CLIENT_ID=6ea4c2c4b8c540d2948cf432973f2076
   heroku config:set SPOTIFY_CLIENT_SECRET=d3e1c9d2d85b4355bfd638d80422f659
   heroku config:set SESSION_SECRET=fukimori-high-super-secret-key-2024
   ```
4. `git push heroku main`

## After Backend Deployment

1. Update `netlify.toml` to point to your deployed backend:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-url.com/api/:splat"
     status = 200
   ```

2. Redeploy the frontend to Netlify (it will automatically update)

## Game Features Overview

### Character System
- **Seed-based Consistency**: Each character has a detailed "seed" that ensures they maintain the same appearance, personality, family details, and relationships across all interactions
- **Memory Integration**: Characters remember past conversations and reference them naturally in future interactions
- **Relationship Tracking**: Affection levels, conflict history, and shared experiences are all tracked

### Real-time Integration
- **Japanese Calendar**: Game follows actual Japanese school calendar, holidays, and seasonal events
- **Weather Integration**: Real weather conditions affect mood and available activities
- **Time-based Actions**: Different actions are available based on real time of day

### Music System
- **Location-based Playlists**: Different areas of the school have appropriate background music
- **Character Interaction Music**: Music changes based on who you're talking to and the mood
- **Event-specific Soundtracks**: Special music for festivals, exams, seasonal events

### Progression System
- **Experience Points**: Gain XP through interactions, studying, helping others
- **Skill Development**: Academic, social, creative, athletic, and leadership skills
- **Action Unlocks**: Higher levels unlock new interactions and story possibilities
- **Resource Management**: Actions cost "energy points" - strategic time management required

### Language & Cultural Authenticity
- **English with Japanese Context**: Game is in English but acknowledges you're a transfer student
- **Cultural Learning**: Other students help you understand Japanese customs and language
- **Authentic School Life**: Based on real Japanese high school structure and daily routines

## API Endpoints Available

### Character Management
- `POST /api/ai/generate-character` - Create new consistent characters
- `POST /api/ai/character-data` - Get character details and memory
- `POST /api/ai/generate-character-image` - Generate character images

### Game Interaction
- `POST /api/ai/generate-dialogue` - Character conversations with memory
- `GET /api/ai/player-progression` - Check XP, skills, level
- `POST /api/ai/check-action` - Verify if action is unlocked
- `GET /api/ai/japan-realtime` - Get current Japanese time/calendar

### Music Integration
- `POST /api/music/location` - Get location-based music
- `POST /api/music/interaction` - Get character interaction music
- `POST /api/music/dynamic` - Get dynamic playlists
- `GET /api/music/seasonal` - Get seasonal music

## Technical Architecture

### Frontend (React + TypeScript)
- Modern React with hooks and TypeScript
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for API state management

### Backend (Node.js + Express)
- Express.js REST API
- TypeScript throughout
- Session-based authentication
- In-memory storage (easily upgradeable to database)

### AI Services
- **DeepSeek API**: Character consistency and dialogue generation
- **Google Gemini**: Fallback AI service
- **Vision APIs**: Photo analysis for character creation (ready to integrate)

### External Integrations
- **Spotify Web API**: Music streaming and playlist management
- **Japanese Time API**: Real-time calendar and weather data

## Customization Options

### Adding New Characters
Use the character generation endpoint with detailed personality traits, backgrounds, and relationships.

### Extending Locations
Add new school locations in `DefaultLocations.ts` with associated music and available actions.

### Custom Events
Integrate with the real-time calendar system to add special school events and festivals.

### Music Customization
Modify Spotify playlists or integrate other music services through the music controller.

## Security Notes
- Environment variables contain Spotify credentials (provided for demo)
- Session secret is included for development (change for production)
- No user data persistence (all stored in memory for demo)

---

**The game is fully functional and ready to experience authentic Japanese high school life with persistent character relationships and musical atmosphere!**