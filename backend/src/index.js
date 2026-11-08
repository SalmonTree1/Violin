// violin Worker Backend API
// Entry point for Spotify metadata fetching and D1 DB execution

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // preventing cors errors
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // empty response with cors permissions
        if (method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // GET /api/leaderboard
        if (path === "/api/leaderboard" && method === "GET") {
            const query = `
                SELECT 
                    track_id, 
                    display_name, 
                    album_art, 
                    COUNT(*) as submission_count 
                FROM submissions 
                WHERE created_at >= datetime('now', '-24 hours')
                GROUP BY track_id 
                ORDER BY submission_count DESC 
                LIMIT 10
            `;

            const { results } = await env.DB.prepare(query).all();

            return new Response(JSON.stringify(results), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // POST /api/submit
        if (path === "/api/submit" && method === "POST") {
            const body = await request.json();
            const spotifyUrl = body.spotify_url;
            const igHandle = body.ig_handle || "Anonymous";
            
            // basic safety check for valid Spotify track link structure
            if (!spotifyUrl || !spotifyUrl.includes("open.spotify.com/track/")) {
                return new Response(JSON.stringify({ error: "Invalid Spotify track link" }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            // fetch metadata from Spotify oEmbed API safely
            const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
            const spotifyResponse = await fetch(oembedUrl);

            if (!spotifyResponse.ok) {
                return new Response(JSON.stringify({ error: "Could not fetch track metadata from Spotify. Check the link." }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            const metadata = await spotifyResponse.json();

            // DEBUGGING: This prints the exact raw JSON object from Spotify to your console if you run wrangler dev
            console.log("Spotify oEmbed Payload:", JSON.stringify(metadata));

            // Construct a clean unified single-line display name
            // Spotify oEmbed title typically returns just the track name, but let's make sure it's never empty
            let displayName = metadata.title || "Unknown Track";
            
            // If author_name happens to exist in some contexts, append it nicely
            if (metadata.author_name && metadata.author_name !== displayName) {
                displayName = `${metadata.author_name} - ${displayName}`;
            }

            const albumArt = metadata.thumbnail_url || "";

            // extract unique track ID for grouping votes
            const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
            const trackId = trackIdMatch ? trackIdMatch[1] : "unknown";

            // store submission in D1 database using the new schema
            const insertQuery = `
                INSERT INTO submissions (track_id, display_name, album_art, ig_handle)
                VALUES (?, ?, ?, ?)
            `;

            await env.DB.prepare(insertQuery)
                .bind(trackId, displayName, albumArt, igHandle)
                .run();

            return new Response(JSON.stringify({ success: true, trackTitle: displayName }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response("Violin API is active!", { status: 200, headers: corsHeaders });
    }
};