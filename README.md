📊 ChatGPT Wrapped 2025

Spotify Wrapped… but for ChatGPT users.

This project is a full-screen, interactive, Spotify-Wrapped–style website that visualizes a person’s ChatGPT usage over a year using fake-but-believable data.

No real ChatGPT data is accessed.
This is about vibes, eras, chaos, and big numbers.

✨ What this is

ChatGPT Wrapped 2025 turns estimated chat behavior into:

Big animated stats

“Eras” that describe phases of the year

Habits & quirks

Unhinged but believable facts

A dramatic Spotify-style outro

Everything is driven by one config file.

🧠 How it works (high level)
1️⃣ config.json = the brain

All content comes from one file:

config.json

Change values → the site updates automatically.
No JavaScript editing required.

2️⃣ Slide system (Spotify Wrapped style)

Full-screen vertical slides

One slide visible at a time

Scroll, swipe, keyboard, or navigation dots

Slides “lock” in place like real Spotify Wrapped

Each slide has:

A theme color

Text content

Animated SVG decorations

Stats or lists generated from config.json

3️⃣ Stats & animated counters

Stats such as:

total messages

active days

longest streak

brain-rot index

Animate from 0 → final value when the slide becomes visible, creating that classic “reveal” effect.

All values come from:

config.json.stats

4️⃣ Eras, habits & unhinged facts

Story-driven sections powered by arrays:

eras[] → phases of the year

unhingedFacts[] → funny, chaotic highlights

This turns raw numbers into an actual narrative instead of boring analytics.

5️⃣ SVG visuals

SVGs are:

reused across slides

resized, rotated, faded

layered behind text but above the background

This keeps performance high while still looking animated and Spotify-coded.

6️⃣ Fake-but-believable data (important)

Because real ChatGPT usage data is not accessible:

all stats are estimates

intentionally realistic

meant for fun, not analytics

This is a design choice, not a limitation.

📁 Required folder structure

Your repository must look like this:

/
├─ index.html
├─ style.css
├─ script.js
├─ config.json
│
├─ svgs/
│ ├─ hero.svg
│ ├─ wave.svg
│ ├─ blob.svg
│ ├─ badge.svg
│ └─ sparkles.svg
│
└─ music/
(optional / currently unused)

Only config.json is meant to be edited by users.

✏️ How to customize your own Wrapped

Fork or download this repository

Open config.json

Edit:

stats

eras

unhinged facts

Save and refresh the site

That’s it.

🪄 Universal ChatGPT Prompt (JSON Generator)

Anyone can generate their own compatible config.json using ChatGPT.

✅ Copy & paste this into ChatGPT:

Create a JSON file for a fake “ChatGPT Wrapped 2025” website.

Rules:

Output ONLY valid JSON.

Do NOT include explanations, comments, or markdown.

Match the structure exactly.

Context:
Pretend you are summarizing my ChatGPT usage for the year.
Make the stats feel realistic, slightly unhinged, and Gen-Z coded.
This is NOT real data — it’s a fun recap.

JSON structure to follow exactly:

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

totalMessages: between 5,000 and 50,000

activeDays: between 50 and 365

brainrot: between 60 and 100

eras should sound like phases of a year

unhingedFacts should be funny but believable

playlist can stay as a placeholder

Now generate the JSON.

✅ How to use the generated JSON

Copy ChatGPT’s output

Paste it into config.json

Save the file

Refresh the website

Instant personalized Wrapped.

⚠️ Disclaimer

This project does not access real ChatGPT data

It is not affiliated with OpenAI or Spotify

It exists purely for fun, vibes, and frontend experimentation

🥀 Final note

“What if Spotify Wrapped… but for people who talk to ChatGPT at 3am?”

That’s this project.
