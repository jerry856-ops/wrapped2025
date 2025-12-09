/* script.js — Final stable file */

/* ---------------------------
   Helper / Globals
   --------------------------- */
const slides = Array.from(document.querySelectorAll('.panel'));
const dotsRoot = document.getElementById('dots');
const playerRoot = document.getElementById('playerRoot');
const playerToggle = document.getElementById('playerToggle');
const playerPanel = document.getElementById('playerPanel');

let idx = 0;
let navLock = false;
let config = null;

// set initial layout (stacked vertically)
function layoutSlides() {
  slides.forEach((s, i) => {
    s.style.transform = `translateY(${(i - idx) * 100}vh)`;
    // set base theme colors as CSS variables
    const theme = s.dataset.theme || 'green';
    s.style.setProperty('--base1', getThemeColor(theme, 0));
    s.style.setProperty('--base2', getThemeColor(theme, 1));
  });
}
layoutSlides();

/* ---------------------------
   Load config.json & fill content
   --------------------------- */
async function loadConfig() {
  try {
    const res = await fetch('config.json');
    config = await res.json();
    populateFromConfig();
    buildPlaylist();
    animateCountersWhenVisible(); // initial check
    updateRecapValues();
  } catch (e) {
    console.error('Failed to load config.json', e);
  }
}

function populateFromConfig(){
  // counters (elements with .counter and data-key)
  document.querySelectorAll('.counter').forEach(el=>{
    const key = el.dataset.key;
    if (config && key in config) {
      el.textContent = '0'; // will animate later
    } else {
      el.textContent = el.textContent || '—';
    }
  });
  // peak hours
  const ph = document.getElementById('peakHours');
  if(ph) ph.textContent = config.peakHours || '—';

  // eras list
  const erasList = document.getElementById('erasList');
  if(erasList){
    erasList.innerHTML = '';
    (config.eras || []).forEach(s => {
      const li = document.createElement('li'); li.textContent = s;
      erasList.appendChild(li);
    });
  }

  // facts list
  const factsList = document.getElementById('factsList');
  if(factsList){
    factsList.innerHTML = '';
    (config.unhingedFacts || []).forEach(f => {
      const li = document.createElement('li'); li.textContent = f;
      factsList.appendChild(li);
    });
  }
}

/* ---------------------------
   Theme color helper
   --------------------------- */
function getThemeColor(theme, idxColor){
  // fallback colors
  const defaults = {
    green: ['#061006','#042814'],
    purple: ['#0b0520','#2b0f6a'],
    blue: ['#051027','#0a2b52'],
    red: ['#2b0707','#5b0f0f']
  };
  if(config && config.themeColors && config.themeColors[theme]) {
    return config.themeColors[theme][idxColor] || defaults[theme][idxColor];
  }
  return defaults[theme][idxColor];
}

/* ---------------------------
   Slide navigation & dots
   --------------------------- */
function buildDots() {
  dotsRoot.innerHTML = '';
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.title = slides[i].dataset.title || `Slide ${i+1}`;
    btn.addEventListener('click', () => goTo(i));
    if(i === idx) btn.classList.add('active');
    dotsRoot.appendChild(btn);
  });
}
buildDots();

function updateDots() {
  Array.from(dotsRoot.children).forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });
}

function goTo(i) {
  idx = Math.max(0, Math.min(i, slides.length - 1));
  layoutSlides();
  updateDots();
  animateCountersWhenVisible();
  applyThemeToBody();
}

function applyThemeToBody(){
  // Change body background by mixing the slide base colors and a dynamic --bgshift
  const currentSlide = slides[idx];
  const base1 = getComputedStyle(currentSlide).getPropertyValue('--base1') || '#061006';
  const base2 = getComputedStyle(currentSlide).getPropertyValue('--base2') || '#042814';
  document.body.style.background = `linear-gradient(180deg, ${base1}, ${base2})`;
}

/* wheel debounce lock */
let wheelTimeout;
window.addEventListener('wheel', e => {
  if(navLock) return;
  navLock = true;
  goTo(idx + (e.deltaY > 0 ? 1 : -1));
  clearTimeout(wheelTimeout);
  wheelTimeout = setTimeout(()=> navLock = false, 650);
}, {passive:true});

/* touch swipe support */
let touchStartY = null;
window.addEventListener('touchstart', e => { if(e.touches && e.touches[0]) touchStartY = e.touches[0].clientY; }, {passive:true});
window.addEventListener('touchend', e => {
  if(touchStartY === null) return;
  const dy = (e.changedTouches[0].clientY - touchStartY);
  if(Math.abs(dy) > 50) {
    goTo(idx + (dy < 0 ? 1 : -1));
  }
  touchStartY = null;
}, {passive:true});

/* keyboard nav */
window.addEventListener('keydown', e => {
  if(e.key === 'ArrowDown') goTo(idx + 1);
  if(e.key === 'ArrowUp') goTo(idx - 1);
});

/* initialize layout and theme */
goTo(0);

/* ---------------------------
   Counters (animate when slide visible)
   --------------------------- */
function isSlideVisible(i) {
  return i === idx;
}

function animateCountersWhenVisible(){
  slides.forEach((s, i) => {
    if(isSlideVisible(i)) {
      s.querySelectorAll('.counter').forEach(el => {
        const key = el.dataset.key;
        const target = (config && key in config) ? +config[key] : +el.dataset.target || 0;
        animateValue(el, target, 900 + Math.random()*600);
      });
    }
  });
}

function animateValue(el, to, duration=900){
  const start = Number(el.textContent.replace(/\D/g,'')) || 0;
  const startTime = performance.now();
  function step(now){
    const t = Math.min(1, (now - startTime)/duration);
    const eased = t*(2 - t);
    el.textContent = Math.floor(start + (to - start) * eased);
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------------------------
   Player + Audio + BPM visuals + background beat
   --------------------------- */
let audio = null;
let audioCtx = null;
let analyser = null;
let dataArray = null;
let sourceNode = null;
let playlistItems = [];
let trackIndex = 0;
let animationRAF = null;

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volume');
const trackProgress = document.getElementById('trackProgress');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const trackTitle = document.getElementById('trackTitle');
const playlistEl = document.getElementById('playlist');

// build playlist from config
function buildPlaylist(){
  if(!config || !config.playlist) return;
  playlistEl.innerHTML = '';
  playlistItems = config.playlist.map((t,i) => {
    const li = document.createElement('li');
    li.textContent = t.title;
    li.dataset.src = t.src;
    li.addEventListener('click', ()=> setTrack(i));
    playlistEl.appendChild(li);
    return {title: t.title, src: t.src, el: li};
  });
  // set first active
  setTrack(0, false);
}

function setTrack(i, autoplay=true){
  if(!playlistItems.length) return;
  trackIndex = ((i % playlistItems.length) + playlistItems.length) % playlistItems.length;
  const item = playlistItems[trackIndex];
  // highlight playlist
  playlistItems.forEach((it, idx) => it.el.classList.toggle('active', idx === trackIndex));
  // create audio (use one instance)
  if(audio) {
    audio.pause();
    audio.src = item.src;
  } else {
    audio = new Audio(item.src);
  }
  audio.crossOrigin = "anonymous";
  audio.volume = +volumeSlider.value;
  trackTitle.textContent = item.title || `Track ${trackIndex+1}`;
  if(autoplay) { audio.play().catch(()=>{}); playBtn.textContent='⏸'; }
  setupAudioContextAndAnalysis();
  bindProgressEvents();
}

playerToggle.addEventListener('click', ()=>{
  const isOpen = playerRoot.classList.toggle('open');
  playerRoot.classList.toggle('closed', !isOpen);
  playerToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  playerPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
});

document.getElementById('closePlayer').addEventListener('click', ()=>{
  playerRoot.classList.remove('open');
  playerRoot.classList.add('closed');
  playerToggle.setAttribute('aria-expanded', 'false');
  playerPanel.setAttribute('aria-hidden', 'true');
});

playBtn.addEventListener('click', async ()=>{
  if(!audio) return;
  if(audio.paused) {
    await audio.play().catch(()=>{}); playBtn.textContent='⏸';
    startProgressLoop();
  } else { audio.pause(); playBtn.textContent='▶'; cancelAnimationFrame(animationRAF); }
});
prevBtn.addEventListener('click', ()=> setTrack(trackIndex - 1, true));
nextBtn.addEventListener('click', ()=> setTrack(trackIndex + 1, true));
volumeSlider.addEventListener('input', e => { if(audio) audio.volume = +e.target.value; });

function bindProgressEvents(){
  if(!audio) return;
  audio.addEventListener('loadedmetadata', ()=> {
    durTime.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('ended', ()=> {
    setTrack(trackIndex + 1, true);
  });
}

function formatTime(s){
  if(!s || isNaN(s)) return '0:00';
  const m = Math.floor(s/60); const sec = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

let progressRAF;
function startProgressLoop(){
  function loop(){
    if(audio && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      trackProgress.value = pct;
      curTime.textContent = formatTime(audio.currentTime);
      durTime.textContent = formatTime(audio.duration);
    }
    progressRAF = requestAnimationFrame(loop);
  }
  cancelAnimationFrame(progressRAF);
  progressRAF = requestAnimationFrame(loop);
}
trackProgress.addEventListener('input', () => {
  if(audio && audio.duration) {
    audio.currentTime = (trackProgress.value / 100) * audio.duration;
  }
});

/* AudioContext and analyser for BPM/amplitude */
function setupAudioContextAndAnalysis(){
  try {
    if(!audio) return;
    if(audioCtx) { /* reuse */ }
    else audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // disconnect previous
    if(sourceNode) { try { sourceNode.disconnect(); } catch(_){} }
    sourceNode = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    // detection loop
    detectBeat();
    // start progress loop if playing
    if(!audio.paused) startProgressLoop();

  } catch(e) {
    console.warn('Audio analysis not available', e);
  }
}

/* beat detection: simple amplitude-based; pulses BPM svg and shifts backgrounds */
let lastPeak = 0;
function detectBeat() {
  if(!analyser || !dataArray) return;
  analyser.getByteTimeDomainData(dataArray);
  // compute mean deviation from 128
  let sum = 0;
  for(let i=0;i<dataArray.length;i++) sum += Math.abs(dataArray[i] - 128);
  const avg = sum / dataArray.length;
  // map avg to 0-1 (rough)
  const norm = Math.min(1, (avg / 40)); // tweak divisor for sensitivity
  // if strong peak occurs, pulse
  const now = performance.now();
  if(avg > 18 && (now - lastPeak) > 180) { // debounce ~180ms to avoid noise
    lastPeak = now;
    pulseVisuals(norm);
  }
  // constantly also use norm to gently change CSS var --bgshift
  // convert norm [0..1] to angle deg 0..60 (for gradient rotate effect) or to mix factor
  document.documentElement.style.setProperty('--bgshift', `${norm}`);
  requestAnimationFrame(detectBeat);
}

function pulseVisuals(strength=0.6) {
  // bpmViz circle pulse
  const circle = document.querySelector('#bpmViz circle');
  if(circle) {
    circle.animate([
      { transform: 'scale(1)', opacity: 1, strokeWidth: '8px' },
      { transform: 'scale(' + (1 + strength * 0.3) + ')', opacity: 0.2, strokeWidth: (8 + strength*12) + 'px' }
    ], { duration: 260, easing: 'ease-out' });
  }

  // scale svgs gently
  document.querySelectorAll('.svg').forEach(el => {
    el.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + strength*0.06})` }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
  });

  // change background blend via CSS variable --bgshift to cause gradients to appear more saturated
  // We'll animate a subtle flash: set a higher --bgshift then lerp down
  const start = performance.now();
  const duration = 400;
  const from = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bgshift')) || 0;
  const to = Math.min(1, from + strength * 0.8);
  function bgFrame(now) {
    const t = Math.min(1, (now - start) / duration);
    const val = from + (to - from) * (1 - Math.pow(1 - t, 2));
    document.documentElement.style.setProperty('--bgshift', `${val}`);
    if(t < 1) requestAnimationFrame(bgFrame);
  }
  requestAnimationFrame(bgFrame);
}

/* apply actual background effect per slide using CSS var --bgshift */
function applyBackgroundEffects(){
  slides.forEach(s => {
    // compute two CSS colors from slide variables and mix with global shift
    const base1 = getComputedStyle(s).getPropertyValue('--base1').trim() || '#061006';
    const base2 = getComputedStyle(s).getPropertyValue('--base2').trim() || '#042814';
    // sample bgshift value from root
  });
}
// We'll update body background on animation frames to include the --bgshift factor.
function bgUpdateLoop() {
  // get current shift
  const shift = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bgshift')) || 0;
  // blend current slide colors with a neon accent using shift
  const cur = slides[idx];
  if(cur) {
    const c1 = getComputedStyle(cur).getPropertyValue('--base1').trim() || '#061006';
    const c2 = getComputedStyle(cur).getPropertyValue('--base2').trim() || '#042814';
    // create a CSS gradient where we slightly move color stops based on shift
    const mid = 20 + Math.round(shift * 50); // shift midpoint for dynamic feel
    document.body.style.background = `linear-gradient(180deg, ${c1} ${mid}%, ${c2})`;
    // also apply a very subtle overlay glow when shift high
    const glowAlpha = Math.min(0.18, shift * 0.25);
    document.body.style.setProperty('--bg-glow', `rgba(155,93,229,${glowAlpha})`);
  }
  requestAnimationFrame(bgUpdateLoop);
}
requestAnimationFrame(bgUpdateLoop);

/* ---------------------------
   SVG SMIL fallback handling:
   If browser supports SMIL, blob.svg will morph automatically.
   If not, we can slightly pulse/scale it via CSS/JS already above.
   Keep existing svg reuse - no extra changes needed.
   --------------------------- */

/* ---------------------------
   Export recap (txt)
   --------------------------- */
document.getElementById('exportRecap')?.addEventListener('click', ()=>{
  if(!config) return;
  const lines = [
    'ChatGPT Wrapped — 2025 (Unofficial)',
    `Total messages: ${config.totalMessages}`,
    `Active days: ${config.activeDays}`,
    `Longest streak: ${config.longestStreak} days`,
    `Brain-rot index: ${config.brainrot}%`,
    '',
    'Eras:',
    ...config.eras.map((e,i)=>`${i+1}. ${e}`),
    '',
    'Unhinged facts:',
    ...config.unhingedFacts.map((f,i)=>`${i+1}. ${f}`)
  ];
  const blob = new Blob([lines.join('\n')], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'chatgpt_wrapped_recap.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

/* fake share button (demonstration) */
document.getElementById('shareRecap')?.addEventListener('click', ()=>{
  alert('This is a fake share button for demo — implement platform-specific sharing in production.');
});

/* ---------------------------
   Update recap display numbers
   --------------------------- */
function updateRecapValues(){
  if(!config) return;
  document.getElementById('recapMsgs') && (document.getElementById('recapMsgs').textContent = config.totalMessages);
  document.getElementById('recapDays') && (document.getElementById('recapDays').textContent = config.activeDays);
  document.getElementById('recapBrain') && (document.getElementById('recapBrain').textContent = config.brainrot + '%');
}

/* ---------------------------
   Initialize
   --------------------------- */
loadConfig();

/* expose goTo for debugging */
window.wrappedGoTo = goTo;
