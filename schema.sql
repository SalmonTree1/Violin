-- violin Database Schema
-- Run via: npx wrangler d1 execute violin-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id TEXT NOT NULL,
    track_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    album_art TEXT NOT NULL,
    ig_handle TEXT,
    school_code TEXT DEFAULT 'DEFAULT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);