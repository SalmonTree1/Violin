// violin Frontend Client Script
const API_BASE_URL = "https://aux-backend.protikhamidaziz.workers.dev";

// Generate or retrieve persistent anonymous device fingerprint (survives page refreshes)
let deviceId = localStorage.getItem("lockr_device_id");
if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem("lockr_device_id", deviceId);
}

// Fetch and render the leaderboard
async function loadLeaderboard() {
    const listContainer = document.getElementById("leaderboard-list");

    try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
        const songs = await response.json();

        // handle empty database state
        if (songs.length === 0) {
            listContainer.innerHTML = "<p class='muted'>No songs submitted yet today. Be the first!</p>";
            return;
        }

        // map song array objects into clean HTML cards using unified display_name
        listContainer.innerHTML = songs.map((song, index) => `
            <div class="song-card">
                <span class="song-rank">#${index + 1}</span>
                <img src="${song.album_art || 'https://via.placeholder.com/50'}" alt="Album Art" width="50" height="50" class="song-art">
                <div class="song-info">
                    <div class="song-title">${escapeHtml(song.display_name)}</div>
                </div>
                <div>
                    <span class="song-badge">
                        ${song.submission_count} ${song.submission_count === 1 ? 'drop' : 'drops'}
                    </span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        listContainer.innerHTML = "<p style='color: var(--error-color);'>Failed to load leaderboard.</p>";
    }
}

// handle form submission
document.getElementById("submit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // cache DOM elements
    const statusMsg = document.getElementById("status-msg");
    const submitBtn = document.getElementById("submit-btn");
    const spotifyUrlInput = document.getElementById("spotify-url");
    const igHandleInput = document.getElementById("ig-handle");

    // clean user inputs (remove accidental whitespace)
    const spotifyUrl = spotifyUrlInput.value.trim();
    const igHandle = igHandleInput.value.trim() || "Anonymous";

    // lock UI to prevent spam-clicks
    setSubmittingState(true, submitBtn, statusMsg);

    try {
        const response = await fetch(`${API_BASE_URL}/api/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                spotify_url: spotifyUrl, 
                ig_handle: igHandle,
                device_id: deviceId 
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            statusMsg.style.color = "var(--accent-color)";
            statusMsg.innerText = `Successfully dropped "${data.trackTitle}"!`;
            spotifyUrlInput.value = "";
            igHandleInput.value = "";
            loadLeaderboard(); // refresh list live
        } else {
            showError(statusMsg, data.error || "Failed to submit song.");
        }
    } catch (err) {
        console.error("Submission error:", err);
        showError(statusMsg, "Error connecting to backend server.");
    } finally {
        // always unlock UI regardless of success or failure
        setSubmittingState(false, submitBtn, statusMsg);
    }
});

function setSubmittingState(isSubmitting, btn, msg) {
    btn.disabled = isSubmitting;
    btn.innerText = isSubmitting ? "Dropping..." : "Drop Song";
    if (isSubmitting) {
        msg.style.color = "var(--accent-color)";
        msg.innerText = "Fetching metadata & saving to aux...";
    }
}

function showError(msgElement, text) {
    msgElement.style.color = "var(--error-color)";
    msgElement.innerText = `Error: ${text}`;
}

// basic security helper to prevent HTML injection
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// kick off execution on page load
loadLeaderboard();