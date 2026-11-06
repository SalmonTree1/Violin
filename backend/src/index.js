// violin Worker Backend API
// Entry point for Spotify metadata fetching and D1 DB execution

export default {
    async fetch(request, env, ctx) {
        // TODO: Write CORS headers, GET /api/leaderboard, and POST /api/submit endpoints
        return new Response("violin API Ready", { status: 200 });
    }
};