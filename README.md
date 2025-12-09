# wrapped2025
📊 ChatGPT Wrapped 2025 — Documentation
What this project is

This is a Spotify Wrapped–style interactive website that visualizes a person’s ChatGPT usage for a year.

It turns chat behavior into:

big stats

“eras” and phases

habits & quirks

unhinged fun facts

a dramatic Spotify-style outro

All data is fake or user-provided (no real ChatGPT data access) but designed to feel believable and accurate.

The site runs fully in the browser using:

HTML

CSS

Vanilla JavaScript
No frameworks. Works offline. Deployable on GitHub Pages.

🧠 How it works (high-level)
1. config.json = the brain

Everything shown on the site comes from one file:

config.json


Change the values → the visuals, text, stats, and vibe all update automatically.

No code edits needed.

2. Slides system (Spotify-style)

The site is split into full-screen slides

Only one slide is visible at a time

Scroll / swipe / dots = move between slides

Slides “lock” like real Spotify Wrapped

Each slide has:

a theme color

text content

animated SVG decorations

stats or lists generated from config.json

3. Stats & counters

Numbers (messages, days, streaks, brainrot):

start at 0

animate upward when the slide becomes visible

are driven directly by values in config.json.stats

This gives that “big number reveal” effect.

4. Eras, habits, unhinged facts

Lists are built dynamically from arrays:

eras[]

unhingedFacts[]

This lets people tell a story of their year, not just dump numbers.

5. SVG visuals

SVGs are reused across slides:

resized

rotated

faded

layered behind text

This keeps performance high while still looking animated and chaotic.

6. Fake-but-believable data

Because real ChatGPT usage data isn’t accessible:

stats are estimates

labeled and implied as fun / unofficial

meant for vibes, not analytics

This is intentional.

📁 Folder structure (required)
/
├─ index.html
├─ style.css
├─ script.js
├─ config.json
│
├─ svgs/
│  ├─ hero.svg
│  ├─ wave.svg
│  ├─ blob.svg
│  ├─ badge.svg
│  └─ sparkles.svg
│
└─ music/   (optional, currently unused)


Only config.json is meant to be edited by users.

✏️ How to customize your own Wrapped

Fork or download the repo

Open config.json

Change:

stats

eras

unhinged facts

Refresh the site

That’s it.

🪄 Universal ChatGPT Prompt (JSON Generator)

Anyone can copy-paste this into ChatGPT to generate a compatible config.json.

✅ Paste this into ChatGPT:
Create a JSON file for a fake “ChatGPT Wrapped 2025” website.

Rules:
- Output ONLY valid JSON.
- Do NOT include explanations or markdown.
- Match this exact structure.

Context:
Pretend you are summarizing my ChatGPT usage for the year.
Make the stats feel realistic, slightly unhinged, and Gen-Z coded.
This is NOT real data — it’s a fun recap.

JSON STRUCTURE:

{
  "stats": {
    "totalMessages": number,
    "activeDays": number,
    "longestStreak": number,
    "peakHours": string,
    "brainrot": number
  },

  "eras": [
    "string"
  ],

  "unhingedFacts": [
    "string"
  ],

  "playlist": [
    { "title": "string", "src": "music/track1.mp3" }
  ],

  "themeColors": {
    "green": ["#061006", "#042814"],
    "purple": ["#0b0520", "#2b0f6a"],
    "blue": ["#051027", "#0a2b52"],
    "red": ["#2b0707", "#5b0f0f"]
  }
}

Guidelines:
- totalMessages: 5,000–50,000
- activeDays: 50–365
- brainrot: 60–100
- eras should sound like phases of a year
- unhingedFacts should be funny but believable
- playlist can stay as placeholder

Now generate the JSON.

✅ How to use it

Copy the output

Paste it into config.json

Save

Refresh the site

Instant personalized Wrapped.

⚠️ Disclaimer

This project:

does not access real ChatGPT data

is not affiliated with OpenAI or Spotify

is for fun, vibes, and frontend experimentation only

🥀 Final note

This project is basically:

“What if Spotify Wrapped, but for ChatGPT addicts.”

If someone understands this site, they understand the internet.
