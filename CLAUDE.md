# Satranç (Chess) — Real-time 2-Player Chess

Basit, oda tabanlı, iki kişilik gerçek zamanlı satranç uygulaması.

## Tech Stack

- **Server**: Node.js, Express, Socket.io — `server/`
- **Client**: React (Vite), react-chessboard v5, socket.io-client — `client/`
- **Chess engine**: [chess.js](https://github.com/jhlywa/chess.js) — used on **both** server and client.
  - Server is authoritative: every move is validated with a server-side `Chess` instance per room before being broadcast.
  - Client keeps its own local `Chess` instance for instant UI feedback (drag validity, legal-move check) and to render the board from FEN.

## Architecture

- No database — everything is in-memory (a `Map` of rooms in `server/src/rooms.js`). Restarting the server wipes all rooms/games.
- No authentication. A "room" is just a random 5-character code. Whoever creates a room is white; whoever joins second is black. A third joiner is rejected (`ROOM_FULL`).
- No reconnection support: if a player refreshes/disconnects, they are removed from the room and the room is deleted once both players are gone (see `removePlayerFromAllRooms`). This is a known simplification, not a bug — acceptable for a casual/simple app.
- Client has no router; `App.jsx` just toggles between `Home` (create/join) and `Game` based on local state.

## Socket.io event contract

Client → Server (all with an ack callback):
- `room:create` `{}` → `{ roomId, color: 'w', fen, opponentConnected: false }`
- `room:join` `{ roomId }` → `{ roomId, color: 'b', fen, opponentConnected: true }` or `{ error }`
- `game:move` `{ roomId, from, to, promotion }` → `{ ok: true }` or `{ error }`

Server → Client (broadcast to room):
- `room:opponent-joined` — sent to the room creator when the second player joins.
- `room:opponent-left` — sent when a player disconnects.
- `game:move` `{ move, fen, status }` — sent to **both** players after a valid move. `status` = `{ isGameOver, isCheckmate, isDraw, isStalemate, turn }`.

Error codes (used as `{ error: 'CODE' }`, mapped to Turkish text in `client/src/errorMessages.js`):
`ROOM_NOT_FOUND`, `ROOM_FULL`, `ALREADY_IN_ROOM`, `NOT_IN_ROOM`, `WAITING_FOR_OPPONENT`, `NOT_YOUR_TURN`, `ILLEGAL_MOVE`.

## Dev commands

```bash
# server
cd server
cp .env.example .env
npm install
npm run dev        # nodemon-less watch via `node --watch`, http://localhost:3001

# client
cd client
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
npm run build
```

Env vars:
- `server/.env`: `PORT` (default 3001), `CLIENT_ORIGIN` (CORS allow-origin, default `http://localhost:5173`)
- `client/.env`: `VITE_SERVER_URL` (Socket.io server URL, default `http://localhost:3001`)

## Deployment

Socket.io needs a long-lived connection — **Vercel serverless functions can't host it**. Split deploy:
- Client (`client/`) → Vercel: https://client-olive-kappa.vercel.app
- Server (`server/`) → Render (Blueprint from `render.yaml` at repo root): https://chess-server-pfip.onrender.com
  - Free plan spins down after inactivity; first request after idle can take ~30-60s to wake up.
- Env vars set: `VITE_SERVER_URL` (Vercel, production) → Render URL; `CLIENT_ORIGIN` (Render, via `render.yaml`) → Vercel URL.
- To redeploy client after changes: `cd client && vercel --prod`.
- To redeploy server: push to `main` — Render auto-deploys from GitHub on push (blueprint sync).
- Repo: https://github.com/aygunbayirdev/chess

## Known limitations / possible next steps

- No reconnect-to-game-in-progress flow.
- No spectator mode, no draw offer/resign buttons, no move history/PGN display.
- No persistence — server restart loses all games.
- `Home.jsx`'s "leave room" just disconnects/reconnects the socket (`App.jsx`); this drops the player from the room but doesn't warn the opponent beyond the standard `room:opponent-left` event.
