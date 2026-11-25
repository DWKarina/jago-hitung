/* =========================================================
   Jago Hitung — Aplikasi
   Semua progres disimpan di localStorage perangkat ini.
   ========================================================= */
(() => {
  const { SECTIONS, makeQuestions, genKilat, shuffle, pick } = window.JH;
  const KEY = 'jagohitung_v1';
  const LESSON_LEN = 8, EXAM_LEN = 12, LESSONS_PER_LEVEL = 2, MAX_LEVEL = 3, HEARTS = 5, BLITZ_SECS = 60;

  const DEFAULT = {
    onboarded: false, name: 'Jagoan', dailyGoal: 30, sound: true, unlockAll: false,
    xp: 0, gems: 50, streak: 0, bestStreak: 0, lastDay: null, freeze: 0,
    today: { date: null, xp: 0, goalDone: false }, history: {},
    progress: {}, exams: {}, lessonsDone: 0, perfect: 0, bestCombo: 0, blitzBest: 0,
    owned: [], hat: null, badges: {}, sectionIdx: 0,
  };

  /* ---------------- Penyimpanan ---------------- */
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object') return { ...structuredClone(DEFAULT), ...raw };
    } catch (e) { /* abaikan */ }
    return structuredClone(DEFAULT);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ }
  }
  let S = load();

  /* ---------------- Tanggal & runtunan ---------------- */
  const p2 = (n) => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const dayDiff = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000);
  const addDays = (k, n) => { const d = new Date(k + 'T00:00'); d.setDate(d.getDate() + n); return dayKey(d); };

  function refreshDay() {
    const t = dayKey();
    if (S.today.date !== t) S.today = { date: t, xp: 0, goalDone: false };
    if (S.lastDay && S.streak > 0) {
      const gap = dayDiff(S.lastDay, t);
      if (gap > 1) {
        const missed = gap - 1;
        if (S.freeze >= missed) {
          S.freeze -= missed;
          S.lastDay = addDays(t, -1);
          setTimeout(() => toast('🧊', `Pembeku Api dipakai! Runtunanmu aman.`), 600);
        } else S.streak = 0;
      }
    }
    save();
  }

  function addXP(x) {
    refreshDay();
    const t = dayKey();
    S.xp += x;
    S.today.xp += x;
    S.history[t] = (S.history[t] || 0) + x;
    if (S.lastDay !== t) {
      S.streak = S.lastDay === addDays(t, -1) ? S.streak + 1 : 1;
      S.lastDay = t;
      S.bestStreak = Math.max(S.bestStreak, S.streak);
      if (S.streak > 1) setTimeout(() => toast('🔥', `Runtunan ${S.streak} hari! Hebat!`), 900);
    }
    if (!S.today.goalDone && S.today.xp >= S.dailyGoal) {
      S.today.goalDone = true;
      S.gems += 10;
      setTimeout(() => toast('🎯', 'Target harian tercapai! +10 💎'), 1400);
    }
    save();
  }

  /* ---------------- Progres topik ---------------- */
  const done = (u) => S.progress[u.id] || 0;
  const levelOf = (u) => Math.min(MAX_LEVEL, Math.floor(done(u) / LESSONS_PER_LEVEL) + 1);
  const crownsOf = (u) => Math.min(MAX_LEVEL, Math.floor(done(u) / LESSONS_PER_LEVEL));
  const mastered = (u) => done(u) >= LESSONS_PER_LEVEL * MAX_LEVEL;
  const unitUnlocked = (sec, i) => S.unlockAll || i === 0 || done(sec.units[i - 1]) >= LESSONS_PER_LEVEL;
  const examUnlocked = (sec) => S.unlockAll || sec.units.every((u) => done(u) >= LESSONS_PER_LEVEL);
  const ringPct = (u) => (mastered(u) ? 100 : ((done(u) % LESSONS_PER_LEVEL) / LESSONS_PER_LEVEL) * 100);

  /* ---------------- Toko & lencana ---------------- */
  const HATS = [
    { id: 'cap', e: '🧢', n: 'Topi Keren', p: 30 },
    { id: 'bow', e: '🎀', n: 'Pita Manis', p: 30 },
    { id: 'flower', e: '🌻', n: 'Bunga Matahari', p: 40 },
    { id: 'tophat', e: '🎩', n: 'Topi Pesulap', p: 60 },
    { id: 'grad', e: '🎓', n: 'Topi Wisuda', p: 80 },
    { id: 'crown', e: '👑', n: 'Mahkota Juara', p: 150 },
  ];
  const BADGES = [
    { id: 'first', e: '🌱', n: 'Langkah Pertama', d: 'Selesaikan 1 pelajaran', ok: (s) => s.lessonsDone >= 1 },
    { id: 'l10', e: '📚', n: 'Rajin Belajar', d: 'Selesaikan 10 pelajaran', ok: (s) => s.lessonsDone >= 10 },
    { id: 'l50', e: '🏫', n: 'Kutu Buku', d: 'Selesaikan 50 pelajaran', ok: (s) => s.lessonsDone >= 50 },
    { id: 's3', e: '🔥', n: 'Api Kecil', d: 'Runtunan 3 hari', ok: (s) => s.bestStreak >= 3 },
    { id: 's7', e: '🌋', n: 'Api Besar', d: 'Runtunan 7 hari', ok: (s) => s.bestStreak >= 7 },
    { id: 's30', e: '☀️', n: 'Api Matahari', d: 'Runtunan 30 hari', ok: (s) => s.bestStreak >= 30 },
    { id: 'xp100', e: '⚡', n: '100 XP', d: 'Kumpulkan 100 XP', ok: (s) => s.xp >= 100 },
    { id: 'xp500', e: '🌟', n: '500 XP', d: 'Kumpulkan 500 XP', ok: (s) => s.xp >= 500 },
    { id: 'xp1000', e: '🚀', n: '1000 XP', d: 'Kumpulkan 1000 XP', ok: (s) => s.xp >= 1000 },
    { id: 'perfect', e: '💯', n: 'Sempurna', d: 'Pelajaran tanpa salah', ok: (s) => s.perfect >= 1 },
    { id: 'combo10', e: '🎯', n: 'Combo 10', d: '10 benar berturut-turut', ok: (s) => s.bestCombo >= 10 },
    { id: 'blitz15', e: '⏱️', n: 'Si Kilat', d: 'Skor 15 di Latihan Kilat', ok: (s) => s.blitzBest >= 15 },
    { id: 'master', e: '👑', n: 'Master Topik', d: 'Kuasai 1 topik (level 3)', ok: (s) => Object.values(s.progress).some((v) => v >= 6) },
    { id: 'exam', e: '🏆', n: 'Juara Bagian', d: 'Lulus 1 Ujian Bagian', ok: (s) => Object.keys(s.exams).length >= 1 },
    { id: 'allexam', e: '🥇', n: 'Calon Olimpiade', d: 'Lulus semua Ujian Bagian', ok: (s) => Object.keys(s.exams).length >= SECTIONS.length },
  ];
  function checkBadges() {
    let delay = 1800;
    for (const b of BADGES) {
      if (!S.badges[b.id] && b.ok(S)) {
        S.badges[b.id] = dayKey();
        setTimeout(() => { toast(b.e, `Lencana baru: ${b.n}!`); sfx('win'); }, delay);
        delay += 1200;
      }
    }
    save();
  }

  /* ---------------- Suara ---------------- */
  let actx;
  function tone(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.22) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((fq, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * gap;
        o.type = type;
        o.frequency.value = fq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + dur + 0.03);
      });
    } catch (e) { /* abaikan */ }
  }
  const sfx = (k) => ({
    ok: () => tone([660, 990], 0.14),
    bad: () => tone([260, 200], 0.18, 'square', 0.12, 0.08),
    win: () => tone([523, 659, 784, 1047], 0.18, 'triangle', 0.11),
    tap: () => tone([520], 0.05, 'sine', 0, 0.08),
    buy: () => tone([880, 1320], 0.1, 'triangle'),
  }[k] || (() => {}))();

  /* ---------------- Maskot "Momo" ---------------- */
  function mascotSVG(mood = 'happy') {
    const py = mood === 'sad' ? 55 : mood === 'think' ? 46 : 52;
    const px = mood === 'think' ? 3 : 1;
    const mouth =
      mood === 'sad' ? '<path d="M50 76 Q60 68 70 76" fill="none" stroke="#7a2e00" stroke-width="4" stroke-linecap="round"/>'
      : mood === 'wow' ? '<ellipse cx="60" cy="74" rx="7" ry="8" fill="#7a2e00"/>'
      : mood === 'think' ? '<path d="M52 74 L68 72" stroke="#7a2e00" stroke-width="4" stroke-linecap="round"/>'
      : '<path d="M46 68 Q60 86 74 68 Z" fill="#7a2e00"/><path d="M53 76 Q60 81 67 76" fill="#ff6f91"/>';
    const brow = mood === 'sad' ? '<path d="M33 38 L49 32 M87 38 L71 32" stroke="#7a2e00" stroke-width="3.5" stroke-linecap="round"/>' : '';
    return `<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="125" rx="34" ry="4.5" fill="#000" opacity=".08"/>
      <line x1="60" y1="24" x2="60" y2="9" stroke="#e07b00" stroke-width="4" stroke-linecap="round"/>
      <polygon points="60,0 63,6 69,7 64.5,11 66,17 60,14 54,17 55.5,11 51,7 57,6" fill="#ffc800" stroke="#e5a800" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="33" y="106" width="20" height="17" rx="8" fill="#e07b00"/>
      <rect x="67" y="106" width="20" height="17" rx="8" fill="#e07b00"/>
      <rect x="6" y="62" width="16" height="32" rx="8" fill="#ff9600" transform="rotate(18 14 78)"/>
      <rect x="98" y="62" width="16" height="32" rx="8" fill="#ff9600" transform="rotate(-18 106 78)"/>
      <rect x="16" y="22" width="88" height="92" rx="36" fill="#ff9600"/>
      <path d="M24 40 Q30 26 48 24" stroke="#ffb347" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="98" rx="26" ry="13" fill="#ffd8a8"/>
      <path d="M60 91 v14 M53 98 h14" stroke="#ff9600" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="43" cy="50" r="14" fill="#fff"/><circle cx="77" cy="50" r="14" fill="#fff"/>
      <circle cx="${43 + px}" cy="${py}" r="7" fill="#3c3c3c"/><circle cx="${77 + px}" cy="${py}" r="7" fill="#3c3c3c"/>
      <circle cx="${45 + px}" cy="${py - 3}" r="2.5" fill="#fff"/><circle cx="${79 + px}" cy="${py - 3}" r="2.5" fill="#fff"/>
      ${brow}
      <ellipse cx="28" cy="68" rx="6" ry="4" fill="#ff6f91" opacity=".55"/><ellipse cx="92" cy="68" rx="6" ry="4" fill="#ff6f91" opacity=".55"/>
      ${mouth}
    </svg>`;
  }
  function mascot(size, mood = 'happy', cls = '') {
    const hat = S.hat ? HATS.find((h) => h.id === S.hat) : null;
    return `<div class="mascot ${cls}" style="width:${size}px">${hat ? `<span class="hat" style="font-size:${Math.round(size * 0.42)}px;top:${-Math.round(size * 0.2)}px">${hat.e}</span>` : ''}${mascotSVG(mood)}</div>`;
  }

  /* ---------------- Utilitas UI ---------------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $app = document.getElementById('app');

  function toast(e, text) {
    const w = document.getElementById('toast-wrap');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="e">${e}</span>${text}`;
    w.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function modal(html) {
    closeModal();
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.id = 'modal';
    bg.innerHTML = `<div class="modal">${html}</div>`;
    document.body.appendChild(bg);
    return bg;
  }
  function closeModal() { document.getElementById('modal')?.remove(); }

  function confetti() {
    const c = document.getElementById('confetti'), ctx = c.getContext('2d');
    c.width = innerWidth * devicePixelRatio;
    c.height = innerHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff9600'];
    const ps = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      s: Math.random() * 8 + 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: pick(colors),
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of ps) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      }
      if (t - t0 < 3000) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ---------------- Status aplikasi ---------------- */
  let view = 'learn';
  let openPop = null;  // indeks node yang popover-nya terbuka
  let lesson = null;   // pelajaran yang sedang berjalan
  let result = null;   // layar hasil
  let blitz = null;    // latihan kilat
  let blitzTimer = null;

  /* ---------------- Kerangka halaman ---------------- */
  const NAV = [['learn', '🏠', 'Belajar'], ['blitz', '⏱️', 'Kilat'], ['shop', '🛍️', 'Toko'], ['profile', '😊', 'Profil']];
  const navItems = () => NAV.map(([id, ic, lab]) => `<button class="nav-item ${view === id ? 'active' : ''}" data-act="nav" data-id="${id}"><span class="ico">${ic}</span><span class="lab">${lab}</span></button>`).join('');
  const statsHTML = () => `
    <div class="stat fire ${S.lastDay === dayKey() ? '' : 'off'}" title="Runtunan hari"><span class="e">🔥</span>${S.streak}</div>
    <div class="stat gem" title="Permata"><span class="e">💎</span>${S.gems}</div>
    <div class="stat xp" title="XP hari ini"><span class="e">⚡</span>${S.today.xp}/${S.dailyGoal}</div>`;
  function goalCard() {
    const pct = Math.min(100, (S.today.xp / S.dailyGoal) * 100);
    return `<div class="card"><h3>Target Harian</h3>
      <div class="goal-row"><span class="big">${S.today.goalDone ? '🏅' : '🎯'}</span>
      <div style="flex:1"><div class="muted small" style="margin-bottom:6px">${S.today.goalDone ? 'Target tercapai! Hebat!' : `Kumpulkan ${S.dailyGoal} XP hari ini`}</div>
      <div class="bar"><div style="width:${pct}%"></div></div><div class="muted small" style="margin-top:4px">${S.today.xp} / ${S.dailyGoal} XP</div></div></div></div>`;
  }
  function shell(content) {
    return `<div class="layout">
      <nav class="sidebar"><div class="logo"><span>🧮</span>Jago Hitung</div>${navItems()}</nav>
      <main class="main"><div class="mobile-top stats">${statsHTML()}</div>${content}</main>
      <aside class="rightbar"><div class="stats">${statsHTML()}</div>${goalCard()}
        <div class="card"><h3>Latihan Kilat ⏱️</h3><p class="muted" style="margin:0 0 12px">Jawab sebanyak mungkin soal hitung dalam ${BLITZ_SECS} detik! Rekor: <b>${S.blitzBest}</b></p><button class="btn yellow block" data-act="nav" data-id="blitz">Main</button></div>
        <div class="card"><h3>Persiapan Olimpiade 🏆</h3><p class="muted" style="margin:0">Materi mengikuti Silabus OSN SD: Bilangan, Aritmatika, Geometri, Statistika & Pengukuran, dan Kombinatorik.</p></div>
      </aside></div><nav class="bottom-nav">${navItems()}</nav>`;
  }

  /* ---------------- Halaman Belajar (jalur) ---------------- */
  const OFF = [0, -60, -95, -60, 0, 60, 95, 60];
  const GREET = ['Ayo latihan hari ini! 💪', 'Kamu pasti bisa! ⭐', 'Satu pelajaran lagi, yuk!', 'Otak makin tajam! 🧠', 'Siap jadi juara olimpiade? 🏆'];
  let greet = pick(GREET);

  function viewLearn() {
    const si = S.sectionIdx, sec = SECTIONS[si];
    const tabs = SECTIONS.map((s, i) => `<button class="sec-tab ${i === si ? 'active' : ''}" style="--c:${s.color}" data-act="sec" data-i="${i}">${s.icon} ${s.title}</button>`).join('');
    const nodes = [...sec.units.map((u, i) => ({ u, i })), { exam: true, i: sec.units.length }];
    const currentIdx = nodes.findIndex((n) => (n.exam ? examUnlocked(sec) && !S.exams[sec.id] : unitUnlocked(sec, n.i) && done(n.u) < LESSONS_PER_LEVEL));
    const mIdx = sec.units.length > 3 ? 3 : 1;
    const path = nodes.map((n) => {
      const off = OFF[n.i % OFF.length];
      let inner, cls = '', label, popHTML = '';
      if (n.exam) {
        const unl = examUnlocked(sec);
        cls = `exam ${unl ? '' : 'locked'} ${S.exams[sec.id] ? 'mastered' : ''}`;
        inner = `<span class="ni">${S.exams[sec.id] ? '🏆' : '🎁'}</span>`;
        label = 'Ujian Bagian';
        if (openPop === n.i)
          popHTML = unl
            ? `<div class="pop"><h3>🏆 Ujian Bagian</h3><p>${EXAM_LEN} soal campuran dari semua topik ${esc(sec.title)}. Hadiah: 💎 30!</p><button class="btn" data-act="start" data-i="exam">Mulai ujian</button></div>`
            : `<div class="pop locked"><h3>🔒 Ujian Bagian</h3><p>Selesaikan level 1 di semua topik bagian ini dulu ya!</p></div>`;
      } else {
        const u = n.u, unl = unitUnlocked(sec, n.i);
        cls = `${unl ? '' : 'locked'} ${mastered(u) ? 'mastered' : ''}`;
        inner = `<span class="ni">${unl ? u.icon : '🔒'}</span>${crownsOf(u) ? `<span class="crowns">👑${crownsOf(u)}</span>` : ''}`;
        label = u.title;
        if (openPop === n.i)
          popHTML = unl
            ? `<div class="pop"><h3>${u.icon} ${esc(u.title)}</h3><p>${mastered(u) ? 'Sudah dikuasai! 👑 Latihan lagi biar makin jago.' : `Level ${levelOf(u)} dari ${MAX_LEVEL} · Pelajaran ${(done(u) % LESSONS_PER_LEVEL) + 1} dari ${LESSONS_PER_LEVEL}`}</p><button class="btn" data-act="start" data-i="${n.i}">Mulai +10 XP</button></div>`
            : `<div class="pop locked"><h3>🔒 ${esc(u.title)}</h3><p>Selesaikan level 1 topik sebelumnya untuk membuka ini!</p></div>`;
      }
      const ring = !n.exam && unitUnlocked(sec, n.i) ? `<span class="ring" style="--p:${ringPct(n.u)}"></span>` : '';
      const mascotHTML = n.i === mIdx
        ? `<div class="path-mascot" style="left:${off < 0 ? 150 : -190}px;top:-20px"><div class="bubble" style="width:170px;margin-bottom:10px">Halo ${esc(S.name)}! ${greet}</div>${mascot(110, 'happy', 'bounce')}</div>`
        : '';
      return `<div class="node-wrap" style="transform:translateX(${off}px);${openPop === n.i ? 'z-index:20' : ''}">
        ${n.i === currentIdx && openPop !== n.i ? '<div class="start-tip">MULAI</div>' : ''}
        ${ring}<button class="node ${cls}" data-act="node" data-i="${n.i}" aria-label="${esc(label)}">${inner}</button>
        <div class="node-label">${esc(label)}</div>${popHTML}${mascotHTML}</div>`;
    }).join('');
    return `<div style="--sec:${sec.color};--sec-d:${sec.dark}">
      <div class="sec-tabs">${tabs}</div>
      <div class="sec-banner"><div><div class="k">Bagian ${si + 1}</div><h2>${esc(sec.title)}</h2><p>${esc(sec.desc)}</p></div><div class="icon">${sec.icon}</div></div>
      <div class="path">${path}</div>
      ${si < SECTIONS.length - 1 ? `<div style="text-align:center;margin-top:10px"><button class="btn white" data-act="sec" data-i="${si + 1}">Bagian berikutnya: ${SECTIONS[si + 1].icon} ${esc(SECTIONS[si + 1].title)} →</button></div>` : ''}
    </div>`;
  }

  /* ---------------- Pelajaran ---------------- */
  function startLesson(i) {
    const sec = SECTIONS[S.sectionIdx];
    let qs, title, icon, level;
    if (i === 'exam') {
      const per = Math.ceil(EXAM_LEN / sec.units.length);
      qs = shuffle(sec.units.flatMap((u) => makeQuestions(u.gen, Math.max(levelOf(u), 2), per))).slice(0, EXAM_LEN);
      title = 'Ujian Bagian'; icon = '🏆'; level = null;
    } else {
      const u = sec.units[i];
      level = levelOf(u);
      qs = makeQuestions(u.gen, level, LESSON_LEN);
      title = u.title; icon = u.icon;
    }
    lesson = {
      si: S.sectionIdx, ui: i, title, icon, level, qs, total: qs.length, idx: 0, solved: 0,
      hearts: HEARTS, mistakes: 0, firstTry: 0, combo: 0, maxCombo: 0, start: Date.now(),
      state: 'ask', sel: null, input: '', anim: '', praise: '',
    };
    openPop = null;
    render();
    scrollTo(0, 0);
  }

  const PRAISE = ['Hebat!', 'Luar biasa!', 'Mantap!', 'Keren!', 'Pintar sekali!', 'Betul!', 'Jenius!', 'Wah, hebat!'];

  function renderLesson() {
    const L = lesson, q = L.qs[L.idx], sec = SECTIONS[L.si];
    const pct = L.state === 'ask' ? (L.solved / L.total) * 100 : (Math.min(L.solved, L.total) / L.total) * 100;
    const mood = L.state === 'right' ? 'happy' : L.state === 'wrong' ? 'sad' : 'think';
    let answer;
    if (q.kind === 'choice') {
      answer = `<div class="choices">${q.choices.map((c, i) => {
        let cls = '';
        if (L.state === 'ask') cls = L.sel === i ? 'sel' : '';
        else if (c === q.answer) cls = 'right';
        else if (L.sel === i) cls = 'wrong';
        return `<button class="choice ${q.big ? 'big' : ''} ${cls}" data-act="pick" data-i="${i}" ${L.state !== 'ask' ? 'disabled' : ''}><span class="k">${i + 1}</span>${c}</button>`;
      }).join('')}</div>`;
    } else {
      const cls = L.state === 'right' ? 'right' : L.state === 'wrong' ? 'wrong' : '';
      answer = `<div class="answer-box ${L.input ? '' : 'empty'} ${cls}">${L.input ? esc(L.input) : 'Ketik jawabanmu'}${L.state === 'ask' ? '<span class="caret"></span>' : ''}</div>
        <div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button class="key" data-act="key" data-id="${d}">${d}</button>`).join('')}
        <button class="key del" data-act="key" data-id="C">C</button><button class="key" data-act="key" data-id="0">0</button><button class="key del" data-act="key" data-id="del">⌫</button></div>`;
    }
    const ready = q.kind === 'choice' ? L.sel !== null : L.input.length > 0;
    let bar;
    if (L.state === 'ask') {
      bar = `<div class="check-bar"><div class="check-inner"><div></div><button class="btn" data-act="check" ${ready ? '' : 'disabled'}>Periksa</button></div></div>`;
    } else if (L.state === 'right') {
      bar = `<div class="check-bar right"><div class="check-inner"><div class="fb"><div class="ic">✅</div><div><h3>${L.praise}</h3>
        <div class="ex">${L.combo >= 3 ? `🔥 ${L.combo} benar berturut-turut!` : q.explain ? q.explain : ''}</div></div></div>
        <button class="btn" data-act="next">Lanjut</button></div></div>`;
    } else {
      bar = `<div class="check-bar wrong"><div class="check-inner"><div class="fb"><div class="ic">💡</div><div><h3>Jawaban benar: ${q.kind === 'choice' ? q.answer : q.answer.toLocaleString('id-ID')}</h3>
        <div class="ex">${q.explain || 'Tidak apa-apa, soal ini akan muncul lagi nanti!'}</div></div></div>
        <button class="btn red" data-act="next">Lanjut</button></div></div>`;
    }
    return `<div class="lesson" style="--sec:${sec.color};--sec-d:${sec.dark}">
      <div class="lesson-top"><button class="x-btn" data-act="quit" aria-label="Keluar">✕</button>
        <div class="bar"><div style="width:${pct}%"></div></div>
        <div class="combo-badge">${L.combo >= 3 ? `🔥 ${L.combo}` : ''}</div>
        <div class="hearts"><span class="e">❤️</span>${L.hearts}</div></div>
      <div class="lesson-body">
        <div class="q-kicker">${L.icon} ${esc(L.title)}${L.level ? ` · Level ${L.level}` : ''}${q._retry ? ' · <span style="color:var(--orange)">Coba lagi!</span>' : ''}</div>
        <div class="q-head">${mascot(92, mood, L.anim)}<div class="bubble">${q.q}</div></div>
        ${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
        ${q.hint ? `<div class="hint">💡 ${q.hint}</div>` : ''}
        ${answer}
      </div>${bar}</div>`;
  }

  function check() {
    const L = lesson, q = L.qs[L.idx];
    if (L.state !== 'ask') return;
    let ok;
    if (q.kind === 'choice') {
      if (L.sel === null) return;
      ok = q.choices[L.sel] === q.answer;
    } else {
      if (!L.input) return;
      ok = Number(L.input) === q.answer;
    }
    if (ok) {
      L.combo++;
      L.maxCombo = Math.max(L.maxCombo, L.combo);
      L.solved++;
      if (!q._retry) L.firstTry++;
      L.state = 'right';
      L.anim = 'jump';
      L.praise = pick(PRAISE);
      sfx('ok');
    } else {
      L.combo = 0;
      L.mistakes++;
      L.hearts--;
      L.state = 'wrong';
      L.anim = 'shake';
      if (!q._retry) L.qs.push({ ...q, _retry: true });
      sfx('bad');
    }
    render();
  }

  function nextQ() {
    const L = lesson;
    if (L.hearts <= 0) return finishLesson(false);
    L.idx++;
    if (L.idx >= L.qs.length) return finishLesson(true);
    L.state = 'ask'; L.sel = null; L.input = ''; L.anim = '';
    render();
    scrollTo(0, 0);
  }

  function finishLesson(success) {
    const L = lesson, sec = SECTIONS[L.si];
    const secs = Math.round((Date.now() - L.start) / 1000);
    const acc = Math.round((L.firstTry / L.total) * 100);
    if (!success) {
      result = { success: false, L };
      lesson = null;
      render();
      return;
    }
    const perfect = L.mistakes === 0;
    const isExam = L.ui === 'exam';
    const xp = (isExam ? 20 : 10) + (perfect ? 5 : 0);
    const gems = (isExam ? 30 : 5) + (perfect ? 5 : 0);
    let levelUp = null;
    if (isExam) S.exams[sec.id] = true;
    else {
      const u = sec.units[L.ui];
      const before = crownsOf(u);
      S.progress[u.id] = done(u) + 1;
      if (crownsOf(u) > before) levelUp = crownsOf(u);
    }
    S.lessonsDone++;
    if (perfect) S.perfect++;
    S.bestCombo = Math.max(S.bestCombo, L.maxCombo);
    S.gems += gems;
    addXP(xp);
    checkBadges();
    result = { success: true, xp, gems, acc, secs, perfect, levelUp, isExam, title: L.title };
    lesson = null;
    greet = pick(GREET);
    render();
    sfx('win');
    confetti();
  }

  function renderResult() {
    const r = result;
    if (!r.success) {
      return `<div class="result fail">${mascot(170, 'sad', 'shake')}
        <h1>Hati kamu habis 💔</h1><p class="muted" style="font-size:18px;max-width:420px;margin:0">Tidak apa-apa! Belajar itu memang ada salahnya. Coba lagi, pasti makin jago!</p>
        <div class="check-bar"><div class="check-inner"><button class="btn white" data-act="home">Kembali</button><button class="btn" data-act="retry" data-i="${r.L.ui}">Coba lagi</button></div></div></div>`;
    }
    const mm = Math.floor(r.secs / 60), ss = String(r.secs % 60).padStart(2, '0');
    return `<div class="result">${mascot(170, 'happy', 'bounce')}
      <h1>${r.isExam ? 'Ujian Lulus! 🏆' : r.perfect ? 'Sempurna! 💯' : 'Pelajaran Selesai!'}</h1>
      ${r.levelUp ? `<div class="bubble" style="font-size:18px">👑 ${esc(r.title)} naik ke <b>mahkota ${r.levelUp}</b>!${r.levelUp < MAX_LEVEL ? ' Soal berikutnya lebih menantang!' : ' Kamu sudah menguasai topik ini!'}</div>` : ''}
      <div class="res-cards">
        <div class="res-card" style="--c:var(--yellow)"><div class="t">Total XP</div><div class="v">⚡ ${r.xp}</div></div>
        <div class="res-card" style="--c:var(--green)"><div class="t">Akurasi</div><div class="v">🎯 ${r.acc}%</div></div>
        <div class="res-card" style="--c:var(--blue)"><div class="t">Permata</div><div class="v">💎 +${r.gems}</div></div>
      </div>
      <p class="muted" style="margin:0">⏱️ Waktu: ${mm}:${ss}</p>
      <div class="check-bar"><div class="check-inner"><div></div><button class="btn" data-act="home">Lanjut</button></div></div></div>`;
  }

  /* ---------------- Latihan Kilat ---------------- */
  function startBlitz() {
    blitz = { score: 0, left: BLITZ_SECS, q: genKilat(0), input: '', over: false, flash: '' };
    clearInterval(blitzTimer);
    blitzTimer = setInterval(() => {
      if (!blitz || blitz.over) return clearInterval(blitzTimer);
      blitz.left--;
      const el = document.getElementById('timer');
      if (el) { el.textContent = blitz.left; el.classList.toggle('low', blitz.left <= 10); }
      if (blitz.left <= 0) endBlitz();
    }, 1000);
    render();
  }
  function endBlitz() {
    clearInterval(blitzTimer);
    blitz.over = true;
    const isRecord = blitz.score > S.blitzBest;
    S.blitzBest = Math.max(S.blitzBest, blitz.score);
    blitz.xp = Math.min(30, blitz.score);
    blitz.gems = Math.floor(blitz.score / 3);
    blitz.record = isRecord && blitz.score > 0;
    S.gems += blitz.gems;
    if (blitz.xp > 0) addXP(blitz.xp);
    S.bestCombo = Math.max(S.bestCombo, blitz.score);
    checkBadges();
    save();
    sfx('win');
    if (blitz.score >= 5) confetti();
    render();
  }
  function blitzKey(k) {
    const b = blitz;
    if (!b || b.over) return;
    if (k === 'del') b.input = b.input.slice(0, -1);
    else if (k === 'C') b.input = '';
    else if (b.input.length < 6) b.input += k;
    const ans = String(b.q.answer);
    if (b.input === ans) {
      b.score++;
      sfx('ok');
      b.q = genKilat(b.score);
      b.input = '';
      b.flash = 'right';
    } else if (b.input.length >= ans.length && !ans.startsWith(b.input)) {
      sfx('bad');
      b.flash = 'wrong';
      b.input = '';
    } else b.flash = '';
    render();
  }
  function viewBlitz() {
    if (blitz && !blitz.over) {
      const b = blitz;
      return `<div class="lesson"><div class="lesson-top"><button class="x-btn" data-act="blitzquit">✕</button>
        <div style="flex:1;text-align:center"><span id="timer" class="timer ${b.left <= 10 ? 'low' : ''}">${b.left}</span></div>
        <div class="hearts" style="color:var(--yellow-d)"><span class="e">⭐</span>${b.score}</div></div>
        <div class="lesson-body" style="padding-bottom:60px">
          <div class="q-head">${mascot(80, b.flash === 'wrong' ? 'sad' : 'happy', b.flash === 'right' ? 'jump' : b.flash === 'wrong' ? 'shake' : '')}<div class="bubble">${b.q.q}</div></div>
          <div class="answer-box ${b.input ? '' : 'empty'} ${b.flash === 'wrong' ? 'wrong' : ''}">${b.input || 'Ketik jawabanmu'}<span class="caret"></span></div>
          <div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button class="key" data-act="bkey" data-id="${d}">${d}</button>`).join('')}
          <button class="key del" data-act="bkey" data-id="C">C</button><button class="key" data-act="bkey" data-id="0">0</button><button class="key del" data-act="bkey" data-id="del">⌫</button></div>
          <div style="text-align:center"><button class="btn ghost" data-act="bskip">Lewati soal ⏭️</button></div>
        </div></div>`;
    }
    if (blitz && blitz.over) {
      return shell(`<div class="blitz">${mascot(150, 'happy', 'bounce')}
        <h1 style="font-size:32px;color:var(--orange)">${blitz.record ? 'Rekor Baru! 🎉' : 'Waktu habis!'}</h1>
        <div class="res-cards">
          <div class="res-card" style="--c:var(--orange)"><div class="t">Skor</div><div class="v">⭐ ${blitz.score}</div></div>
          <div class="res-card" style="--c:var(--yellow)"><div class="t">XP</div><div class="v">⚡ ${blitz.xp}</div></div>
          <div class="res-card" style="--c:var(--blue)"><div class="t">Permata</div><div class="v">💎 +${blitz.gems}</div></div>
        </div>
        <p class="muted">Rekor kamu: <b>${S.blitzBest}</b></p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><button class="btn white" data-act="blitzreset">Selesai</button><button class="btn yellow" data-act="blitzstart">Main lagi</button></div></div>`);
    }
    return shell(`<div class="blitz">
      <div class="blitz-hero"><div style="font-size:60px">⏱️</div><h2>Latihan Kilat</h2><p style="margin:6px 0 0;font-size:17px">Jawab soal tambah, kurang, kali, dan bagi secepat mungkin dalam <b>${BLITZ_SECS} detik</b>!</p></div>
      ${mascot(120, 'happy', 'bounce')}
      <div class="card" style="width:100%"><div class="goal-row" style="justify-content:center"><span class="big">🏅</span><div><div class="muted">Rekor kamu</div><div style="font-size:30px;font-weight:900;color:var(--orange)">${S.blitzBest}</div></div></div></div>
      <p class="muted" style="margin:0">Tips: jawaban otomatis diperiksa saat kamu mengetik. Melatih kecepatan berhitung untuk olimpiade!</p>
      <button class="btn yellow" style="min-width:240px;font-size:18px" data-act="blitzstart">Mulai!</button></div>`);
  }

  /* ---------------- Toko ---------------- */
  function viewShop() {
    const items = HATS.map((h) => {
      const owned = S.owned.includes(h.id), wearing = S.hat === h.id;
      const btn = wearing ? `<button class="btn white" data-act="wear" data-id="">Lepas</button>`
        : owned ? `<button class="btn blue" data-act="wear" data-id="${h.id}">Pakai</button>`
        : `<button class="btn ${S.gems >= h.p ? '' : ''}" data-act="buy" data-id="${h.id}" ${S.gems >= h.p ? '' : 'disabled'}>💎 ${h.p}</button>`;
      return `<div class="shop-item ${wearing ? 'wearing' : ''}"><div class="e">${h.e}</div><div class="n">${h.n}</div>${btn}</div>`;
    }).join('');
    return shell(`<h1 class="page-title">Toko 🛍️</h1><p class="page-sub">Tukarkan permata 💎 yang kamu kumpulkan dari belajar!</p>
      <div class="card" style="display:flex;align-items:center;gap:18px;margin-bottom:22px">${mascot(100, 'happy', 'bounce')}<div><div class="muted">Permata kamu</div><div style="font-size:34px;font-weight:900;color:var(--blue)">💎 ${S.gems}</div></div></div>
      <h2 class="section-h">Perlengkapan</h2>
      <div class="shop-grid"><div class="shop-item"><div class="e">🧊</div><div class="n">Pembeku Api</div><div class="muted small">Menjaga runtunan 🔥 jika lupa latihan sehari. Punya: ${S.freeze}/2</div>
        <button class="btn blue" data-act="buy" data-id="freeze" ${S.gems >= 50 && S.freeze < 2 ? '' : 'disabled'}>💎 50</button></div></div>
      <h2 class="section-h">Topi untuk Momo</h2><div class="shop-grid">${items}</div>`);
  }
  function buy(id) {
    if (id === 'freeze') {
      if (S.gems < 50 || S.freeze >= 2) return;
      S.gems -= 50; S.freeze++;
      toast('🧊', 'Pembeku Api dibeli!');
    } else {
      const h = HATS.find((x) => x.id === id);
      if (!h || S.gems < h.p || S.owned.includes(id)) return;
      S.gems -= h.p; S.owned.push(id); S.hat = id;
      toast(h.e, `${h.n} dibeli! Momo memakainya sekarang.`);
    }
    sfx('buy');
    save();
    render();
  }

  /* ---------------- Profil & Pengaturan ---------------- */
  function viewProfile() {
    const DAYN = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const days = Array.from({ length: 7 }, (_, i) => addDays(dayKey(), i - 6));
    const max = Math.max(S.dailyGoal, ...days.map((d) => S.history[d] || 0));
    const week = days.map((d, i) => {
      const v = S.history[d] || 0;
      return `<div class="col ${i === 6 ? 'today' : ''}"><div class="n">${v || ''}</div><div class="b" style="height:${(v / max) * 100}%"></div><div class="d">${DAYN[new Date(d + 'T00:00').getDay()]}</div></div>`;
    }).join('');
    const secProg = SECTIONS.map((s) => {
      const tot = s.units.length * LESSONS_PER_LEVEL * MAX_LEVEL;
      const got = s.units.reduce((a, u) => a + Math.min(done(u), LESSONS_PER_LEVEL * MAX_LEVEL), 0);
      const pct = Math.round((got / tot) * 100);
      return `<div class="row" style="--c:${s.color}"><span class="lab">${s.icon} ${esc(s.title)}</span><div class="bar"><div style="width:${pct}%"></div></div><span class="small muted" style="width:44px;text-align:right">${pct}%</span></div>`;
    }).join('');
    const badges = BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? '' : 'off'}"><div class="e">${b.e}</div><div class="n">${b.n}</div><div class="d">${b.d}</div></div>`).join('');
    return shell(`<div class="profile-head">${mascot(110, 'happy', 'bounce')}<div><h2>${esc(S.name)}</h2><div class="muted">Calon juara olimpiade matematika 🏆</div></div></div>
      <h2 class="section-h" style="margin-top:0">Statistik</h2>
      <div class="stat-grid">
        <div class="stat-box"><span class="e">🔥</span><div><b>${S.streak} hari</b><span>Runtunan (terbaik ${S.bestStreak})</span></div></div>
        <div class="stat-box"><span class="e">⚡</span><div><b>${S.xp}</b><span>Total XP</span></div></div>
        <div class="stat-box"><span class="e">📚</span><div><b>${S.lessonsDone}</b><span>Pelajaran selesai</span></div></div>
        <div class="stat-box"><span class="e">⏱️</span><div><b>${S.blitzBest}</b><span>Rekor kilat</span></div></div>
      </div>
      <div class="card"><h3>XP 7 hari terakhir</h3><div class="week">${week}</div></div>
      <h2 class="section-h">Kemajuan per Bagian</h2><div class="card sec-progress">${secProg}</div>
      <h2 class="section-h">Lencana</h2><div class="badges">${badges}</div>
      <h2 class="section-h">Pengaturan (untuk orang tua)</h2>
      <div class="card form">
        <label>Nama anak<input type="text" maxlength="20" value="${esc(S.name)}" data-set="name" /></label>
        <label>Target harian<select data-set="dailyGoal">${[[20, 'Santai'], [30, 'Biasa'], [50, 'Serius'], [80, 'Juara']].map(([v, n]) => `<option value="${v}" ${S.dailyGoal === v ? 'selected' : ''}>${n} — ${v} XP per hari</option>`).join('')}</select></label>
        <label class="toggle">Suara efek<input type="checkbox" data-set="sound" ${S.sound ? 'checked' : ''} /></label>
        <label class="toggle"><span>Buka semua topik<br><span class="muted small">Anak bisa langsung memilih topik mana saja</span></span><input type="checkbox" data-set="unlockAll" ${S.unlockAll ? 'checked' : ''} /></label>
        <button class="btn red" data-act="reset" style="align-self:flex-start">Hapus semua progres</button>
      </div>
      <p class="muted small" style="margin-top:18px">Progres tersimpan di browser perangkat ini. Materi disusun berdasarkan Silabus OSN SD (Pusat Prestasi Nasional).</p>`);
  }

  function onboarding() {
    const m = modal(`${mascot(110, 'happy', 'bounce')}<h2>Halo! Aku Momo 👋</h2>
      <p class="muted" style="margin:0">Aku akan menemanimu berlatih matematika setiap hari. Siapa namamu?</p>
      <div class="form"><input type="text" id="ob-name" maxlength="20" placeholder="Tulis namamu" />
      <select id="ob-goal">${[[20, 'Santai — 2 pelajaran/hari'], [30, 'Biasa — 3 pelajaran/hari'], [50, 'Serius — 5 pelajaran/hari']].map(([v, n]) => `<option value="${v}" ${v === 30 ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <button class="btn block" data-act="ob-done">Ayo mulai!</button>`);
    setTimeout(() => m.querySelector('#ob-name')?.focus(), 50);
  }

  /* ---------------- Render ---------------- */
  function render() {
    if (lesson) $app.innerHTML = renderLesson();
    else if (result) $app.innerHTML = renderResult();
    else if (view === 'blitz') $app.innerHTML = viewBlitz();
    else if (view === 'shop') $app.innerHTML = viewShop();
    else if (view === 'profile') $app.innerHTML = viewProfile();
    else $app.innerHTML = shell(viewLearn());
  }

  /* ---------------- Event ---------------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) {
      if (openPop !== null && !e.target.closest('.pop')) { openPop = null; render(); }
      return;
    }
    const act = el.dataset.act, id = el.dataset.id, i = el.dataset.i;
    switch (act) {
      case 'nav':
        view = id; openPop = null;
        if (id === 'blitz' && blitz?.over) blitz = null;
        render(); scrollTo(0, 0); break;
      case 'sec': S.sectionIdx = Number(i); openPop = null; save(); render(); scrollTo(0, 0); break;
      case 'node': openPop = openPop === Number(i) ? null : Number(i); sfx('tap'); render(); break;
      case 'start': startLesson(i === 'exam' ? 'exam' : Number(i)); break;
      case 'pick': if (lesson.state === 'ask') { lesson.sel = Number(i); sfx('tap'); render(); } break;
      case 'key': lessonKey(id); break;
      case 'check': check(); break;
      case 'next': nextQ(); break;
      case 'quit':
        modal(`${mascot(110, 'sad')}<h2>Yakin mau berhenti?</h2><p class="muted" style="margin:0">Progres pelajaran ini akan hilang.</p>
          <button class="btn block" data-act="modal-close">Lanjut belajar</button><button class="btn ghost block" data-act="quit-yes">Berhenti</button>`);
        break;
      case 'quit-yes': closeModal(); lesson = null; render(); break;
      case 'modal-close': closeModal(); break;
      case 'home': result = null; view = 'learn'; render(); scrollTo(0, 0); break;
      case 'retry': result = null; startLesson(i === 'exam' ? 'exam' : Number(i)); break;
      case 'blitzstart': startBlitz(); break;
      case 'bkey': blitzKey(id); break;
      case 'bskip': if (blitz && !blitz.over) { blitz.q = genKilat(blitz.score); blitz.input = ''; blitz.flash = ''; render(); } break;
      case 'blitzquit': clearInterval(blitzTimer); blitz = null; render(); break;
      case 'blitzreset': blitz = null; view = 'learn'; render(); break;
      case 'buy': buy(id); break;
      case 'wear': S.hat = id || null; save(); sfx('tap'); render(); break;
      case 'reset':
        modal(`${mascot(110, 'sad')}<h2>Hapus semua progres?</h2><p class="muted" style="margin:0">XP, runtunan, permata, topi, dan kemajuan topik akan kembali ke awal. Tindakan ini tidak bisa dibatalkan.</p>
          <button class="btn red block" data-act="reset-yes">Ya, hapus</button><button class="btn ghost block" data-act="modal-close">Batal</button>`);
        break;
      case 'reset-yes': S = structuredClone(DEFAULT); save(); closeModal(); view = 'learn'; render(); onboarding(); break;
      case 'ob-done': {
        const name = document.getElementById('ob-name').value.trim();
        S.name = name || 'Jagoan';
        S.dailyGoal = Number(document.getElementById('ob-goal').value) || 30;
        S.onboarded = true;
        save(); closeModal(); render(); sfx('win');
        break;
      }
    }
  });

  document.addEventListener('change', (e) => {
    const k = e.target.dataset?.set;
    if (!k) return;
    if (k === 'name') S.name = e.target.value.trim() || 'Jagoan';
    else if (k === 'dailyGoal') {
      S.dailyGoal = Number(e.target.value);
      S.today.goalDone = S.today.xp >= S.dailyGoal ? S.today.goalDone : false;
    } else S[k] = e.target.checked;
    save();
    render();
  });

  function lessonKey(k) {
    const L = lesson;
    if (!L || L.state !== 'ask' || L.qs[L.idx].kind !== 'input') return;
    if (k === 'del') L.input = L.input.slice(0, -1);
    else if (k === 'C') L.input = '';
    else if (L.input.length < 7) L.input = L.input === '0' ? k : L.input + k;
    render();
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.matches?.('input, select, textarea')) {
      if (e.key === 'Enter' && document.getElementById('ob-name')) document.querySelector('[data-act="ob-done"]')?.click();
      return;
    }
    if (document.getElementById('modal')) return;
    const k = e.key;
    if (blitz && !blitz.over && view === 'blitz' && !lesson) {
      if (/^[0-9]$/.test(k)) blitzKey(k);
      else if (k === 'Backspace') blitzKey('del');
      return;
    }
    if (!lesson) return;
    const q = lesson.qs[lesson.idx];
    if (k === 'Enter') {
      e.preventDefault();
      if (lesson.state === 'ask') check();
      else nextQ();
      return;
    }
    if (lesson.state !== 'ask') return;
    if (q.kind === 'input') {
      if (/^[0-9]$/.test(k)) lessonKey(k);
      else if (k === 'Backspace') lessonKey('del');
    } else if (/^[1-9]$/.test(k) && Number(k) <= q.choices.length) {
      lesson.sel = Number(k) - 1;
      sfx('tap');
      render();
    }
  });

  /* ---------------- Mulai ---------------- */
  refreshDay();
  render();
  if (!S.onboarded) onboarding();
})();
