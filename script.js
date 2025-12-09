/* script.js — FULL fixed + features:
   - safe lazy audio init on first user gesture
   - BPM detection + strong background sync
   - per-slide SVG choreography via data-svg-motion
   - repeated SVG usage & placement handled by CSS/helper classes
   - animated captions/lyrics
   - export PNG with auto-share sizing (3 presets)
   - Spotify-outro share modal (fake)
*/

let config = null;

/* DOM refs */
const slides = Array.from(document.querySelectorAll('.panel'));
const dotsRoot = document.getElementById('dots');

const playerRoot = document.getElementById('playerRoot');
const playerToggle = document.getElementById('playerToggle');
const playerPanel = document.getElementById('playerPanel');

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volume');
const trackProgress = document.getElementById('trackProgress');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const trackTitle = document.getElementById('trackTitle');
const playlistEl = document.getElementById('playlist');
const bpmPulseEl = document.getElementById('bpmPulse');

let idx = 0;
let navLock = false;

/* Audio vars */
let audio = null;
let audioCtx = null;
let analyser = null;
let dataArray = null;
let sourceNode = null;
let playlistItems = [];
let trackIndex = 0;
let progressRAF = null;
let detectRAF = null;

/* --- Load config.json and populate --- */
async function loadConfig(){
  try {
    const res = await fetch('config.json');
    config = await res.json();
  } catch(e) {
    console.error('Failed to load config.json', e);
    config = null;
  }
  fillContent();
  buildDots();
  layoutSlides();
  buildPlaylist();
  animateCountersWhenVisible();
  updateRecapValues();
}
function fillContent(){
  if(!config) return;
  // counters
  document.querySelectorAll('.counter').forEach(el=>{
    const key = el.dataset.key;
    const val = config.stats && config.stats[key] !== undefined ? config.stats[key] : null;
    el.textContent = val !== null ? '0' : el.textContent;
  });
  // peak hours
  const ph = document.getElementById('peakHours');
  if(ph) ph.textContent = config.stats.peakHours || '—';
  // eras & facts
  const eras = document.getElementById('erasList');
  if(eras){
    eras.innerHTML = '';
    (config.eras || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; eras.appendChild(li); });
  }
  const facts = document.getElementById('factsList');
  if(facts){
    facts.innerHTML = '';
    (config.unhingedFacts || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; facts.appendChild(li); });
  }
}

/* --- Layout slides stacked vertically + apply svg motion preset --- */
function layoutSlides(){
  slides.forEach((s,i)=>{
    s.style.transform = `translateY(${(i - idx) * 100}vh)`;
    // set theme gradient
    const theme = s.dataset.theme || 'green';
    const colors = config && config.themeColors && config.themeColors[theme] ? config.themeColors[theme] : ['#061006','#042814'];
    s.style.setProperty('--base1', colors[0]);
    s.style.setProperty('--base2', colors[1]);
    s.style.background = `linear-gradient(180deg, ${colors[0]}, ${colors[1]})`;
    applySvgMotionPreset(s);
  });
}
function applySvgMotionPreset(panel){
  const preset = panel.dataset.svgMotion || 'none';
  const decor = panel.querySelector('.panelDecor');
  if(!decor) return;
  decor.querySelectorAll('.svg').forEach(svg=>{
    svg.classList.remove('svgMotion-float','svgMotion-spin','svgMotion-orbit','svgMotion-pulse','svgMotion-none');
    if(preset === 'float') svg.classList.add('svgMotion-float');
    if(preset === 'spin') svg.classList.add('svgMotion-spin');
    if(preset === 'orbit') svg.classList.add('svgMotion-orbit');
    if(preset === 'pulse') svg.classList.add('svgMotion-pulse');
    if(preset === 'none') svg.classList.add('svgMotion-none');
  });
}

/* --- Dots nav --- */
function buildDots(){
  dotsRoot.innerHTML = '';
  slides.forEach((_,i)=>{
    const btn = document.createElement('button');
    btn.title = slides[i].dataset.title || `Slide ${i+1}`;
    btn.addEventListener('click', ()=> goTo(i));
    if(i===idx) btn.classList.add('active');
    dotsRoot.appendChild(btn);
  });
}
function updateDots(){
  Array.from(dotsRoot.children).forEach((b,i)=> b.classList.toggle('active', i===idx));
}

/* --- Navigation handlers --- */
function goTo(i){
  idx = Math.max(0, Math.min(i, slides.length - 1));
  layoutSlides();
  updateDots();
  animateCountersWhenVisible();
}
window.addEventListener('wheel', e=>{
  if(navLock) return;
  navLock = true;
  goTo(idx + (e.deltaY > 0 ? 1 : -1));
  setTimeout(()=> navLock = false, 700);
},{passive:true});
let ts=null;
window.addEventListener('touchstart', e=>{ if(e.touches && e.touches[0]) ts=e.touches[0].clientY; }, {passive:true});
window.addEventListener('touchend', e=>{
  if(ts===null) return;
  const dy = (e.changedTouches[0].clientY - ts);
  if(Math.abs(dy)>50) goTo(idx + (dy<0?1:-1));
  ts=null;
},{passive:true});
window.addEventListener('keydown', e=>{ if(e.key==='ArrowDown') goTo(idx+1); if(e.key==='ArrowUp') goTo(idx-1); });

/* --- Counters animation --- */
function animateCountersWhenVisible(){
  slides.forEach((s,i)=>{
    if(i===idx){
      s.querySelectorAll('.counter').forEach(el=>{
        const key = el.dataset.key;
        const target = config && config.stats && config.stats[key] !== undefined ? config.stats[key] : (+el.dataset.target || 0);
        animateValue(el, target, 900 + Math.random()*600);
      });
    }
  });
}
function animateValue(el,to,duration=900){
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

/* --- Playlist & Player --- */
function buildPlaylist(){
  if(!config || !config.playlist) return;
  playlistEl.innerHTML = '';
  playlistItems = config.playlist.map((t,i)=>{
    const li = document.createElement('li');
    li.textContent = t.title;
    li.dataset.src = t.src;
    li.addEventListener('click', ()=> setTrack(i, true));
    playlistEl.appendChild(li);
    return {title: t.title, src: t.src, el: li};
  });
  if(playlistItems.length){
    trackIndex = 0;
    playlistItems[0].el.classList.add('active');
    trackTitle.textContent = playlistItems[0].title;
  }
}
function setTrack(i, autoplay=true){
  if(!playlistItems.length) return;
  trackIndex = ((i % playlistItems.length) + playlistItems.length) % playlistItems.length;
  playlistItems.forEach((it,idx)=> it.el.classList.toggle('active', idx===trackIndex));
  const item = playlistItems[trackIndex];
  trackTitle.textContent = item.title || `Track ${trackIndex+1}`;
  if(audio){
    audio.pause();
    audio.src = item.src;
    audio.load();
    if(autoplay){ audio.play().catch(()=>{}); playBtn.textContent='⏸'; startProgressLoop(); }
  } else if(autoplay){
    createAudio(item.src).then(()=>{ audio.play().catch(()=>{}); playBtn.textContent='⏸'; startProgressLoop(); });
  }
}

/* --- createAudio: lazy and safe --- */
async function createAudio(src){
  if(!src && config && config.playlist && config.playlist.length) src = config.playlist[trackIndex].src;
  audio = new Audio(src);
  audio.crossOrigin = "anonymous";
  audio.preload = 'auto';
  audio.volume = +volumeSlider.value;
  audio.addEventListener('loadedmetadata', ()=> { durTime.textContent = formatTime(audio.duration); });
  audio.addEventListener('ended', ()=> setTrack(trackIndex + 1, true));
  setupAudioContextAndAnalysis();
}

/* --- Player UI toggle --- */
playerToggle.addEventListener('click', ()=> {
  const isOpen = playerRoot.classList.toggle('open');
  playerRoot.classList.toggle('closed', !isOpen);
  playerToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  playerPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
});
document.getElementById('closePlayer').addEventListener('click', ()=> {
  playerRoot.classList.remove('open'); playerRoot.classList.add('closed');
  playerToggle.setAttribute('aria-expanded', 'false'); playerPanel.setAttribute('aria-hidden', 'true');
});

/* --- Safe Play handler (ensures AudioContext resumed) --- */
playBtn.addEventListener('click', async ()=>{
  if(!audio){
    const firstSrc = playlistItems.length ? playlistItems[trackIndex].src : (config && config.playlist && config.playlist[0] && config.playlist[0].src);
    if(!firstSrc) return;
    await createAudio(firstSrc);
  }
  if(audioCtx && audioCtx.state === 'suspended') {
    try { await audioCtx.resume(); } catch(e){}
  }
  if(audio.paused){
    await audio.play().catch(()=>{});
    playBtn.textContent='⏸';
    startProgressLoop();
  } else {
    audio.pause();
    playBtn.textContent='▶';
    cancelAnimationFrame(progressRAF);
  }
});

prevBtn.addEventListener('click', ()=> setTrack(trackIndex - 1, true));
nextBtn.addEventListener('click', ()=> setTrack(trackIndex + 1, true));
volumeSlider.addEventListener('input', e => { if(audio) audio.volume = +e.target.value; });

/* --- Progress loop --- */
function startProgressLoop(){
  cancelAnimationFrame(progressRAF);
  function loop(){
    if(audio && audio.duration){
      const pct = (audio.currentTime / audio.duration) * 100;
      trackProgress.value = pct;
      curTime.textContent = formatTime(audio.currentTime);
      durTime.textContent = formatTime(audio.duration);
    }
    progressRAF = requestAnimationFrame(loop);
  }
  progressRAF = requestAnimationFrame(loop);
}
trackProgress.addEventListener('input', ()=> {
  if(audio && audio.duration) audio.currentTime = (trackProgress.value / 100) * audio.duration;
});
function formatTime(s){ if(!s||isNaN(s)) return '0:00'; const m=Math.floor(s/60); const sec=Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${sec}`; }

/* --- AudioContext & analysis & BPM estimation --- */
function setupAudioContextAndAnalysis(){
  try {
    if(!audio) return;
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(sourceNode){ try{ sourceNode.disconnect(); } catch(_){} }
    sourceNode = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    detectBeatLoop();
    estimateBPMFromAudio();
  } catch(e){
    console.warn('Audio analysis not available', e);
  }
}

/* --- Beat detection loop (stronger mapping) --- */
let lastPeakTime = 0;
function detectBeatLoop(){
  if(!analyser) return;
  analyser.getByteTimeDomainData(dataArray);
  // rms-like energy
  let sum=0;
  for(let i=0;i<dataArray.length;i++){
    const v = (dataArray[i] - 128) / 128;
    sum += v*v;
  }
  const rms = Math.sqrt(sum / dataArray.length);
  // stronger sensitivity mapping for more visible effect
  const energy = Math.min(1, Math.pow(rms*4.5, 1.12));
  const now = performance.now();
  if(energy > 0.11 && (now - lastPeakTime) > 140){
    lastPeakTime = now;
    pulseBpmRing(energy);
    // also trigger per-slide SVG micro-pulse
    pulseSlideSvgs(energy);
  }
  document.documentElement.style.setProperty('--bgshift', `${energy}`);
  detectRAF = requestAnimationFrame(detectBeatLoop);
}

/* Pulse BPM ring */
function pulseBpmRing(strength){
  if(!bpmPulseEl) return;
  const scale = 1 + Math.min(0.85, strength * 1.1);
  bpmPulseEl.animate([
    { transform: 'scale(1)', opacity: 1 },
    { transform: `scale(${scale})`, opacity: 0.18 }
  ], { duration: 260, easing: 'ease-out' });
}

/* simple slide svg pulse */
function pulseSlideSvgs(strength){
  const cur = slides[idx];
  if(!cur) return;
  cur.querySelectorAll('.panelDecor .svg').forEach((el)=>{
    el.animate([{ transform: getComputedStyle(el).transform }, { transform: `${getComputedStyle(el).transform} scale(${1 + Math.min(0.06, strength*0.12)})` }, { transform: getComputedStyle(el).transform }], { duration: 340, easing: 'ease-out' });
  });
}

/* estimate BPM from peaks */
function estimateBPMFromAudio(){
  if(!analyser) return;
  const sampleTimes=[];
  let localLast=0;
  const tmp = new Uint8Array(analyser.frequencyBinCount);
  const start = performance.now();
  function sampler(){
    analyser.getByteTimeDomainData(tmp);
    let sum=0;
    for(let i=0;i<tmp.length;i++) sum += Math.abs(tmp[i]-128);
    const avg = sum/tmp.length;
    const tNow = performance.now();
    if(avg > 30 && tNow - localLast > 180){ sampleTimes.push(tNow); localLast = tNow; }
    if(tNow - start < 7000 && sampleTimes.length < 9) requestAnimationFrame(sampler);
    else {
      if(sampleTimes.length >= 2){
        const intervals = [];
        for(let i=1;i<sampleTimes.length;i++) intervals.push(sampleTimes[i]-sampleTimes[i-1]);
        intervals.sort((a,b)=>a-b);
        const med = intervals[Math.floor(intervals.length/2)];
        const bpm = Math.round(60000/med);
        applyBpmToRing(bpm);
      } else applyBpmToRing(90);
    }
  }
  sampler();
}

/* apply BPM to ring animation (rotational speed) */
function applyBpmToRing(bpm){
  const spb = 60 / Math.max(30, Math.min(220, bpm));
  if(!bpmPulseEl) return;
  // make ring rotate at a rate tied to bpm (slow spin)
  bpmPulseEl.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: spb * 8000, iterations: Infinity, easing: 'linear' });
}

/* background update loop uses --bgshift to drive stronger gradients */
function bgUpdateLoop(){
  const shift = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bgshift')) || 0;
  const cur = slides[idx];
  if(cur){
    const c1 = getComputedStyle(cur).getPropertyValue('--base1').trim() || '#061006';
    const c2 = getComputedStyle(cur).getPropertyValue('--base2').trim() || '#042814';
    // make gradient strongly react to shift
    const mid = 10 + Math.round(shift * 60);
    const neon = Math.round(shift * 160);
    document.body.style.background = `linear-gradient(180deg, ${c1} ${mid}%, ${c2})`;
    document.body.style.boxShadow = `inset 0 0 ${20 + neon}px rgba(155,93,229,${Math.min(0.12, shift*0.5)})`;
  }
  requestAnimationFrame(bgUpdateLoop);
}
requestAnimationFrame(bgUpdateLoop);

/* --- Export recap PNG (auto-share sizing) --- */
async function exportRecapPNG(width=1200, height=630){
  if(!config) return;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');

  // background gradient from current slide
  const cur = slides[idx];
  const c1 = getComputedStyle(cur).getPropertyValue('--base1').trim() || '#061006';
  const c2 = getComputedStyle(cur).getPropertyValue('--base2').trim() || '#042814';
  const grad = ctx.createLinearGradient(0,0,0,height);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fillRect(0,0,width,height);

  // header
  ctx.fillStyle = 'white';
  ctx.font = '700 36px Inter, system-ui, sans-serif';
  ctx.fillText('ChatGPT Wrapped 2025 — Unofficial', 40, 60);

  // stats block
  ctx.font = '600 28px Inter, sans-serif';
  const s = config.stats || {};
  ctx.fillText(`Messages: ${s.totalMessages || '—'}`, 40, 120);
  ctx.fillText(`Active days: ${s.activeDays || '—'}`, 40, 160);
  ctx.fillText(`Longest streak: ${s.longestStreak || '—'}`, 40, 200);
  ctx.fillText(`Brain-rot: ${s.brainrot || '—'}%`, 40, 240);

  // draw a decorative svg (hero) top-right (scaled)
  try {
    const svgUrl = 'svgs/hero.svg';
    const resp = await fetch(svgUrl);
    const svgText = await resp.text();
    const blob = new Blob([svgText], {type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = () => { 
        const imgW = Math.min(280, width * 0.22);
        ctx.drawImage(img, width - imgW - 40, 40, imgW, imgW);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = ()=> resolve();
      img.src = url;
    });
  } catch(e){/* ignore */ }

  // finalize download
  return new Promise((resolve)=>{
    canvas.toBlob(blob=>{
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `wrapped_recap_${width}x${height}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      resolve();
    }, 'image/png');
  });
}

/* export buttons handlers (three auto sizes) */
document.getElementById('exportRecap')?.addEventListener('click', ()=> exportRecapPNG(1200,630));
document.getElementById('exportInsta')?.addEventListener('click', ()=> exportRecapPNG(1080,1080));
document.getElementById('exportStory')?.addEventListener('click', ()=> exportRecapPNG(1080,1920));

/* fake share modal (Spotify Outro) */
document.getElementById('shareRecap')?.addEventListener('click', ()=>{
  // simple fake modal/flow
  const shareBox = document.createElement('div');
  shareBox.style = "position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;";
  shareBox.innerHTML = `<div style="background:#07070a;padding:18px;border-radius:12px;color:white;max-width:560px;text-align:center;">
    <h3>Share your vibe</h3>
    <p style="opacity:.9">Choose a size to export your recap image and share it on socials. This is a demo share modal.</p>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
      <button id="s1200">1200×630</button>
      <button id="s1080">1080×1080</button>
      <button id="s1920">1080×1920</button>
    </div>
    <div style="margin-top:12px"><button id="closeShare">Close</button></div>
  </div>`;
  document.body.appendChild(shareBox);
  shareBox.querySelector('#s1200').onclick = async ()=>{ await exportRecapPNG(1200,630); shareBox.remove(); };
  shareBox.querySelector('#s1080').onclick = async ()=>{ await exportRecapPNG(1080,1080); shareBox.remove(); };
  shareBox.querySelector('#s1920').onclick = async ()=>{ await exportRecapPNG(1080,1920); shareBox.remove(); };
  shareBox.querySelector('#closeShare').onclick = ()=> shareBox.remove();
});

/* update recap numbers to UI */
function updateRecapValues(){
  if(!config) return;
  document.getElementById('recapMsgs') && (document.getElementById('recapMsgs').textContent = config.stats.totalMessages);
  document.getElementById('recapDays') && (document.getElementById('recapDays').textContent = config.stats.activeDays);
  document.getElementById('recapBrain') && (document.getElementById('recapBrain').textContent = config.stats.brainrot + '%');
}

/* Build playlist UI */
function buildPlaylist(){
  if(!config || !config.playlist) return;
  playlistEl.innerHTML = '';
  playlistItems = config.playlist.map((t,i) => {
    const li = document.createElement('li');
    li.textContent = t.title;
    li.dataset.src = t.src;
    li.addEventListener('click', ()=> setTrack(i, true));
    playlistEl.appendChild(li);
    return {title: t.title, src: t.src, el: li};
  });
  if(playlistItems.length) {
    trackIndex = 0;
    playlistItems[0].el.classList.add('active');
    trackTitle.textContent = playlistItems[0].title;
  }
}

/* Utility: ensure audio context/resume on any first user gesture (improves reliability) */
function ensureAudioUnlockedOnce(){
  function once(){
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    // if audio not created yet, create lazy audio if playlist exists but don't autplay
    if(!audio && config && config.playlist && config.playlist[0]) {
      // don't autoplay — just prepare the audio object so browser player appears
      audio = new Audio(config.playlist[0].src);
      audio.crossOrigin = "anonymous";
      audio.preload = 'metadata';
      audio.volume = +volumeSlider.value;
    }
    window.removeEventListener('pointerdown', once);
    window.removeEventListener('keydown', once);
  }
  window.addEventListener('pointerdown', once, {passive:true});
  window.addEventListener('keydown', once, {passive:true});
}
ensureAudioUnlockedOnce();

/* Start everything */
loadConfig();

/* Expose goTo for debugging */
window.wrappedGoTo = goTo;
