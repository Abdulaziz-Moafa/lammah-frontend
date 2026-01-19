# Lamma - Fun Group Trivia Game

A modern, responsive web application for hosting and playing team-based trivia games. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- 📱 **Mobile-first responsive design** - Works on phones, tablets, and TVs
- 👥 **Team-based gameplay** - Two teams compete in real-time
- 🎯 **Category selection** - Teams take turns choosing categories
- ⚡ **Power-ups** - Special abilities to gain advantages
- 🔄 **Real-time sync** - WebSocket-based live updates
- 🔐 **Phone-based auth** - OTP login flow
- 📊 **Admin panel** - Moderation and content management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.IO Client
- **API Client**: Axios
- **Animations**: Framer Motion

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Login/OTP pages
│   ├── dashboard/         # User dashboard
│   ├── create/            # Create match page
│   ├── join/              # Join match page
│   ├── match/[matchId]/   # Match pages (lobby, play, results)
│   └── admin/             # Admin panel
├── components/
│   ├── ui/                # Base UI components (Button, Input, Card, etc.)
│   ├── game/              # Game-specific components
│   └── shared/            # Shared components (FileUploader, etc.)
├── lib/
│   ├── api/               # API client and endpoints
│   └── socket/            # WebSocket client
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── lib/utils.ts          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lamma-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_NAME=Lamma
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t lamma-frontend .

# Run the container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-api-host:3000 \
  -e NEXT_PUBLIC_WS_URL=ws://your-api-host:3000 \
  lamma-frontend
```

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Build Arguments

You can pass build-time arguments to configure the app:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://api.example.com \
  --build-arg NEXT_PUBLIC_WS_URL=ws://api.example.com \
  --build-arg NEXT_PUBLIC_APP_URL=https://lamma.example.com \
  -t lamma-frontend .
```

## API Endpoints Used

### Authentication
- `POST /auth/otp/request` - Request OTP
- `POST /auth/otp/verify` - Verify OTP
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - Logout

### Matches
- `POST /matches` - Create match
- `POST /matches/join` - Join match
- `POST /matches/start` - Start match
- `POST /matches/end` - End match
- `POST /matches/answer` - Submit answer
- `POST /matches/powerups` - Use power-up
- `GET /matches/:matchId/snapshot` - Get match state

### Other
- `POST /credits/grant` - Grant credits
- `POST /credits/spend` - Spend credits
- `POST /referrals/invite` - Create invite
- `POST /referrals/activate` - Activate referral
- `POST /media/presign` - Get upload URL
- `POST /media/finalize` - Finalize upload
- `POST /admin/moderation` - Moderate content
- `POST /ingest/questions/batch` - Batch import
- `GET /ingest/batches/:id` - Get batch status

## WebSocket Events

### Emitted Events
- `lobby.join` - Join lobby
- `lobby.leave` - Leave lobby
- `match.answer` - Submit answer
- `category.select` - Select category
- `powerup.use` - Use power-up

### Received Events
- `player.joined` - Player joined
- `player.left` - Player left
- `team.assigned` - Team assignment
- `match.state` - Match state update
- `match.started` - Match started
- `match.timer` - Timer update
- `category.selected` - Category selected
- `question.new` - New question
- `answer.submitted` - Answer result
- `powerup.used` - Power-up used
- `match.ended` - Match ended

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Lamma` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3001` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.
