/* =========================================================
   Pretty's Debut Party — interactions
   Sound is synthesized with the Web Audio API (no external files,
   nothing copyrighted). Everything personal comes only from the user.
   ========================================================= */

/* ---- The ONE real message (exact, never altered) ---- */
const PRETTY_MESSAGE =
  "Happy Birthday, Pretty! I hope you have a very fun time on this special day of yours, and I wish that this birthday — your debut — becomes so memorable, filled with lots of good and fun memories, especially with your family, friends, and everyone you love. WISHING YOU A SWEET AND FANTASTIC BIRTHDAY, PRETTY! <3";

document.getElementById('letterBody').textContent = PRETTY_MESSAGE;

/* ---- Birthday target: June 20, 2026, 00:00 Philippine Time (UTC+8) ---- */
const BIRTHDAY = new Date('2026-06-20T00:00:00+08:00');

/* =========================================================
   Tiny synth engine (Web Audio)
   ========================================================= */
let audioCtx = null;
function ac(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, start, dur, type='sine', vol=0.22){
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.05);
}
// note helpers
const N = {C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.0,A4:440.0,B4:493.88,
           C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880.0};

function playFlute(){
  // gentle wake-up arpeggio
  const seq=[[N.G4,0],[N.C5,.18],[N.E5,.36],[N.G5,.54],[N.E5,.74],[N.C5,.92]];
  seq.forEach(([f,t])=>tone(f,t,.45,'triangle',.18));
}
function playJigglySong(){
  // soft lullaby melody
  const m=[[N.E5,0],[N.D5,.35],[N.C5,.7],[N.D5,1.05],[N.E5,1.4],[N.E5,1.75],[N.E5,2.1],
           [N.D5,2.5],[N.D5,2.85],[N.D5,3.2],[N.E5,3.6],[N.G5,3.95],[N.G5,4.3]];
  m.forEach(([f,t])=>tone(f,t,.5,'sine',.2));
}
function chime(){[N.C5,N.E5,N.G5,N.C5*2].forEach((f,i)=>tone(f,i*.08,.4,'triangle',.18));}
function pop(){tone(180+Math.random()*120,0,.12,'square',.16);}
function nom(){tone(120,0,.1,'sawtooth',.12); tone(90,.08,.12,'sawtooth',.1);}

/* =========================================================
   Floating background decorations
   ========================================================= */
(function floaties(){
  const wrap = document.getElementById('floaties');
  const icons = ['💚','🩷','🎈','·','🌸','🎀','🫐','💗','·','🍓'];
  const COUNT = window.innerWidth < 600 ? 12 : 20;
  for(let i=0;i<COUNT;i++){
    const s = document.createElement('span');
    s.className = 'floaty';
    s.textContent = icons[Math.floor(Math.random()*icons.length)];
    s.style.left = Math.random()*100 + 'vw';
    s.style.fontSize = (1.1 + Math.random()*1.6) + 'rem';
    const dur = 9 + Math.random()*10;
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = (-Math.random()*dur) + 's';
    wrap.appendChild(s);
  }
})();

/* =========================================================
   GATE → enter the party
   ========================================================= */
const gate = document.getElementById('gate');
const party = document.getElementById('party');
const musicBtn = document.getElementById('musicBtn');
const fluteBtn = document.getElementById('fluteBtn');
const gateHint = document.getElementById('gateHint');

fluteBtn.addEventListener('click', () => {
  ac();
  playFlute();
  gate.classList.add('awake');
  gateHint.textContent = 'He yawned… and stepped aside! Welcome in 💚';
  fluteBtn.disabled = true;
  fluteBtn.textContent = '✦ the way is open ✦';

  setTimeout(() => {
    gate.classList.add('lifting');
    party.hidden = false;
    musicBtn.hidden = false;
    setTimeout(() => { gate.style.display = 'none'; startCountdown(); }, 750);
    chime();
    burstConfetti(60);
  }, 1400);
});

/* =========================================================
   COUNTDOWN to June 20 PHT
   ========================================================= */
let cdTimer = null;
function startCountdown(){
  const elD=document.getElementById('cdD'), elH=document.getElementById('cdH'),
        elM=document.getElementById('cdM'), elS=document.getElementById('cdS'),
        label=document.getElementById('cdLabel'), box=document.getElementById('countdown');
  function tick(){
    const diff = BIRTHDAY - new Date();
    if(diff <= 0){
      clearInterval(cdTimer);
      elD.textContent=elH.textContent=elM.textContent=elS.textContent='00';
      label.textContent = "IT'S YOUR DAY, PRETTY! 🎉";
      box.classList.add('party-time');
      burstConfetti(120);
      return;
    }
    const d=Math.floor(diff/86400000),
          h=Math.floor(diff/3600000)%24,
          m=Math.floor(diff/60000)%60,
          s=Math.floor(diff/1000)%60;
    const p=n=>String(n).padStart(2,'0');
    elD.textContent=p(d); elH.textContent=p(h); elM.textContent=p(m); elS.textContent=p(s);
  }
  tick();
  cdTimer = setInterval(tick, 1000);
}

/* =========================================================
   PHOTO fallback (if assets/pretty.jpg missing)
   ========================================================= */
const photo = document.getElementById('prettyPhoto');
const fallback = document.getElementById('photoFallback');
photo.addEventListener('error', () => {
  photo.style.display = 'none';
  fallback.classList.add('show');
});
// if it loads but is the broken 0x0, also guard
photo.addEventListener('load', () => {
  if(photo.naturalWidth === 0){ photo.style.display='none'; fallback.classList.add('show'); }
});

/* =========================================================
   CAKE — 18 candles to blow out (her debut)
   ========================================================= */
(function cake(){
  const holder = document.getElementById('candles');
  const litEl = document.getElementById('lit');
  const done = document.getElementById('cakeDone');
  const TOTAL = 18;
  let lit = TOTAL;

  for(let i=0;i<TOTAL;i++){
    const c = document.createElement('div');
    c.className = 'candle';
    c.innerHTML = '<span class="flame"></span>';
    c.addEventListener('click', () => {
      if(c.classList.contains('out')) return;
      c.classList.add('out');
      pop();
      lit--; litEl.textContent = lit;
      if(lit === 0){
        done.hidden = false;
        chime();
        burstConfetti(100);
      }
    });
    holder.appendChild(c);
  }
})();

/* =========================================================
   ENVELOPE — reveal the (real) message
   ========================================================= */
const env = document.getElementById('envelope');
function openEnvelope(){
  if(env.classList.contains('open')) return;
  env.classList.add('open');
  chime();
  burstConfetti(40);
}
env.addEventListener('click', openEnvelope);
env.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openEnvelope(); }});

/* =========================================================
   FUN — Jigglypuff sings
   ========================================================= */
const singBtn = document.getElementById('singBtn');
const miniJiggly = document.getElementById('jigglyMini');
singBtn.addEventListener('click', () => {
  ac(); playJigglySong();
  miniJiggly.classList.add('singing');
  spawnNotes(singBtn);
  setTimeout(() => miniJiggly.classList.remove('singing'), 4800);
});
function spawnNotes(btn){
  const r = btn.getBoundingClientRect();
  const notes=['♪','♫','♬','🎵'];
  for(let i=0;i<8;i++){
    const n=document.createElement('span');
    n.textContent=notes[Math.floor(Math.random()*notes.length)];
    Object.assign(n.style,{position:'fixed',left:(r.left+r.width/2)+'px',top:r.top+'px',
      zIndex:90,fontSize:(1+Math.random())+'rem',color:'#ff4d8d',pointerEvents:'none',
      transition:'transform 2s ease, opacity 2s ease',opacity:'1'});
    document.body.appendChild(n);
    requestAnimationFrame(()=>{
      n.style.transform=`translate(${(Math.random()-.5)*160}px,${-120-Math.random()*120}px) rotate(${(Math.random()-.5)*120}deg)`;
      n.style.opacity='0';
    });
    setTimeout(()=>n.remove(),2100);
  }
}

/* ---- Feed Snorlax ---- */
const feedBtn = document.getElementById('feedBtn');
const treatsEl = document.getElementById('treats');
const miniSnor = document.getElementById('snorlaxMini');
let treats = 0;
feedBtn.addEventListener('click', () => {
  if(treats >= 10) return;
  treats++; treatsEl.textContent = treats;
  nom();
  miniSnor.classList.add('happy');
  flyTreat(feedBtn);
  setTimeout(()=>miniSnor.classList.remove('happy'),250);
  if(treats === 10){
    feedBtn.textContent = '😴 he\'s napping happily';
    feedBtn.disabled = true;
    chime();
  }
});
function flyTreat(btn){
  const foods=['🍎','🍓','🫐','🍙','🍰'];
  const r=btn.getBoundingClientRect();
  const f=document.createElement('span');
  f.textContent=foods[Math.floor(Math.random()*foods.length)];
  Object.assign(f.style,{position:'fixed',left:(r.left+r.width/2)+'px',top:r.top+'px',
    zIndex:90,fontSize:'1.6rem',pointerEvents:'none',transition:'transform .6s ease, opacity .6s'});
  document.body.appendChild(f);
  requestAnimationFrame(()=>{ f.style.transform='translateY(-90px) scale(.4)'; f.style.opacity='0'; });
  setTimeout(()=>f.remove(),650);
}

/* ---- Balloons ---- */
document.getElementById('balloonBtn').addEventListener('click', releaseBalloons);
function releaseBalloons(){
  const colors=['🎈','🩷','💚','💙','💛','💜'];
  for(let i=0;i<22;i++){
    const b=document.createElement('span');
    b.className='balloon';
    b.textContent=colors[Math.floor(Math.random()*colors.length)];
    b.style.left=Math.random()*100+'vw';
    b.style.setProperty('--sway',(Math.random()-.5)*120+'px');
    b.style.animationDuration=(5+Math.random()*4)+'s';
    b.style.fontSize=(2+Math.random()*1.6)+'rem';
    document.body.appendChild(b);
    setTimeout(()=>b.remove(),9000);
  }
  pop();
}

/* ---- Confetti ---- */
document.getElementById('confettiBtn').addEventListener('click', ()=>{ burstConfetti(140); chime(); });
function burstConfetti(n){
  const colors=['#ff4d8d','#2f4f6e','#b9ead4','#ffd24d','#ff9ec6','#ffffff','#9fe0ff'];
  for(let i=0;i<n;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    const size=6+Math.random()*8;
    Object.assign(p.style,{
      left:Math.random()*100+'vw',
      width:size+'px', height:(size*1.4)+'px',
      background:colors[Math.floor(Math.random()*colors.length)],
      transform:`rotate(${Math.random()*360}deg)`
    });
    document.body.appendChild(p);
    const fall=2200+Math.random()*2000;
    const sway=(Math.random()-.5)*240;
    p.animate([
      {transform:`translate(0,0) rotate(0)`, opacity:1},
      {transform:`translate(${sway}px, 110vh) rotate(${720+Math.random()*360}deg)`, opacity:1}
    ],{duration:fall, easing:'cubic-bezier(.2,.6,.4,1)'});
    setTimeout(()=>p.remove(), fall);
  }
}

/* =========================================================
   Background party music (gentle synth loop)
   ========================================================= */
let musicTimer=null, musicOn=false;
const happyTune=[
  [N.C5,.0],[N.C5,.18],[N.D5,.36],[N.C5,.72],[N.F4*2,1.08],[N.E5,1.44],
  [N.C5,2.0],[N.C5,2.18],[N.D5,2.36],[N.C5,2.72],[N.G5,3.08],[N.F5,3.44]
];
function loopMusic(){
  happyTune.forEach(([f,t])=>tone(f,t,.4,'triangle',.08));
}
musicBtn.addEventListener('click', ()=>{
  ac();
  musicOn=!musicOn;
  musicBtn.classList.toggle('playing',musicOn);
  if(musicOn){ loopMusic(); musicTimer=setInterval(loopMusic,4000); }
  else { clearInterval(musicTimer); }
});
