# ♟️ Chess

A simple, room-based, real-time 2-player chess app. Create a room, share the code with your opponent, play.

**Live demo:** https://client-olive-kappa.vercel.app

> Note: the backend runs on Render's free tier, so it spins down after inactivity — the first request after idle can take 30-60 seconds.

## Features

- Create a room / join by room code (each room holds exactly 2 players)
- Real-time move sync (Socket.io)
- Move rules validated with [chess.js](https://github.com/jhlywa/chess.js) on both client and server (the server is the source of truth, to guard against cheating/desync)
- Checkmate / stalemate / draw detection

## Tech Stack

- **Server**: Node.js, Express, Socket.io
- **Client**: React (Vite), [react-chessboard](https://github.com/Clariity/react-chessboard), socket.io-client

## Setup

```bash
# server
cd server
cp .env.example .env
npm install
npm run dev      # http://localhost:3001

# client (in a separate terminal)
cd client
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

## Project structure

```
client/   React + Vite frontend
server/   Express + Socket.io backend (room management, move validation)
```

See [CLAUDE.md](./CLAUDE.md) for architecture details, the socket event contract, and deployment notes.
