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
  if(!wrap) return;
  const shapes = ['fl-dot','fl-ring','fl-petal','fl-bit'];
  const colors = ['#ff9ec6','#b9ead4','#9fe0ff','#ffd24d','#ff7eb3','#c8a2ff'];
  const COUNT = window.innerWidth < 600 ? 12 : 20;
  for(let i=0;i<COUNT;i++){
    const s = document.createElement('span');
    const shape = shapes[i % shapes.length];
    s.className = 'floaty ' + shape;
    const col = colors[Math.floor(Math.random()*colors.length)];
    if(shape === 'fl-ring') s.style.borderColor = col; else s.style.background = col;
    const size = 8 + Math.random()*12;
    s.style.width = size + 'px';
    s.style.height = (shape==='fl-bit' ? size*1.4 : size) + 'px';
    s.style.left = Math.random()*100 + 'vw';
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

  // staged wake-up: stir the sleeper, then crossfade into the animated Snorlax
  const wrap = document.getElementById('snorGateWrap');
  if(wrap){
    wrap.classList.remove('no-art');      // make sure his art layer is visible
    wrap.classList.add('stirring');
    if(!wrap.querySelector('.snor-awake-gif')){
      const awake = document.createElement('img');
      awake.className = 'snor-awake-gif';
      awake.src = 'assets/snorlax_anim.gif';
      awake.alt = '';
      awake.setAttribute('aria-hidden','true');
      wrap.appendChild(awake);
    }
    setTimeout(() => wrap.classList.add('woke'), 750);  // crossfade after the stir
  }

  setTimeout(() => {
    gate.classList.add('lifting');
    party.hidden = false;
    musicBtn.hidden = false;
    setTimeout(() => { gate.style.display = 'none'; startCountdown(); }, 750);
    chime();
    burstConfetti(60);
  }, 2600);
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
      birthdayCelebration();
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

  function blow(c){
    if(!c || !c.classList || !c.classList.contains('candle') || c.classList.contains('out')) return;
    c.classList.add('out');
    pop();
    lit--; litEl.textContent = lit;
    if(lit === 0){
      done.hidden = false;
      chime();
      burstConfetti(100);
    }
  }

  for(let i=0;i<TOTAL;i++){
    const c = document.createElement('div');
    c.className = 'candle';
    c.innerHTML = '<span class="flame"></span>';
    c.addEventListener('click', () => blow(c));
    holder.appendChild(c);
  }

  // swipe to blow: drag a finger / mouse across the candles
  function candleAt(x, y){
    const el = document.elementFromPoint(x, y);
    return el && el.closest ? el.closest('.candle') : null;
  }
  let blowing = false;
  holder.addEventListener('pointerdown', e => {
    blowing = true;
    blow(candleAt(e.clientX, e.clientY));
  });
  holder.addEventListener('pointermove', e => {
    if(blowing) blow(candleAt(e.clientX, e.clientY));   // touch / dragging
    else if(e.pointerType === 'mouse'){                  // easy hover-swipe on desktop
      const c = e.target && e.target.closest ? e.target.closest('.candle') : null;
      blow(c);
    }
  });
  window.addEventListener('pointerup', () => { blowing = false; });
  window.addEventListener('pointercancel', () => { blowing = false; });
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

/* ---- Balloons (animated via Web Animations API, and you can pop them!) ---- */
document.getElementById('balloonBtn').addEventListener('click', releaseBalloons);
function releaseBalloons(){
  ac();
  const colors=['#ff7eb3','#9fe0ff','#b9ead4','#ffd24d','#c8a2ff','#ff9ec6','#7ec9a6','#ffa8c5'];
  const N=18;
  for(let i=0;i<N;i++){
    const b=document.createElement('div');
    b.className='balloon-real';
    b.style.background=colors[i%colors.length];
    b.style.left=(4+Math.random()*90)+'vw';
    const size=38+Math.random()*26;
    b.style.width=size+'px';
    b.style.height=(size*1.26)+'px';
    document.body.appendChild(b);
    const sway=(Math.random()-0.5)*140;
    const dur=6000+Math.random()*3800;
    const delay=i*90;
    const anim=b.animate([
      {transform:'translateY(0) translateX(0) rotate(-4deg)'},
      {transform:`translateY(-122vh) translateX(${sway}px) rotate(4deg)`}
    ],{duration:dur, delay:delay, easing:'cubic-bezier(.37,.1,.5,1)', fill:'forwards'});
    b.addEventListener('click', () => { popBalloon(b); anim.cancel(); });
    anim.onfinish=()=>b.remove();
  }
  pop();
}
function popBalloon(b){
  pop();
  const r=b.getBoundingClientRect();
  confettiAt(r.left+r.width/2, r.top+r.height/2, 12);
  b.remove();
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
/* a small confetti burst from a specific point (used when a balloon pops) */
function confettiAt(x, y, n){
  const colors=['#ff4d8d','#ffd24d','#9fe0ff','#b9ead4','#ff9ec6','#ffffff','#c8a2ff'];
  for(let i=0;i<n;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    const size=5+Math.random()*7;
    Object.assign(p.style,{
      left:x+'px', top:y+'px',
      width:size+'px', height:(size*1.3)+'px',
      background:colors[Math.floor(Math.random()*colors.length)]
    });
    document.body.appendChild(p);
    const ang=Math.random()*Math.PI*2, dist=40+Math.random()*90;
    p.animate([
      {transform:'translate(0,0) rotate(0)', opacity:1},
      {transform:`translate(${Math.cos(ang)*dist}px, ${Math.sin(ang)*dist+60}px) rotate(${Math.random()*420}deg)`, opacity:0}
    ],{duration:700+Math.random()*500, easing:'cubic-bezier(.2,.6,.4,1)'});
    setTimeout(()=>p.remove(), 1250);
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

/* =========================================================
   CHARACTER INTERACTIVITY — tap to react
   Each character gets a sound, a wiggle, a speech bubble, and
   a little burst of themed emoji. Keyboard-accessible too.
   ========================================================= */

/* ---- extra little voices (synth) ---- */
function jigglyHi(){ tone(N.E5,0,.22,'sine',.18); tone(N.A5,.12,.32,'sine',.18); }
function meow(){ tone(880,0,.12,'triangle',.16); tone(1180,.09,.17,'triangle',.15); }
function snore(){ tone(110,0,.45,'sawtooth',.12); tone(78,.42,.5,'sawtooth',.1); }

/* ---- speech bubble above an element ---- */
function bubble(el, text){
  if(!el) return;
  const r = el.getBoundingClientRect();
  const b = document.createElement('div');
  b.className = 'speech';
  b.textContent = text;
  b.style.left = (r.left + r.width/2) + 'px';
  b.style.top  = (r.top + 6) + 'px';
  document.body.appendChild(b);
  setTimeout(() => b.classList.add('out'), 1500);
  setTimeout(() => b.remove(), 1900);
}

/* ---- burst of floating emoji from an element ---- */
function reactBurst(el, emojis){
  if(!el) return;
  const r = el.getBoundingClientRect();
  for(let i=0;i<6;i++){
    const s = document.createElement('span');
    s.className = 'react-emoji';
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    Object.assign(s.style,{
      left:(r.left + r.width/2) + 'px',
      top:(r.top + r.height*0.3) + 'px',
      fontSize:(1 + Math.random()*0.8) + 'rem',
      opacity:'1'
    });
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = `translate(${(Math.random()-.5)*130}px, ${-70-Math.random()*70}px) rotate(${(Math.random()-.5)*90}deg)`;
      s.style.opacity = '0';
    });
    setTimeout(() => s.remove(), 1150);
  }
}

/* ---- pop a real character GIF out of an element (the star of the show) ---- */
function popGif(el, src, sizePx, pixel){
  if(!el) return;
  const r = el.getBoundingClientRect();
  const img = document.createElement('img');
  img.className = 'gif-react' + (pixel ? ' pixel' : '');
  img.src = src;
  img.alt = '';
  img.setAttribute('aria-hidden','true');
  img.style.width = sizePx + 'px';
  img.style.left = (r.left + r.width/2) + 'px';
  img.style.top  = (r.top + r.height*0.3) + 'px';
  document.body.appendChild(img);
  requestAnimationFrame(() => img.classList.add('in'));
  setTimeout(() => { img.classList.remove('in'); img.classList.add('out'); }, 1700);
  setTimeout(() => img.remove(), 2200);
}

/* ---- make any element a keyboard-friendly tap target ---- */
function makeTappable(el, handler, label){
  if(!el) return;
  el.setAttribute('role','button');
  el.setAttribute('tabindex','0');
  if(label) el.setAttribute('aria-label', label);
  el.addEventListener('click', handler);
  el.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); handler(e); }
  });
}

/* one-shot animation helper that restarts cleanly */
function playPoke(el, cls){
  el.classList.remove(cls);
  void el.offsetWidth;            // force reflow so the animation can re-trigger
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), {once:true});
}

/* ---- Hero Jigglypuff ---- */
const heroJiggly = document.querySelector('.host-jiggly');
makeTappable(heroJiggly, () => {
  ac(); jigglyHi();
  playPoke(heroJiggly, 'poke-jiggly');
  popGif(heroJiggly, 'assets/jigglypuff_anim.gif', 130, true);
}, 'Jigglypuff — tap to play');

/* ---- Hero Hello Kitty ---- */
const heroKitty = document.querySelector('.host-kitty');
makeTappable(heroKitty, () => {
  ac(); meow();
  playPoke(heroKitty, 'poke-kitty');
  popGif(heroKitty, 'assets/hellokitty_wave.gif', 150);
}, 'Hello Kitty — tap to say hi');

/* ---- Gate Snorlax: poke him while he sleeps ---- */
const snorGate = document.getElementById('snorGateWrap');
let snorePokes = 0;
makeTappable(snorGate, () => {
  ac();
  if(gate.classList.contains('awake')){
    chime();
    playPoke(snorGate, 'poke-kitty');
    popGif(snorGate, 'assets/snorlax_anim.gif', 150, true);
    return;
  }
  snore();
  playPoke(snorGate, 'poke-snore');
  snorePokes++;
  if(snorePokes === 3){
    gateHint.textContent = "He won't wake by poking — play the Poké Flute 🎵";
  }
}, 'Snorlax is sleeping — tap him gently');

/* ---- Footer gang: tappable mini reactions with their real gifs ---- */
document.querySelectorAll('.foot-gang .char').forEach(c => {
  const label = (c.querySelector('img') && c.querySelector('img').alt) || 'character';
  makeTappable(c, () => {
    ac();
    let gif = 'assets/hellokitty_wave.gif', pixel = false;
    if(label.indexOf('Snorlax') > -1){ snore(); gif = 'assets/snorlax_anim.gif'; pixel = true; }
    else if(label.indexOf('Jiggly') > -1){ jigglyHi(); gif = 'assets/jigglypuff_anim.gif'; pixel = true; }
    else { meow(); }
    playPoke(c, 'poke-jiggly');
    popGif(c, gif, 96, pixel);
  }, label + ' — tap me');
});

/* ---- Mini-games: the character performs the action only on click, then settles ---- */
function playAction(charEl, clipEl, src, ms){
  if(!charEl || !clipEl) return;
  clipEl.src = src + '?t=' + Date.now();   // (re)start the clip from frame 1
  charEl.classList.add('is-hidden');
  clipEl.hidden = false;
  clearTimeout(clipEl._revert);
  clipEl._revert = setTimeout(() => {
    clipEl.hidden = true;
    charEl.classList.remove('is-hidden');
  }, ms);
}
const _jMini = document.getElementById('jigglyMini');
const _jClip = document.getElementById('jigglyClip');
const _sMini = document.getElementById('snorlaxMini');
const _sClip = document.getElementById('snorlaxClip');
if(typeof singBtn !== 'undefined' && singBtn){
  singBtn.addEventListener('click', () => playAction(_jMini, _jClip, 'assets/jigglypuff_sing.gif', 4200));
}
if(typeof feedBtn !== 'undefined' && feedBtn){
  feedBtn.addEventListener('click', () => playAction(_sMini, _sClip, 'assets/snorlax_eat.gif', 3600));
}

/* =========================================================
   MEET THE HOSTS — tap a card to cycle real fun facts
   (Pokédex / Sanrio facts about the characters — nothing about
   Pretty is invented; only the hosts' own trivia.)
   ========================================================= */
const HOST_FACTS = {
  snorlax: [
    "It's known to eat nearly 900 lbs of food before dozing right back off.",
    "It only wakes up to eat — then naps all over again.",
    "Its belly is so big and comfy that children climb up to play on it.",
    "It isn't fussy: it'll happily eat food even if it's gone a little stale."
  ],
  jiggly: [
    "Its gentle lullaby puts anyone who listens straight to sleep.",
    "It puffs itself up bigger and bigger to sing with more breath.",
    "If its audience nods off, it pouts and doodles on their faces!",
    "Those big, round eyes help keep everyone watching its song."
  ],
  kitty: [
    "Her real name is Kitty White, and she lives just outside London.",
    "She's said to be five apples tall and about three apples in weight.",
    "She has a twin sister named Mimmy, who wears her bow on the right.",
    "Her birthday is November 1st — and she absolutely loves apple pie."
  ]
};
document.querySelectorAll('.host-card').forEach(card => {
  const key = card.getAttribute('data-host');
  const facts = HOST_FACTS[key] || [];
  const factEl = card.querySelector('.hc-fact');
  let idx = 0;
  function nextFact(){
    if(!facts.length) return;
    ac();
    if(key === 'snorlax') snore();
    else if(key === 'jiggly') jigglyHi();
    else meow();
    idx = (idx + 1) % facts.length;
    factEl.textContent = facts[idx];
    factEl.classList.remove('flip'); void factEl.offsetWidth; factEl.classList.add('flip');
    card.classList.add('tapped');
    const r = card.getBoundingClientRect();
    confettiAt(r.left + r.width/2, r.top + 24, 6);
  }
  card.addEventListener('click', nextFact);
  card.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); nextFact(); }
  });
});

/* =========================================================
   BIRTHDAY CELEBRATION — the payoff when the countdown hits 0
   Balloons fly, confetti keeps coming in waves, and a festive
   banner slides in. Runs once.
   ========================================================= */
let _celebrated = false;
function birthdayCelebration(){
  if(_celebrated) return;
  _celebrated = true;

  const banner = document.getElementById('bdayBanner');
  if(banner) banner.hidden = false;

  chime();
  burstConfetti(180);
  releaseBalloons();
  if(window.__startFireworks) window.__startFireworks(10000);
  if(window.__playHappyBirthday) window.__playHappyBirthday();

  // a few cheerful waves of confetti + balloons
  let waves = 0;
  const timer = setInterval(() => {
    burstConfetti(90);
    if(waves % 2 === 0) releaseBalloons();
    if(++waves >= 6) clearInterval(timer);
  }, 1500);
}
const _bClose = document.getElementById('bdayClose');
if(_bClose){
  _bClose.addEventListener('click', () => {
    const banner = document.getElementById('bdayBanner');
    if(banner) banner.hidden = true;
  });
}

/* =========================================================
   GRAND REDESIGN — cinematic scene, journey, song & finale
   (everything below is original; audio stays Web Audio synth,
    the Happy Birthday melody is public domain.)
   ========================================================= */
(function grand(){

  /* ---- starfield for the night sky ---- */
  const starWrap = document.getElementById('stars');
  if(starWrap){
    const COUNT = window.innerWidth < 600 ? 40 : 70;
    for(let i=0;i<COUNT;i++){
      const s=document.createElement('span');
      s.className='star';
      s.style.left=Math.random()*100+'%';
      s.style.top=Math.random()*70+'%';
      const sz=1.5+Math.random()*2.5;
      s.style.width=s.style.height=sz+'px';
      s.style.animationDelay=(-Math.random()*3)+'s';
      starWrap.appendChild(s);
    }
  }

  /* ---- parallax + day→night driven by scroll ---- */
  const hillsFar=document.getElementById('hillsFar'),
        hillsNear=document.getElementById('hillsNear'),
        sunMoon=document.getElementById('sunMoon');
  function onScroll(){
    const max=document.documentElement.scrollHeight - window.innerHeight;
    const p=max>0 ? Math.min(1, window.scrollY/max) : 0;
    document.body.style.setProperty('--night', p.toFixed(3));
    document.body.classList.toggle('is-night', p>0.55);
    const y=window.scrollY;
    if(hillsFar)  hillsFar.style.transform  = `translateY(${y*0.12}px)`;
    if(hillsNear) hillsNear.style.transform = `translateY(${y*0.22}px)`;
    if(sunMoon)   sunMoon.style.transform   = `translateX(-50%) translateY(${y*0.06}px)`;
  }
  let ticking=false;
  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(()=>{ onScroll(); ticking=false; }); ticking=true; }
  }, {passive:true});
  onScroll();

  /* ---- scroll reveals for every section ---- */
  const secs=[...document.querySelectorAll('.section')];
  secs.forEach(s=>s.classList.add('js-reveal'));
  if('IntersectionObserver' in window){
    const ro=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); }});
    },{threshold:.12});
    secs.forEach(s=>ro.observe(s));
  } else {
    secs.forEach(s=>s.classList.add('in'));
  }

  /* ---- journey rail active state ---- */
  const heroEl=document.querySelector('.hero');
  if(heroEl && !heroEl.id) heroEl.id='topHero';
  const jdots=[...document.querySelectorAll('.jdot')];
  if('IntersectionObserver' in window){
    const so=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const id=e.target.id;
          jdots.forEach(d=>d.classList.toggle('active', d.getAttribute('data-sec')===id));
        }
      });
    },{threshold:.45});
    jdots.forEach(d=>{ const el=document.getElementById(d.getAttribute('data-sec')); if(el) so.observe(el); });
  }

  /* ---- Happy Birthday melody (public domain) ---- */
  function playHappyBirthday(){
    ac();
    const {G4,A4,B4,C5,D5,E5,F5,G5}=N;
    const seq=[
      [G4,0.0,.3],[G4,.3,.2],[A4,.5,.4],[G4,.9,.4],[C5,1.3,.4],[B4,1.7,.7],
      [G4,2.6,.3],[G4,2.9,.2],[A4,3.1,.4],[G4,3.5,.4],[D5,3.9,.4],[C5,4.3,.7],
      [G4,5.2,.3],[G4,5.5,.2],[G5,5.7,.4],[E5,6.1,.4],[C5,6.5,.4],[B4,6.9,.4],[A4,7.3,.6],
      [F5,8.1,.3],[F5,8.4,.2],[E5,8.6,.4],[C5,9.0,.4],[D5,9.4,.4],[C5,9.8,.9]
    ];
    seq.forEach(([f,t,d])=>tone(f,t,d,'triangle',.17));
    lightName();
  }
  function lightName(){
    const spans=[...document.querySelectorAll('#nameLights span')];
    const wave=(base)=>spans.forEach((s,i)=>setTimeout(()=>{
      s.classList.remove('lit'); void s.offsetWidth; s.classList.add('lit');
    }, base+i*250));
    wave(200); wave(5400);
  }

  /* ---- canvas fireworks ---- */
  const fwCanvas=document.getElementById('fireworks');
  let fwCtx=null, fwParticles=[], fwRAF=null, fwActive=false;
  function fwResize(){ if(fwCanvas){ fwCanvas.width=window.innerWidth; fwCanvas.height=window.innerHeight; } }
  function fwBurst(x,y){
    const hue=Math.floor(Math.random()*360), count=38+Math.floor(Math.random()*26);
    for(let i=0;i<count;i++){
      const a=(Math.PI*2*i)/count, sp=2+Math.random()*4.2;
      fwParticles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:55+Math.random()*35,age:0,
        color:`hsl(${hue+Math.random()*40},90%,${58+Math.random()*22}%)`});
    }
    pop();
  }
  function fwLoop(){
    if(!fwCtx) return;
    fwCtx.clearRect(0,0,fwCanvas.width,fwCanvas.height);
    for(const p of fwParticles){
      p.age++; p.vy+=0.05; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.vy*=.99;
      const alpha=Math.max(0,1-p.age/p.life);
      fwCtx.globalAlpha=alpha; fwCtx.fillStyle=p.color;
      fwCtx.beginPath(); fwCtx.arc(p.x,p.y,2.5,0,Math.PI*2); fwCtx.fill();
    }
    fwParticles=fwParticles.filter(p=>p.age<p.life);
    fwCtx.globalAlpha=1;
    if(fwActive || fwParticles.length){ fwRAF=requestAnimationFrame(fwLoop); }
    else { fwCanvas.classList.remove('on'); fwRAF=null; }
  }
  function startFireworks(ms){
    if(!fwCanvas) return;
    fwCtx=fwCanvas.getContext('2d'); fwResize();
    fwCanvas.classList.add('on'); fwActive=true;
    const iv=setInterval(()=>fwBurst(Math.random()*fwCanvas.width, Math.random()*fwCanvas.height*0.55+40), 360);
    if(!fwRAF) fwLoop();
    setTimeout(()=>{ clearInterval(iv); fwActive=false; }, ms||8000);
  }
  window.addEventListener('resize', fwResize);

  /* ---- finale button: the full celebration ---- */
  const finaleBtn=document.getElementById('finaleBtn');
  const finaleGang=document.querySelector('.finale-gang');
  if(finaleBtn){
    finaleBtn.addEventListener('click', () => {
      ac();
      startFireworks(9000);
      burstConfetti(200);
      releaseBalloons();
      playHappyBirthday();
      if(finaleGang) finaleGang.classList.add('cheer');
      setTimeout(()=>finaleGang && finaleGang.classList.remove('cheer'), 9000);
      let waves=0;
      const t=setInterval(()=>{ burstConfetti(80); if(++waves>=5) clearInterval(t); }, 1500);
    });
  }

  /* ---- host intro chatter when the party opens ---- */
  function hostIntro(){
    const hj=document.querySelector('.host-jiggly'), hk=document.querySelector('.host-kitty');
    if(hj){ ac(); jigglyHi(); bubble(hj, "She's here!"); }
    if(hk) setTimeout(()=>{ meow(); bubble(hk, "Let's celebrate!"); }, 1400);
    if(hj) setTimeout(()=>{ bubble(hj, "Scroll down, Pretty!"); }, 2800);
  }
  if(fluteBtn) fluteBtn.addEventListener('click', () => setTimeout(hostIntro, 3300), {once:true});

  /* expose the song so the birthday-moment celebration can sing too */
  window.__playHappyBirthday = playHappyBirthday;
  window.__startFireworks = startFireworks;

})();
