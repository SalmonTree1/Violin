CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    album_art TEXT NOT NULL,
    ig_handle TEXT,
    device_id TEXT NOT NULL,
    school_code TEXT DEFAULT 'DEFAULT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);