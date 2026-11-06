```
[ Mobile User Browser ]
       │
       ├── 1. GET /api/leaderboard ──┐
       │                             ▼
       │                   [ Cloudflare Worker API ] 
       │                   (Runs in JavaScript / Edge)
       │                             │
       │                   Queries SQL Database
       │                             │
       │                             ▼
       │                    [ Cloudflare D1 SQLite ]
       │                    (Stores track metadata & IG handles)
       │
       └── 2. POST /api/submit ──────┐
                                     ▼
                           [ Spotify oEmbed API ]
                           (Grabs Title, Artist, Cover Art)
                                     │
                                     ▼
                           [ Writes new row to D1 ]
```