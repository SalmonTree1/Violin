# Violin

Violin is a minimalist free music leaderboard transforming song submissions into a daily ranking, allowing users to express their music taste and compete for the #1 spot on campus.

## General Architecture
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

## Contributing

Pull requests are welcome. For major architectural changes or feature additions, please open an issue first to discuss what you would like to change.

Please make sure to verify API endpoints and database schema migrations before submitting pull requests.

## License

[MIT](https://choosealicense.com/licenses/mit/)
