# Word Guess — daily + private rooms

Node/Express API with MongoDB, plus a React (Vite) UI.

- **Global daily**: One five-letter word per **UTC calendar day** for everyone. Pick a display name **unique for that day** (UTC). Unlimited guesses. Leaderboard ranks solvers by time solved, then guess count.
- **Friends room**: Register/login with a username, create or join a room by code, host starts the game; first correct guess wins the room.

## Repo layout

```
backend/     # API (deploy to Render)
frontend/    # UI (deploy to Vercel)
render.yaml  # Optional Render Blueprint
```

## Local development

### Backend

```bash
cd backend
cp .env.example .env      # then edit — see Environment
npm install
npm run seed              # loads 5-letter words from word-list (needs MONGO_URI)
npm run dev               # default http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 — proxies /user, /room, /guess, /daily to :3000
```

Leave `VITE_API_URL` unset locally so the Vite dev server can proxy API calls.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `SECRET_KEY` | Yes | JWT signing secret |
| `FRONTEND_URL` | Production | Exact Vercel origin, e.g. `https://your-app.vercel.app` (no trailing slash). Needed for CORS + cross-site cookies. |
| `DAILY_WORD_SALT` | Recommended | Extra secret so the daily word sequence is not trivially derivable from the date |
| `NODE_ENV` | Production | Set to `production` on Render |
| `PORT` | Optional | Render sets this automatically |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render service URL, e.g. `https://word-game-api.onrender.com` (no trailing slash). **Empty** only for local dev with the Vite proxy. |

## Deploy: Render (backend)

1. Create a **Web Service**, connect the repo, **root directory** `backend`.
2. **Build**: `npm install` · **Start**: `npm start`
3. Add env vars: `MONGO_URI`, `SECRET_KEY`, `DAILY_WORD_SALT`, `NODE_ENV=production`, `FRONTEND_URL` (your Vercel URL).
4. After first deploy, run the seed once (Render **Shell** or your machine with production `MONGO_URI`):

   ```bash
   cd backend && npm run seed
   ```

Optional: connect the repo to Render and use [`render.yaml`](./render.yaml) as a Blueprint.

## Deploy: Vercel (frontend)

1. New Project → import the same repo.
2. **Root Directory**: `frontend`
3. **Framework Preset**: Vite (or Other; build command `npm run build`, output `dist`)
4. **Environment variable**: `VITE_API_URL` = your Render API URL (HTTPS).
5. Redeploy the backend with `FRONTEND_URL` set to this Vercel URL so cookies and CORS work.

Cross-origin cookies use `SameSite=None; Secure` in production; both sites must use **HTTPS**.

## API overview

### Daily (global)

| Method | Path | Auth |
|--------|------|------|
| GET | `/daily/meta` | No — `dateKey` (UTC), word length |
| GET | `/daily/leaderboard?date=YYYY-MM-DD` | No |
| POST | `/daily/enter` body `{ "displayName": "..." }` | Sets `game_daily` cookie |
| GET | `/daily/me` | Cookie |
| POST | `/daily/guess` body `{ "guess": "abcde" }` | Cookie |
| POST | `/daily/logout` | Clears cookie |

### Friends (existing)

- `POST /user/register`, `POST /user/login`, `GET /user/me`, `GET /user/logout`
- `POST /room/create`, `POST /room/join/:id`, `POST /room/start/:id`, `GET /room/status/:id`, `GET /room/leaderboard/:id`
- `POST /guess/:roomCode`

Guesses must be **five letters** and in the **seeded dictionary**.

## Notes

- **UTC day**: Daily names and the puzzle roll over at **midnight UTC**.
- Passwords are not used for friends mode (username-only); hash and add passwords if you need real accounts.
- `GET /room/getRooms` is still open for debugging — restrict or remove in production.
