# MERN Algorithm Visualizer

A polished **Algorithm Visualizer** built with the **MERN stack**:

- **Client**: React + TypeScript + Vite + Tailwind
- **Server**: Express + MongoDB (Mongoose)
- **Features**:
  - Sorting visualizer (Bubble / Selection / Insertion / Merge / Quick)
  - Pathfinding visualizer (Dijkstra / A*)
  - Save + load **presets** to MongoDB

## Run locally

### 1) Install

From the project root:

```bash
npm install
```

### 2) Configure env

- Copy `server/.env.example` → `server/.env`
- Copy `client/.env.example` → `client/.env` (optional; defaults to `http://localhost:4000`)

Example MongoDB URI (local MongoDB):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/algorithm_visualizer
```

### 3) Start client + server (one command)

```bash
npm run dev
```

- Client: `http://localhost:5173` (or next free port)
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Presets API

- `GET /api/presets?kind=sorting|pathfinding`
- `POST /api/presets`

Payload:

```json
{
  "kind": "sorting",
  "name": "My preset name",
  "data": { "any": "json" }
}
```

## Upload to GitHub

### Option A: GitHub Desktop

- Open GitHub Desktop
- Add existing repository → select `F:\new project`
- Publish repository

### Option B: Command line (PowerShell)

From the project root:

```powershell
git init
git add .
git commit -m "Initial commit: MERN algorithm visualizer"
```

Create a new repo on GitHub, then:

```powershell
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Notes

- Don’t commit secrets: `.env` is ignored; use the provided `*.env.example` files.

