# 📊 ChatGPT Wrapped 2025

**Spotify Wrapped — but for ChatGPT users.**

This project is a **full-screen, interactive, Spotify-Wrapped–style website** that visualizes a person’s ChatGPT usage over a year using **fake-but-believable data**.

> No real ChatGPT data is accessed.  
> This project is about **vibes, eras, chaos, and big numbers** 🥀

---

## ✨ What this is

**ChatGPT Wrapped 2025** turns estimated chat behavior into:

- **Big animated statistics**
- **“Eras”** that describe phases of the year
- **Habits & quirks**
- **Unhinged but believable facts**
- **A dramatic Spotify-style finale**

Everything is powered by **one simple config file**.

---

## 🧠 How it works

### 1️⃣ `config.json` — the brain

All visible content comes from **one file**:

config.json

- Change values → refresh → site updates instantly  
- No JavaScript editing needed  
- Safe to edit for anyone

---

### 2️⃣ Slide system (Spotify Wrapped style)

- Full-screen vertical slides  
- Only **one slide visible at a time**
- Scroll / swipe / arrow key navigation
- Slides **lock** into place like real Spotify Wrapped

Each slide contains:
- A theme color
- Animated SVG visuals
- Text generated from `config.json`

---

### 3️⃣ Animated stats & counters

Stats like:

- Total messages
- Active days
- Longest streak
- Brain-rot index

Animate from **0 → final value** when the slide appears.

Classic Spotify dopamine moment.

---

### 4️⃣ Eras, habits & unhinged facts

Story-driven sections powered by arrays:

- `eras[]` → phases of the year
- `unhingedFacts[]` → chaotic highlights

This turns boring numbers into an actual **timeline of vibes**.

---

### 5️⃣ SVG visuals

SVG files are:

- Reused across slides
- Resized, rotated, faded
- Layered **behind text but above the background**

This keeps performance high while staying Spotify-coded.

---

### 6️⃣ Fake-but-believable data (important)

- No real ChatGPT usage data exists
- All stats are **estimates**
- Designed to feel realistic and funny

This is intentional.

---

## 📁 Required folder structure

Your repository **must** look like this:

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
(optional / unused)

✅ Only `config.json` is meant to be edited.

---

## ✏️ Customize your own Wrapped

1. Fork or download the repo  
2. Open `config.json`  
3. Edit:
   - Stats
   - Eras
   - Unhinged facts  
4. Save & refresh  

Done 🥀

---

## 🪄 Universal ChatGPT Prompt (JSON Generator)

Anyone can generate a **fully compatible `config.json`** using ChatGPT.

### ✅ Copy & paste this prompt into ChatGPT:

Create a JSON file for a fake “ChatGPT Wrapped 2025” website.

Rules:

Output ONLY valid JSON

No explanations, comments, or markdown

Follow the structure exactly

Context:
Pretend you are summarizing my ChatGPT usage for the year.
Make stats realistic, a bit unhinged, and Gen-Z coded.
This is fake data for fun.

JSON structure:

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

totalMessages: 5,000–50,000

activeDays: 50–365

brainrot: 60–100

Eras should sound like phases of a year

Unhinged facts should be funny but believable

Now generate the JSON.

yaml
Copy code

---

## ✅ Using the generated JSON

1. Copy the output  
2. Paste into `config.json`  
3. Save  
4. Refresh the site  

Your Wrapped is live.

---

## ⚠️ Disclaimer

- Not affiliated with OpenAI or Spotify  
- No real user data is accessed  
- Made purely for fun, design, and frontend chaos  

---

## 🥀 Final note

**“What if Spotify Wrapped… but for people who talk to ChatGPT at 3am?”**

Yeah.  
That’s this project.
