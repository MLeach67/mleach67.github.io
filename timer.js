const display    = document.getElementById('display');
const startBtn   = document.getElementById('startBtn');
const stopBtn    = document.getElementById('stopBtn');
const resetBtn   = document.getElementById('resetBtn');
const presetBtns = document.querySelectorAll('.preset-btn');


let remaining  = 0;
let preset     = 0;
let intervalId = null;
let audioCtx   = null;

function pad(n) { return String(n).padStart(2, '0'); }

function updateDisplay() {
  display.textContent = pad(remaining);
}

// Must be created/resumed from a user gesture, and warmed up ahead of time to avoid startup latency on the first beep
function ensureAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(freq, duration) {
  const ctx = audioCtx;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}

function selectPreset(secs) {
  if (intervalId) return;
  preset    = secs;
  remaining = secs;
  updateDisplay();
  presetBtns.forEach(b => b.classList.toggle('active', Number(b.dataset.seconds) === secs));
}

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => selectPreset(Number(btn.dataset.seconds)));
});

startBtn.addEventListener('click', () => {
  if (intervalId || remaining <= 0) return;
  ensureAudioCtx();

  intervalId = setInterval(() => {
    remaining--;
    updateDisplay();
    if (remaining <= 5 && remaining >= 0) {
      beep(remaining === 0 ? 1200 : 880, remaining === 0 ? 0.4 : 0.15);
    }
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(intervalId);
  intervalId = null;
});

resetBtn.addEventListener('click', () => {
  clearInterval(intervalId);
  intervalId = null;
  selectPreset(preset);
});

updateDisplay();

const swDisplay  = document.getElementById('stopwatchDisplay');
const swStartBtn = document.getElementById('swStartBtn');
const swStopBtn  = document.getElementById('swStopBtn');
const swResetBtn = document.getElementById('swResetBtn');

let swElapsed    = 0;
let swIntervalId = null;

function pad2(n) { return String(n).padStart(2, '0'); }

function updateSwDisplay() {
  const h = Math.floor(swElapsed / 3600);
  const m = Math.floor((swElapsed % 3600) / 60);
  const s = swElapsed % 60;
  swDisplay.textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

swStartBtn.addEventListener('click', () => {
  if (swIntervalId) return;
  swIntervalId = setInterval(() => {
    swElapsed++;
    updateSwDisplay();
  }, 1000);
});

swStopBtn.addEventListener('click', () => {
  clearInterval(swIntervalId);
  swIntervalId = null;
});

swResetBtn.addEventListener('click', () => {
  clearInterval(swIntervalId);
  swIntervalId = null;
  swElapsed = 0;
  updateSwDisplay();
});

updateSwDisplay();