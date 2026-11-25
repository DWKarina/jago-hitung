/* =========================================================
   Jago Hitung — Generator Soal
   Disusun mengikuti Silabus OSN SD (Matematika):
   1. Bilangan  2. Aritmatika  3. Geometri
   4. Statistika Data & Pengukuran  5. Kombinatorik
   Setiap generator menerima level 1..3 dan mengembalikan objek soal:
   { kind: 'input'|'choice', q, answer, choices?, visual?, explain? }
   ========================================================= */

const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[R(0, arr.length - 1)];
const chance = (p) => Math.random() < p;
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = R(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a * b) / gcd(a, b);
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
const factors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const fmt = (n) => n.toLocaleString('id-ID');
const pad2 = (n) => String(n).padStart(2, '0');

function numChoices(ans, spread = 5, min = 0) {
  const set = new Set([ans]);
  let guard = 0;
  while (set.size < 4 && guard++ < 200) {
    const v = ans + R(1, spread) * (chance(0.5) ? -1 : 1);
    if (v >= min) set.add(v);
  }
  let k = 1;
  while (set.size < 4) set.add(ans + spread + k++);
  return [...set];
}

const inp = (q, answer, o = {}) => ({ kind: 'input', q, answer: Number(answer), ...o });
const ch = (q, choices, answer, o = {}) => ({
  kind: 'choice',
  q,
  choices: shuffle(choices.map(String)),
  answer: String(answer),
  ...o,
});
const eq = (s) => `<div class="eq">${s}</div>`;
const BOX = '<span class="box">?</span>';
const f = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

const NAMES = ['Budi', 'Siti', 'Andi', 'Rina', 'Dodi', 'Ayu', 'Raka', 'Nadia', 'Bima', 'Lala', 'Tono', 'Mira'];
const ITEMS = [
  ['kelereng', '🔵'], ['permen', '🍬'], ['apel', '🍎'], ['buku', '📘'], ['bola', '⚽'],
  ['kue', '🧁'], ['bunga', '🌸'], ['bintang', '⭐'], ['jeruk', '🍊'], ['pensil', '✏️'],
];
const twoNames = () => {
  const a = pick(NAMES);
  let b = pick(NAMES);
  while (b === a) b = pick(NAMES);
  return [a, b];
};

const emojiRow = (e, n, gone = 0) =>
  `<div class="emoji-row">${Array.from({ length: n }, (_, i) => `<span class="${i >= n - gone ? 'gone' : ''}">${e}</span>`).join('')}</div>`;
const groupsVis = (e, g, n) =>
  `<div class="groups">${Array.from({ length: g }, () => `<div class="grp">${e.repeat(n)}</div>`).join('')}</div>`;
const svg = (inner, w = 200, h = 160) => `<svg viewBox="0 0 ${w} ${h}" class="vis-svg" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

/* ---------------- Gambar (SVG) ---------------- */
const regPts = (n, cx, cy, r, rot = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 * i) / n) * Math.PI) / 180;
    return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
  });
const poly = (pts, fill = '#84d8ff', stroke = '#1899d6') =>
  `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;

const SHAPES = {
  segitiga: { name: 'Segitiga', sides: 3, sym: 3, rot: 3, pts: () => regPts(3, 100, 95, 72) },
  persegi: { name: 'Persegi', sides: 4, sym: 4, rot: 4, pts: () => [[45, 25], [155, 25], [155, 135], [45, 135]] },
  persegiPanjang: { name: 'Persegi Panjang', sides: 4, sym: 2, rot: 2, pts: () => [[15, 40], [185, 40], [185, 120], [15, 120]] },
  segilima: { name: 'Segi Lima', sides: 5, sym: 5, rot: 5, pts: () => regPts(5, 100, 85, 68) },
  segienam: { name: 'Segi Enam', sides: 6, sym: 6, rot: 6, pts: () => regPts(6, 100, 80, 68, 0) },
  segidelapan: { name: 'Segi Delapan', sides: 8, sym: 8, rot: 8, pts: () => regPts(8, 100, 80, 68, 22.5) },
  trapesium: { name: 'Trapesium', sides: 4, sym: 1, rot: 1, pts: () => [[60, 35], [140, 35], [185, 130], [15, 130]] },
  jajargenjang: { name: 'Jajar Genjang', sides: 4, sym: 0, rot: 2, pts: () => [[60, 35], [188, 35], [140, 130], [12, 130]] },
  belahKetupat: { name: 'Belah Ketupat', sides: 4, sym: 2, rot: 2, pts: () => [[100, 10], [165, 80], [100, 150], [35, 80]] },
  lingkaran: { name: 'Lingkaran', sides: 0 },
};
function shapeSVG(key) {
  if (key === 'lingkaran') return svg('<circle cx="100" cy="80" r="65" fill="#84d8ff" stroke="#1899d6" stroke-width="4"/>');
  return svg(poly(SHAPES[key].pts()));
}

function rectLabeled(p, l, unit = 'cm', square = false) {
  const W = square ? 110 : 160, H = square ? 110 : 90;
  const x = (220 - W) / 2, y = (170 - H) / 2;
  return svg(
    `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="4" fill="#ffe28a" stroke="#e5a800" stroke-width="4"/>
     <text x="110" y="${y - 8}" class="svg-label" text-anchor="middle">${p} ${unit}</text>
     <text x="${x + W + 8}" y="${y + H / 2 + 6}" class="svg-label">${l} ${unit}</text>`,
    240, 170
  );
}

function triLabeled(a, b, c) {
  return svg(
    `${poly([[110, 15], [200, 150], [20, 150]], '#c9f29b', '#58a700')}
     <text x="50" y="80" class="svg-label" text-anchor="middle">${a} cm</text>
     <text x="172" y="80" class="svg-label" text-anchor="middle">${b} cm</text>
     <text x="110" y="172" class="svg-label" text-anchor="middle">${c} cm</text>`,
    220, 180
  );
}

function gridSVG(w, h, cells) {
  // cells: Set "x,y" yang diwarnai; grid w x h
  const s = 26, W = w * s + 4, H = h * s + 4;
  let out = '';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const on = cells.has(`${x},${y}`);
      out += `<rect x="${2 + x * s}" y="${2 + y * s}" width="${s}" height="${s}" fill="${on ? '#ffc800' : '#fff'}" stroke="${on ? '#e5a800' : '#d0d0d0'}" stroke-width="2"/>`;
    }
  return svg(out, W, H);
}

function triangleCountSVG(k) {
  let lines = '';
  for (let i = 1; i <= k; i++) {
    const x = 20 + (160 * i) / (k + 1);
    lines += `<line x1="100" y1="15" x2="${x}" y2="145" stroke="#ce82ff" stroke-width="4"/>`;
  }
  return svg(`${poly([[100, 15], [180, 145], [20, 145]], '#f3e3ff', '#ce82ff')}${lines}`);
}
function squareGridSVG(n) {
  const s = 120 / n;
  let o = '';
  for (let i = 0; i <= n; i++) {
    o += `<line x1="${40 + i * s}" y1="20" x2="${40 + i * s}" y2="140" stroke="#ff9600" stroke-width="4"/>`;
    o += `<line x1="40" y1="${20 + i * s}" x2="160" y2="${20 + i * s}" stroke="#ff9600" stroke-width="4"/>`;
  }
  return svg(`<rect x="40" y="20" width="120" height="120" fill="#fff1dd"/>${o}`);
}

function angleSVG(deg) {
  const vx = 50, vy = 130, L = 120;
  const rad = (deg * Math.PI) / 180;
  const x2 = vx + L * Math.cos(rad), y2 = vy - L * Math.sin(rad);
  const r = 32;
  let mark;
  if (deg === 90) {
    mark = `<path d="M${vx + 22} ${vy} L${vx + 22} ${vy - 22} L${vx} ${vy - 22}" fill="none" stroke="#ff4b4b" stroke-width="4"/>`;
  } else {
    const ax = vx + r * Math.cos(rad), ay = vy - r * Math.sin(rad);
    mark = `<path d="M${vx + r} ${vy} A${r} ${r} 0 0 0 ${ax.toFixed(1)} ${ay.toFixed(1)}" fill="none" stroke="#ff4b4b" stroke-width="4"/>`;
  }
  const minX = Math.min(0, x2 - 10);
  return `<svg viewBox="${minX} 0 ${200 - minX} 150" class="vis-svg" xmlns="http://www.w3.org/2000/svg">
    <line x1="${vx}" y1="${vy}" x2="${vx + L + 20}" y2="${vy}" stroke="#4b4b4b" stroke-width="6" stroke-linecap="round"/>
    <line x1="${vx}" y1="${vy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#4b4b4b" stroke-width="6" stroke-linecap="round"/>
    ${mark}<circle cx="${vx}" cy="${vy}" r="6" fill="#1cb0f6"/></svg>`;
}

function clockSVG(h, m) {
  const cx = 80, cy = 80;
  let nums = '';
  for (let i = 1; i <= 12; i++) {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    nums += `<text x="${(cx + 56 * Math.cos(a)).toFixed(1)}" y="${(cy + 56 * Math.sin(a) + 6).toFixed(1)}" text-anchor="middle" class="clock-num">${i}</text>`;
  }
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = ((i * 6 - 90) * Math.PI) / 180, r1 = i % 5 ? 70 : 66;
    ticks += `<line x1="${(cx + r1 * Math.cos(a)).toFixed(1)}" y1="${(cy + r1 * Math.sin(a)).toFixed(1)}" x2="${(cx + 73 * Math.cos(a)).toFixed(1)}" y2="${(cy + 73 * Math.sin(a)).toFixed(1)}" stroke="#afafaf" stroke-width="${i % 5 ? 1.5 : 3}"/>`;
  }
  const ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
  return svg(
    `<circle cx="${cx}" cy="${cy}" r="76" fill="#fff" stroke="#1cb0f6" stroke-width="6"/>${ticks}${nums}
     <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 38}" stroke="#4b4b4b" stroke-width="7" stroke-linecap="round" transform="rotate(${ha} ${cx} ${cy})"/>
     <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 58}" stroke="#ff4b4b" stroke-width="4" stroke-linecap="round" transform="rotate(${ma} ${cx} ${cy})"/>
     <circle cx="${cx}" cy="${cy}" r="6" fill="#4b4b4b"/>`,
    160, 160
  );
}

function fractionSVG(k, n) {
  if (chance(0.5)) {
    let o = '';
    for (let i = 0; i < n; i++) {
      const a1 = ((i * 360) / n - 90) * (Math.PI / 180), a2 = (((i + 1) * 360) / n - 90) * (Math.PI / 180);
      const x1 = 80 + 65 * Math.cos(a1), y1 = 80 + 65 * Math.sin(a1), x2 = 80 + 65 * Math.cos(a2), y2 = 80 + 65 * Math.sin(a2);
      const large = 360 / n > 180 ? 1 : 0;
      o += `<path d="M80 80 L${x1.toFixed(1)} ${y1.toFixed(1)} A65 65 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${i < k ? '#ffc800' : '#fff'}" stroke="#4b4b4b" stroke-width="3" stroke-linejoin="round"/>`;
    }
    return svg(o, 160, 160);
  }
  const w = 200 / n;
  let o = '';
  for (let i = 0; i < n; i++) o += `<rect x="${10 + i * w}" y="30" width="${w}" height="70" fill="${i < k ? '#ff86d0' : '#fff'}" stroke="#4b4b4b" stroke-width="3"/>`;
  return svg(o, 220, 130);
}

function isoBlockSVG(a, b, c) {
  const s = 26, w = s * 0.866, h = s * 0.5, pad = 6;
  const ox = b * w + pad, oy = c * s + pad;
  const P = (i, j, k) => `${(ox + (i - j) * w).toFixed(1)},${(oy + (i + j) * h - k * s).toFixed(1)}`;
  const cubes = [];
  for (let k = 0; k < c; k++) for (let j = 0; j < b; j++) for (let i = 0; i < a; i++) cubes.push([i, j, k]);
  cubes.sort((p, q) => p[0] + p[1] + p[2] - (q[0] + q[1] + q[2]));
  let o = '';
  for (const [i, j, k] of cubes) {
    o += `<polygon points="${P(i, j, k + 1)} ${P(i + 1, j, k + 1)} ${P(i + 1, j + 1, k + 1)} ${P(i, j + 1, k + 1)}" fill="#a5e4ff" stroke="#fff" stroke-width="1.5"/>`;
    o += `<polygon points="${P(i + 1, j, k)} ${P(i + 1, j + 1, k)} ${P(i + 1, j + 1, k + 1)} ${P(i + 1, j, k + 1)}" fill="#1899d6" stroke="#fff" stroke-width="1.5"/>`;
    o += `<polygon points="${P(i, j + 1, k)} ${P(i + 1, j + 1, k)} ${P(i + 1, j + 1, k + 1)} ${P(i, j + 1, k + 1)}" fill="#1cb0f6" stroke="#fff" stroke-width="1.5"/>`;
  }
  return svg(o, (a + b) * w + pad * 2, (a + b) * h + c * s + pad * 2);
}

function barChartSVG(labels, values, colors) {
  const W = 300, H = 210, left = 30, bottom = 170, top = 15, max = 10;
  const unit = (bottom - top) / max;
  let o = '';
  for (let v = 0; v <= max; v += 2) {
    const y = bottom - v * unit;
    o += `<line x1="${left}" y1="${y}" x2="${W - 5}" y2="${y}" stroke="#eee" stroke-width="1.5"/><text x="${left - 6}" y="${y + 4}" text-anchor="end" class="svg-small">${v}</text>`;
  }
  const bw = (W - left - 20) / labels.length;
  labels.forEach((lab, i) => {
    const x = left + 10 + i * bw, bh = values[i] * unit;
    o += `<rect x="${x + 6}" y="${bottom - bh}" width="${bw - 18}" height="${bh}" rx="5" fill="${colors[i]}"/>`;
    o += `<text x="${x + bw / 2 - 3}" y="${bottom + 26}" text-anchor="middle" class="svg-emoji">${lab}</text>`;
  });
  o += `<line x1="${left}" y1="${bottom}" x2="${W - 5}" y2="${bottom}" stroke="#4b4b4b" stroke-width="2"/>`;
  return svg(o, W, H);
}

/* =========================================================
   ARITMATIKA
   ========================================================= */
function genTambah(l) {
  if (l === 1) {
    if (chance(0.5)) {
      const a = R(1, 9), b = R(1, 9), [, e] = pick(ITEMS);
      return inp(eq(`${a} + ${b} = ?`), a + b, { visual: `<div class="emoji-sum">${emojiRow(e, a)}<b>+</b>${emojiRow(e, b)}</div>` });
    }
    const a = R(10, 40), b = R(2, 9);
    return inp(eq(`${a} + ${b} = ?`), a + b);
  }
  if (l === 2) {
    const a = R(12, 89), b = R(11, 89);
    if (chance(0.3)) return ch(eq(`${a} + ${b} = ?`), numChoices(a + b, 10), a + b);
    return inp(eq(`${a} + ${b} = ?`), a + b);
  }
  if (chance(0.5)) {
    const a = R(100, 599), b = R(100, 399);
    return inp(eq(`${a} + ${b} = ?`), a + b);
  }
  const a = R(11, 60), b = R(11, 60), c = R(11, 60);
  return inp(eq(`${a} + ${b} + ${c} = ?`), a + b + c);
}

function genKurang(l) {
  if (l === 1) {
    if (chance(0.5)) {
      const a = R(4, 10), b = R(1, a - 1), [, e] = pick(ITEMS);
      return inp(eq(`${a} − ${b} = ?`), a - b, { visual: emojiRow(e, a, b) });
    }
    const a = R(11, 30), b = R(1, 9);
    return inp(eq(`${a} − ${b} = ?`), a - b);
  }
  if (l === 2) {
    const a = R(30, 99), b = R(11, a - 5);
    if (chance(0.3)) return ch(eq(`${a} − ${b} = ?`), numChoices(a - b, 10), a - b);
    return inp(eq(`${a} − ${b} = ?`), a - b);
  }
  if (chance(0.3)) {
    const b = R(101, 899);
    return inp(eq(`1.000 − ${b} = ?`), 1000 - b);
  }
  const a = R(200, 999), b = R(100, a - 10);
  return inp(eq(`${a} − ${b} = ?`), a - b);
}

function genKali(l) {
  if (l === 1) {
    const t = pick([2, 3, 5, 10]), n = R(1, 6), [nm, e] = pick(ITEMS);
    if (t * n <= 30 && chance(0.6)) {
      return inp(eq(`${n} × ${t} = ?`), n * t, {
        visual: groupsVis(e, n, t),
        hint: `${n} kelompok, setiap kelompok ada ${t} ${nm}.`,
        explain: `${n} × ${t} artinya ${Array(n).fill(t).join(' + ')} = ${n * t}`,
      });
    }
    return inp(eq(`${t} × ${n} = ?`), t * n);
  }
  if (l === 2) {
    const a = R(2, 10), b = R(2, 10);
    if (chance(0.3)) return ch(eq(`${a} × ${b} = ?`), numChoices(a * b, 6, 1), a * b);
    return inp(eq(`${a} × ${b} = ?`), a * b);
  }
  const t = R(1, 3);
  if (t === 1) {
    const a = R(11, 30), b = R(2, 9);
    return inp(eq(`${a} × ${b} = ?`), a * b, { explain: `${a} × ${b} = (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}) = ${a * b}` });
  }
  if (t === 2) {
    const a = R(2, 99), m = pick([10, 100]);
    return inp(eq(`${a} × ${m} = ?`), a * m, { explain: `Kali ${m} → tambahkan ${m === 10 ? 'satu' : 'dua'} angka 0 di belakang: ${a * m}` });
  }
  const a = R(2, 5), b = R(2, 5), c = R(2, 5);
  return inp(eq(`${a} × ${b} × ${c} = ?`), a * b * c);
}

function genBagi(l) {
  if (l === 1) {
    const d = pick([2, 3, 5]), q = R(1, 5), [nm, e] = pick(ITEMS), n = d * q;
    if (chance(0.6))
      return inp(
        `${n} ${nm} dibagi sama rata untuk ${d} anak. Setiap anak mendapat berapa?`,
        q,
        { visual: emojiRow(e, n), explain: `${n} ÷ ${d} = ${q}, karena ${d} × ${q} = ${n}` }
      );
    return inp(eq(`${n} ÷ ${d} = ?`), q, { explain: `${n} ÷ ${d} = ${q}, karena ${d} × ${q} = ${n}` });
  }
  if (l === 2) {
    const d = R(2, 10), q = R(2, 10);
    return inp(eq(`${d * q} ÷ ${d} = ?`), q, { explain: `Ingat perkalian: ${d} × ${q} = ${d * q}` });
  }
  if (chance(0.5)) {
    const d = R(2, 6), q = R(11, 25);
    return inp(eq(`${d * q} ÷ ${d} = ?`), q, { explain: `${d} × ${q} = ${d * q}, jadi ${d * q} ÷ ${d} = ${q}` });
  }
  const d = R(3, 9), q = R(2, 9), r = R(1, d - 1), n = d * q + r;
  return inp(`${eq(`${n} ÷ ${d} = ${q} sisa ?`)}`, r, { explain: `${d} × ${q} = ${d * q}. ${n} − ${d * q} = ${r}` });
}

function genKotak(l) {
  if (l === 1) {
    if (chance(0.5)) {
      const a = R(1, 20), x = R(1, 20);
      return inp(`Berapa angka di dalam kotak? ${eq(`${a} + ${BOX} = ${a + x}`)}`, x, { explain: `${a + x} − ${a} = ${x}` });
    }
    const x = R(10, 30), b = R(1, 9);
    return inp(`Berapa angka di dalam kotak? ${eq(`${BOX} − ${b} = ${x - b}`)}`, x, { explain: `${x - b} + ${b} = ${x}` });
  }
  if (l === 2) {
    const x = R(2, 10), b = R(2, 10);
    if (chance(0.5)) return inp(`Berapa angka di dalam kotak? ${eq(`${BOX} × ${b} = ${x * b}`)}`, x, { explain: `${x * b} ÷ ${b} = ${x}` });
    return inp(`Berapa angka di dalam kotak? ${eq(`${x * b} ÷ ${BOX} = ${b}`)}`, x, { explain: `${x * b} ÷ ${b} = ${x}` });
  }
  const x = R(2, 9), m = R(2, 5), c = R(1, 9);
  if (chance(0.5))
    return inp(`Berapa angka di dalam kotak? ${eq(`${m} × ${BOX} + ${c} = ${m * x + c}`)}`, x, {
      explain: `${m * x + c} − ${c} = ${m * x}, lalu ${m * x} ÷ ${m} = ${x}`,
    });
  return inp(`Berapa angka di dalam kotak? ${eq(`(${BOX} + ${c}) × ${m} = ${(x + c) * m}`)}`, x, {
    explain: `${(x + c) * m} ÷ ${m} = ${x + c}, lalu ${x + c} − ${c} = ${x}`,
  });
}

function genCampuran(l) {
  if (l === 1) {
    const a = R(5, 30), b = R(1, 20), c = R(1, a + b);
    return inp(eq(`${a} + ${b} − ${c} = ?`), a + b - c, { explain: `Kerjakan dari kiri: ${a} + ${b} = ${a + b}, lalu ${a + b} − ${c} = ${a + b - c}` });
  }
  if (l === 2) {
    const b = R(2, 9), c = R(2, 9);
    if (chance(0.5)) {
      const a = R(1, 30);
      return inp(eq(`${a} + ${b} × ${c} = ?`), a + b * c, { explain: `Kali dulu! ${b} × ${c} = ${b * c}, lalu ${a} + ${b * c} = ${a + b * c}` });
    }
    const a = R(b * c + 1, b * c + 40);
    return inp(eq(`${a} − ${b} × ${c} = ?`), a - b * c, { explain: `Kali dulu! ${b} × ${c} = ${b * c}, lalu ${a} − ${b * c} = ${a - b * c}` });
  }
  const t = R(1, 3);
  if (t === 1) {
    const a = R(2, 9), b = R(2, 9), c = R(2, 5), d = R(1, (a + b) * c - 1);
    return inp(eq(`(${a} + ${b}) × ${c} − ${d} = ?`), (a + b) * c - d, {
      explain: `Kurung dulu: ${a} + ${b} = ${a + b}. Lalu × ${c} = ${(a + b) * c}. Lalu − ${d} = ${(a + b) * c - d}`,
    });
  }
  if (t === 2) {
    const a = R(2, 9), b = R(2, 9), d = R(2, 5), k = R(2, 9);
    return inp(eq(`${a} × ${b} + ${d * k} ÷ ${d} = ?`), a * b + k, {
      explain: `× dan ÷ dulu: ${a} × ${b} = ${a * b}, ${d * k} ÷ ${d} = ${k}. Lalu ${a * b} + ${k} = ${a * b + k}`,
    });
  }
  const c = R(2, 6), d = R(2, 6), a = R(2, 9), lo = Math.ceil((c * d + 1) / a), b = R(lo, lo + 8);
  return inp(eq(`${a} × ${b} − ${c} × ${d} = ?`), a * b - c * d, {
    explain: `${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d}. Lalu ${a * b} − ${c * d} = ${a * b - c * d}`,
  });
}

function genCerita(l) {
  const [N, N2] = twoNames();
  const [item, e] = pick(ITEMS);
  if (l === 1) {
    if (chance(0.5)) {
      const a = R(5, 30), b = R(2, 20);
      return inp(`${e} ${N} punya ${a} ${item}. Ibu memberi ${b} ${item} lagi. Berapa ${item} ${N} sekarang?`, a + b, { explain: `${a} + ${b} = ${a + b}` });
    }
    const a = R(10, 40), b = R(2, a - 2);
    return inp(`${e} ${N} punya ${a} ${item}. Sebanyak ${b} ${item} diberikan kepada ${N2}. Berapa sisa ${item} ${N}?`, a - b, { explain: `${a} − ${b} = ${a - b}` });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const g = R(2, 9), n = R(2, 10);
      return inp(`📦 Ada ${g} kotak. Setiap kotak berisi ${n} ${item}. Berapa banyak ${item} semuanya?`, g * n, { explain: `${g} × ${n} = ${g * n}` });
    }
    const k = R(2, 9), q = R(2, 10);
    return inp(`${e} Ada ${k * q} ${item} dibagi sama rata kepada ${k} anak. Berapa ${item} yang didapat setiap anak?`, q, { explain: `${k * q} ÷ ${k} = ${q}` });
  }
  if (chance(0.5)) {
    const g = R(3, 8), n = R(4, 10), b = R(2, g * n - 2);
    return inp(`🛒 ${N} membeli ${g} bungkus ${item}. Setiap bungkus berisi ${n}. Lalu ${b} ${item} dibagikan ke teman. Berapa sisanya?`, g * n - b, {
      explain: `${g} × ${n} = ${g * n}, lalu ${g * n} − ${b} = ${g * n - b}`,
    });
  }
  const p = pick([500, 1000, 1500, 2000, 2500]), k = R(2, 6), total = p * k;
  const pay = total <= 5000 ? 5000 : total <= 10000 ? 10000 : 20000;
  return inp(`💰 Harga 1 pensil Rp${fmt(p)}. ${N} membeli ${k} pensil dan membayar dengan uang Rp${fmt(pay)}. Berapa rupiah kembaliannya?`, pay - total, {
    explain: `${k} × ${fmt(p)} = ${fmt(total)}. Kembalian: ${fmt(pay)} − ${fmt(total)} = ${fmt(pay - total)}`,
  });
}

function genTrik(l) {
  if (l === 1) {
    const t = R(1, 3);
    if (t === 1) {
      const a = R(2, 9), c = R(3, 5);
      return inp(eq(`${Array(c).fill(a).join(' + ')} = ?`), a * c, { explain: `Ada ${c} angka ${a}, jadi ${c} × ${a} = ${a * c}` });
    }
    if (t === 2) {
      const a = R(11, 49);
      return inp(`Berapa <b>dua kali</b> ${a}?`, a * 2, { explain: `${a} + ${a} = ${a * 2}` });
    }
    const x = R(1, 99);
    return inp(eq(`100 − ${x} = ?`), 100 - x);
  }
  if (l === 2) {
    const t = R(1, 3);
    if (t === 1) {
      const n = pick([4, 6, 8, 10]);
      return inp(eq(`1 + 2 + 3 + ... + ${n} = ?`), (n * (n + 1)) / 2, {
        explain: `Trik pasangan: (1 + ${n}) = ${n + 1}, ada ${n / 2} pasangan → ${n / 2} × ${n + 1} = ${(n * (n + 1)) / 2}`,
      });
    }
    if (t === 2) {
      const k = R(2, 9);
      return inp(eq(`25 × ${k} × 4 = ?`), 100 * k, { explain: `Trik: 25 × 4 = 100, lalu 100 × ${k} = ${100 * k}` });
    }
    const x = R(12, 89);
    return inp(eq(`99 + ${x} = ?`), 99 + x, { explain: `Trik: 99 + ${x} = 100 + ${x} − 1 = ${99 + x}` });
  }
  const t = R(1, 4);
  if (t === 1) {
    const n = pick([10, 20, 50]);
    return inp(eq(`1 + 2 + 3 + ... + ${n} = ?`), (n * (n + 1)) / 2, {
      explain: `Pasangan (1 + ${n}) = ${n + 1}, ada ${n / 2} pasangan → ${n / 2} × ${n + 1} = ${(n * (n + 1)) / 2}`,
    });
  }
  if (t === 2) {
    const n = pick([4, 6, 8, 10]);
    return inp(eq(`2 + 4 + 6 + ... + ${2 * n} = ?`), n * (n + 1), { explain: `Ada ${n} angka. Pasangan (2 + ${2 * n}) = ${2 * n + 2}, ada ${n / 2} pasangan → ${n * (n + 1)}` });
  }
  if (t === 3) {
    const n = R(4, 10);
    return inp(eq(`1 + 3 + 5 + ... + ${2 * n - 1} = ?`), n * n, { explain: `Jumlah ${n} bilangan ganjil pertama = ${n} × ${n} = ${n * n}` });
  }
  const a = R(3, 9);
  return inp(eq(`${a} × 99 = ?`), a * 99, { explain: `Trik: ${a} × 100 − ${a} = ${a * 100} − ${a} = ${a * 99}` });
}

/* =========================================================
   BILANGAN
   ========================================================= */
function distinctDigits(k, allowZero = true) {
  const pool = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, ...(allowZero ? [0] : [])]);
  let d = pool.slice(0, k);
  if (d[0] === 0) [d[0], d[1]] = [d[1], d[0]];
  return d;
}

function genNilaiTempat(l) {
  if (l === 1) {
    if (chance(0.5)) {
      const d = distinctDigits(3, false), n = d[0] * 100 + d[1] * 10 + d[2];
      const pos = R(0, 2), val = d[pos] * [100, 10, 1][pos];
      const choices = [d[pos] * 100, d[pos] * 10, d[pos], d[(pos + 1) % 3] * [100, 10, 1][pos]];
      return ch(`Angka <b>${d[pos]}</b> pada bilangan <b>${n}</b> bernilai berapa?`, [...new Set(choices)].slice(0, 4), val, {
        explain: `${n} = ${d[0] * 100} + ${d[1] * 10} + ${d[2]}`,
      });
    }
    const r = R(1, 9), p = R(0, 9), s = R(0, 9);
    return inp(`Bilangan dengan <b>${r} ratusan</b>, <b>${p} puluhan</b>, dan <b>${s} satuan</b> adalah?`, r * 100 + p * 10 + s);
  }
  if (l === 2) {
    if (chance(0.5)) {
      const d = distinctDigits(3, false);
      const perms = shuffle([
        [d[0], d[1], d[2]], [d[0], d[2], d[1]], [d[1], d[0], d[2]], [d[1], d[2], d[0]], [d[2], d[0], d[1]], [d[2], d[1], d[0]],
      ]).slice(0, 4).map((p) => p[0] * 100 + p[1] * 10 + p[2]);
      const big = chance(0.5);
      const ans = big ? Math.max(...perms) : Math.min(...perms);
      return ch(`Manakah bilangan yang paling <b>${big ? 'besar' : 'kecil'}</b>?`, perms, ans);
    }
    const a = R(100, 999);
    let b = chance(0.2) ? a : R(100, 999);
    const sign = a > b ? '>' : a < b ? '<' : '=';
    return ch(`Pilih tanda yang tepat: ${eq(`${a} ${BOX} ${b}`)}`, ['>', '<', '='], sign);
  }
  if (chance(0.6)) {
    const d = distinctDigits(chance(0.5) ? 3 : 4, true);
    const big = chance(0.5);
    const sorted = [...d].sort((x, y) => (big ? y - x : x - y));
    if (!big && sorted[0] === 0) {
      const i = sorted.findIndex((x) => x > 0);
      [sorted[0], sorted[i]] = [sorted[i], sorted[0]];
    }
    const ans = Number(sorted.join(''));
    return inp(`Susun angka <b>${d.join(', ')}</b> (masing-masing dipakai sekali) menjadi bilangan <b>${big ? 'terbesar' : 'terkecil'}</b>!`, ans, {
      explain: big ? `Taruh angka terbesar di depan: ${ans}` : `Angka terkecil di depan (tapi tidak boleh 0): ${ans}`,
    });
  }
  const n = R(1000, 9999), digits = String(n).split('').map(Number);
  return inp(`Berapa nilai angka <b>ribuan</b> dari ${fmt(n)}? (tulis nilainya)`, digits[0] * 1000, { explain: `${fmt(n)} → angka ribuan ${digits[0]}, bernilai ${fmt(digits[0] * 1000)}` });
}

function genGanjilGenap(l) {
  if (l === 1) {
    const n = R(1, 99);
    return ch(`Bilangan <b>${n}</b> termasuk...`, ['Ganjil', 'Genap'], n % 2 ? 'Ganjil' : 'Genap', {
      explain: `Lihat angka satuannya: ${n % 10}. ${n % 2 ? 'Ganjil (1, 3, 5, 7, 9)' : 'Genap (0, 2, 4, 6, 8)'}`,
    });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const N = pick([10, 12, 16, 20, 24, 30]), even = chance(0.5);
      return inp(`Ada berapa bilangan <b>${even ? 'genap' : 'ganjil'}</b> dari 1 sampai ${N}?`, N / 2, { explain: `Dari 1 sampai ${N}, setengahnya ${even ? 'genap' : 'ganjil'}: ${N} ÷ 2 = ${N / 2}` });
    }
    const n = R(10, 98), even = chance(0.5);
    const ans = even ? (n % 2 ? n + 1 : n + 2) : n % 2 ? n + 2 : n + 1;
    return inp(`Bilangan <b>${even ? 'genap' : 'ganjil'}</b> berikutnya setelah ${n} adalah?`, ans);
  }
  if (chance(0.5)) {
    const ops = [
      ['ganjil + ganjil', 'Genap', '3 + 5 = 8'], ['genap + genap', 'Genap', '2 + 4 = 6'], ['ganjil + genap', 'Ganjil', '3 + 4 = 7'],
      ['ganjil × ganjil', 'Ganjil', '3 × 5 = 15'], ['ganjil × genap', 'Genap', '3 × 4 = 12'], ['genap × genap', 'Genap', '2 × 4 = 8'],
    ];
    const [o, a, ex] = pick(ops);
    return ch(`Hasil dari <b>${o}</b> selalu...`, ['Ganjil', 'Genap'], a, { explain: `Coba contoh: ${ex}` });
  }
  const n = pick([5, 7, 9, 11, 13]);
  const k = (n + 1) / 2;
  return inp(`Berapa jumlah semua bilangan ganjil dari 1 sampai ${n}?`, k * k, {
    explain: `${Array.from({ length: k }, (_, i) => 2 * i + 1).join(' + ')} = ${k * k}`,
  });
}

function seqVis(arr) {
  return `<div class="seq">${arr.map((v) => `<span class="${v === '?' ? 'box' : 'seq-item'}">${v}</span>`).join('')}</div>`;
}
function genPola(l) {
  let seq, ans, ex;
  if (l === 1) {
    const s = R(1, 20), d = pick([1, 2, 5, 10]);
    seq = [0, 1, 2, 3].map((i) => s + i * d);
    ans = s + 4 * d;
    ex = `Setiap langkah ditambah ${d}`;
  } else if (l === 2) {
    const t = R(1, 3);
    if (t === 1) {
      const d = pick([2, 3, 4, 5]), s = R(5 * d, 10 * d);
      seq = [0, 1, 2, 3].map((i) => s - i * d);
      ans = s - 4 * d;
      ex = `Setiap langkah dikurangi ${d}`;
    } else if (t === 2) {
      const s = R(1, 3);
      seq = [0, 1, 2, 3].map((i) => s * 2 ** i);
      ans = s * 16;
      ex = `Setiap langkah dikali 2`;
    } else {
      const d = pick([3, 4, 6]), s = R(1, 10);
      const full = [0, 1, 2, 3, 4].map((i) => s + i * d), miss = R(1, 3);
      ans = full[miss];
      seq = full.map((v, i) => (i === miss ? '?' : v));
      return inp(`Angka berapa yang hilang?${seqVis(seq)}`, ans, { explain: `Setiap langkah ditambah ${d}` });
    }
  } else {
    const t = R(1, 4);
    if (t === 1) {
      const s = R(1, 5);
      seq = [s, s + 1, s + 3, s + 6, s + 10];
      ans = s + 15;
      ex = 'Selisihnya bertambah: +1, +2, +3, +4, +5';
    } else if (t === 2) {
      const o = R(1, 2);
      seq = [0, 1, 2, 3, 4].map((i) => (i + o) ** 2);
      ans = (5 + o) ** 2;
      ex = `Bilangan kuadrat: ${o}×${o}, ${o + 1}×${o + 1}, ... → ${5 + o}×${5 + o} = ${ans}`;
    } else if (t === 3) {
      const a = R(2, 4), b = R(5, 7), s = R(1, 9);
      seq = [s, s + a, s + a + b, s + 2 * a + b, s + 2 * a + 2 * b];
      ans = s + 3 * a + 2 * b;
      ex = `Bergantian +${a}, +${b}`;
    } else {
      const a = R(1, 3), b = R(1, 4);
      seq = [a, b];
      for (let i = 0; i < 4; i++) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      ans = seq[seq.length - 1] + seq[seq.length - 2];
      ex = 'Setiap bilangan = jumlah dua bilangan sebelumnya';
    }
  }
  return inp(`Lanjutkan polanya! Berapa bilangan berikutnya?${seqVis([...seq, '?'])}`, ans, { explain: ex });
}

function fracDistractors(k, n) {
  const pool = [];
  for (let b = 2; b <= 8; b++) for (let a = 1; a < b; a++) if (a * n !== k * b) pool.push([a, b]);
  const out = [];
  if (n - k !== k && (n - k) * n !== k * n) out.push([n - k, n]);
  for (const p of shuffle(pool)) {
    if (out.length >= 3) break;
    if (!out.some((o) => o[0] === p[0] && o[1] === p[1])) out.push(p);
  }
  return out.map(([a, b]) => f(a, b));
}
function genPecahan(l) {
  if (l === 1) {
    const n = pick([2, 3, 4, 4, 5, 6]), k = n <= 3 ? 1 : R(1, n - 1);
    return ch('Berapa bagian yang diwarnai?', [f(k, n), ...fracDistractors(k, n)], f(k, n), {
      visual: fractionSVG(k, n),
      explain: `Ada ${n} bagian sama besar, ${k} diwarnai → ${k}/${n}`,
    });
  }
  if (l === 2) {
    if (chance(0.6)) {
      const n = pick([2, 3, 4, 5]), q = R(2, 8);
      return inp(`Berapa ${f(1, n)} dari ${n * q}?`, q, { explain: `${f(1, n)} dari ${n * q} = ${n * q} ÷ ${n} = ${q}` });
    }
    const a = R(2, 8);
    let b = R(2, 8);
    while (b === a) b = R(2, 8);
    return ch('Manakah pecahan yang <b>lebih besar</b>?', [f(1, a), f(1, b)], f(1, Math.min(a, b)), {
      explain: `Pembilang sama-sama 1: makin kecil penyebutnya, makin besar potongannya. Kue dibagi ${Math.min(a, b)} lebih besar daripada dibagi ${Math.max(a, b)}.`,
    });
  }
  const t = R(1, 3);
  if (t === 1) {
    const n = pick([3, 4, 5]), k = R(2, n - 1), q = R(2, 8);
    return inp(`Berapa ${f(k, n)} dari ${n * q}?`, k * q, { explain: `${n * q} ÷ ${n} = ${q}, lalu ${q} × ${k} = ${k * q}` });
  }
  if (t === 2) {
    const a = R(1, 3), b = a + R(1, 3), m = R(2, 4);
    return inp(`Isilah kotak agar pecahan senilai: ${eq(`${f(a, b)} = ${f(BOX, b * m)}`)}`, a * m, {
      explain: `Penyebut dikali ${m} (${b} × ${m} = ${b * m}), jadi pembilang juga dikali ${m}: ${a} × ${m} = ${a * m}`,
    });
  }
  const n = R(5, 9), a = R(1, n - 2), b = R(1, n - a - 1);
  return ch(`Berapa hasilnya? ${eq(`${f(a, n)} + ${f(b, n)} = ?`)}`, [f(a + b, n), f(a + b, n + n), f(a + b + 1, n), f(Math.abs(a - b) || 1, n)].filter((v, i, s) => s.indexOf(v) === i), f(a + b, n), {
    explain: `Penyebut sama → jumlahkan pembilangnya saja: ${a} + ${b} = ${a + b}`,
  });
}

function genFaktor(l) {
  if (l === 1) {
    const k = R(2, 9);
    if (chance(0.5)) {
      return inp(`Lanjutkan kelipatan ${k}:${seqVis([k, 2 * k, 3 * k, '?'])}`, 4 * k, { explain: `Kelipatan ${k}: tambah ${k} terus` });
    }
    const yes = chance(0.5), m = yes ? k * R(2, 9) : k * R(2, 9) + R(1, k - 1);
    return ch(`Apakah <b>${m}</b> kelipatan <b>${k}</b>?`, ['Ya', 'Tidak'], yes ? 'Ya' : 'Tidak', {
      explain: yes ? `${m} = ${k} × ${m / k}` : `${m} ÷ ${k} tidak habis (ada sisa ${m % k})`,
    });
  }
  if (l === 2) {
    const n = pick([12, 16, 18, 20, 24, 28, 30, 36]);
    if (chance(0.5)) {
      const fs = factors(n), nonf = Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d && d > 1);
      const good = pick(fs.filter((x) => x > 1 && x < n));
      return ch(`Manakah yang merupakan <b>faktor</b> dari ${n}?`, [good, ...shuffle(nonf).slice(0, 3)], good, { explain: `Faktor ${n}: ${fs.join(', ')}` });
    }
    const m = pick([6, 8, 10, 12, 15, 16, 18, 20]);
    return inp(`Ada berapa banyak <b>faktor</b> dari ${m}?`, factors(m).length, { explain: `Faktor ${m}: ${factors(m).join(', ')} → ${factors(m).length} faktor` });
  }
  const k = R(3, 9), N = pick([30, 40, 50, 60, 100]);
  if (chance(0.5)) return inp(`Ada berapa kelipatan <b>${k}</b> dari 1 sampai ${N}?`, Math.floor(N / k), { explain: `${N} ÷ ${k} = ${Math.floor(N / k)} sisa ${N % k}` });
  const x = R(20, 80), ans = (Math.floor(x / k) + 1) * k;
  return inp(`Kelipatan ${k} terkecil yang <b>lebih besar dari ${x}</b> adalah?`, ans, { explain: `${k} × ${Math.floor(x / k)} = ${Math.floor(x / k) * k}, berikutnya ${ans}` });
}

function genPrima(l) {
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  if (l === 1) {
    const p = pick(PRIMES.slice(0, 10));
    const comps = shuffle([1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 25, 27]).slice(0, 3);
    return ch('Manakah yang merupakan <b>bilangan prima</b>?', [p, ...comps], p, {
      explain: `Bilangan prima hanya punya 2 faktor: 1 dan dirinya sendiri. ${p} = 1 × ${p}`,
    });
  }
  if (l === 2) {
    if (chance(0.6)) {
      const N = pick([10, 15, 20, 25, 30]);
      const ps = PRIMES.filter((p) => p < N);
      return inp(`Ada berapa bilangan prima yang <b>kurang dari ${N}</b>?`, ps.length, { explain: `${ps.join(', ')} → ${ps.length} bilangan` });
    }
    return ch('Satu-satunya bilangan prima yang <b>genap</b> adalah...', [0, 2, 4, 1], 2, { explain: '2 hanya bisa dibagi 1 dan 2. Bilangan genap lainnya bisa dibagi 2.' });
  }
  if (chance(0.5)) {
    const a = pick([1, 10, 20, 30]), b = a + 10;
    const ps = PRIMES.filter((p) => p > a && p < b);
    return inp(`Berapa jumlah semua bilangan prima di antara ${a} dan ${b}?`, ps.reduce((s, x) => s + x, 0), { explain: `${ps.join(' + ')} = ${ps.reduce((s, x) => s + x, 0)}` });
  }
  const n = R(10, 45);
  let p = n + 1;
  while (!isPrime(p)) p++;
  return inp(`Bilangan prima terkecil yang <b>lebih besar dari ${n}</b> adalah?`, p);
}

function multList(a, n) {
  return Array.from({ length: n }, (_, i) => a * (i + 1)).join(', ');
}
function genKpkFpb(l) {
  if (l === 1) {
    if (chance(0.5)) {
      const [a, b] = pick([[2, 3], [2, 4], [3, 4], [2, 5], [3, 5], [4, 6], [3, 6], [2, 6], [4, 5]]);
      const k = lcm(a, b);
      return inp(`Berapa <b>KPK</b> dari ${a} dan ${b}?`, k, {
        explain: `Kelipatan ${a}: ${multList(a, k / a + 1)}...<br>Kelipatan ${b}: ${multList(b, k / b + 1)}...<br>Yang sama paling kecil: ${k}`,
      });
    }
    const [a, b] = pick([[4, 6], [6, 9], [8, 12], [10, 15], [6, 8], [12, 18], [4, 10], [9, 12]]);
    return inp(`Berapa <b>FPB</b> dari ${a} dan ${b}?`, gcd(a, b), {
      explain: `Faktor ${a}: ${factors(a).join(', ')}<br>Faktor ${b}: ${factors(b).join(', ')}<br>Yang sama paling besar: ${gcd(a, b)}`,
    });
  }
  const [N, N2] = twoNames();
  if (l === 2) {
    if (chance(0.5)) {
      const [a, b] = pick([[2, 3], [3, 4], [4, 6], [2, 5], [3, 5], [4, 5], [6, 8]]);
      const tpl = pick([
        `🏊 ${N} berenang setiap ${a} hari sekali. ${N2} berenang setiap ${b} hari sekali. Hari ini mereka berenang bersama. Setelah berapa hari mereka akan berenang bersama lagi?`,
        `💡 Lampu merah berkedip setiap ${a} detik, lampu biru setiap ${b} detik. Sekarang keduanya menyala bersamaan. Setelah berapa detik keduanya menyala bersamaan lagi?`,
      ]);
      return inp(tpl, lcm(a, b), { explain: `Cari KPK dari ${a} dan ${b} = ${lcm(a, b)}` });
    }
    const [a, b] = pick([[12, 18], [8, 12], [10, 15], [16, 24], [20, 30], [6, 9]]);
    return inp(`🧺 Ibu punya ${a} apel dan ${b} jeruk. Semua buah dimasukkan ke dalam kantong, setiap kantong isinya sama (apel sama banyak, jeruk sama banyak). Paling banyak berapa kantong yang bisa dibuat?`, gcd(a, b), {
      explain: `Cari FPB dari ${a} dan ${b} = ${gcd(a, b)}`,
    });
  }
  const t = R(1, 3);
  if (t === 1) {
    const [a, b] = pick([[12, 18], [15, 20], [8, 12], [10, 25], [12, 16], [9, 15]]);
    return inp(`Berapa <b>KPK</b> dari ${a} dan ${b}?`, lcm(a, b));
  }
  if (t === 2) {
    const [a, b] = pick([[24, 36], [30, 45], [36, 48], [40, 60], [28, 42], [45, 60]]);
    return inp(`Berapa <b>FPB</b> dari ${a} dan ${b}?`, gcd(a, b));
  }
  const [a, b, c] = pick([[2, 3, 4], [2, 3, 5], [3, 4, 6], [2, 4, 5], [3, 5, 6]]);
  return inp(`🔔 Tiga bel berbunyi setiap ${a}, ${b}, dan ${c} menit. Jika berbunyi bersamaan pukul 07.00, setelah berapa menit akan berbunyi bersamaan lagi?`, lcm(lcm(a, b), c), {
    explain: `KPK dari ${a}, ${b}, ${c} = ${lcm(lcm(a, b), c)}`,
  });
}

/* =========================================================
   GEOMETRI
   ========================================================= */
function genBangunDatar(l) {
  if (l === 1) {
    const keys = ['segitiga', 'persegi', 'persegiPanjang', 'lingkaran', 'segilima', 'segienam', 'trapesium', 'belahKetupat', 'jajargenjang'];
    const k = pick(keys);
    const others = shuffle(keys.filter((x) => x !== k)).slice(0, 3);
    return ch('Bangun datar apakah ini?', [k, ...others].map((x) => SHAPES[x].name), SHAPES[k].name, { visual: shapeSVG(k) });
  }
  if (l === 2) {
    const k = pick(['segitiga', 'persegi', 'persegiPanjang', 'segilima', 'segienam', 'segidelapan', 'trapesium']);
    const what = pick(['sisi', 'titik sudut']);
    return inp(`Berapa banyak <b>${what}</b> pada bangun ${SHAPES[k].name.toLowerCase()} ini?`, SHAPES[k].sides, {
      visual: shapeSVG(k),
      explain: `${SHAPES[k].name} punya ${SHAPES[k].sides} sisi dan ${SHAPES[k].sides} titik sudut`,
    });
  }
  if (chance(0.6)) {
    const k = R(1, 3), total = ((k + 1) * (k + 2)) / 2;
    return inp('🔍 Berapa banyak <b>segitiga</b> yang ada pada gambar ini? (hitung yang kecil dan yang besar!)', total, {
      visual: triangleCountSVG(k),
      explain: `Ada ${k + 1} segitiga kecil. Hitung juga gabungannya: ${Array.from({ length: k + 1 }, (_, i) => k + 1 - i).join(' + ')} = ${total}`,
    });
  }
  const n = pick([2, 3]), total = n === 2 ? 5 : 14;
  return inp('🔍 Berapa banyak <b>persegi</b> pada gambar ini? (yang kecil dan yang besar!)', total, {
    visual: squareGridSVG(n),
    explain: n === 2 ? '4 persegi kecil + 1 persegi besar = 5' : '9 kecil (1×1) + 4 sedang (2×2) + 1 besar (3×3) = 14',
  });
}

function genKeliling(l) {
  if (l === 1) {
    const s = R(2, 10);
    return inp(`Berapa cm <b>keliling</b> persegi ini?`, 4 * s, { visual: rectLabeled(s, s, 'cm', true), explain: `Keliling persegi = 4 × sisi = 4 × ${s} = ${4 * s} cm` });
  }
  if (l === 2) {
    if (chance(0.6)) {
      const p = R(5, 15), w = R(2, p - 1);
      return inp(`Berapa cm <b>keliling</b> persegi panjang ini?`, 2 * (p + w), {
        visual: rectLabeled(p, w),
        explain: `Keliling = ${p} + ${w} + ${p} + ${w} = ${2 * (p + w)} cm`,
      });
    }
    const a = R(4, 12), b = R(4, 12), c = R(Math.abs(a - b) + 1, Math.min(a + b - 1, 15));
    return inp(`Berapa cm <b>keliling</b> segitiga ini?`, a + b + c, { visual: triLabeled(a, b, c), explain: `${a} + ${b} + ${c} = ${a + b + c} cm` });
  }
  if (chance(0.5)) {
    const s = R(3, 15);
    return inp(`Keliling sebuah persegi adalah <b>${4 * s} cm</b>. Berapa cm panjang sisinya?`, s, { explain: `Sisi = keliling ÷ 4 = ${4 * s} ÷ 4 = ${s} cm` });
  }
  const p = R(6, 15), w = R(2, p - 1);
  return inp(`Keliling persegi panjang <b>${2 * (p + w)} cm</b> dan panjangnya <b>${p} cm</b>. Berapa cm lebarnya?`, w, {
    explain: `Panjang + lebar = ${2 * (p + w)} ÷ 2 = ${p + w}. Lebar = ${p + w} − ${p} = ${w} cm`,
  });
}

function genLuas(l) {
  if (l === 1) {
    if (chance(0.5)) {
      const w = R(2, 6), h = R(2, 4), cells = new Set();
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cells.add(`${x},${y}`);
      return inp('Berapa banyak <b>kotak satuan</b> yang diwarnai?', w * h, { visual: gridSVG(w, h, cells), explain: `${h} baris × ${w} kotak = ${w * h}` });
    }
    const W = 6, H = 4, cells = new Set();
    const n = R(5, 12);
    while (cells.size < n) cells.add(`${R(0, W - 1)},${R(0, H - 1)}`);
    return inp('Berapa banyak kotak yang diwarnai <b>kuning</b>?', n, { visual: gridSVG(W, H, cells) });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const p = R(3, 12), w = R(2, 9);
      return inp(`Berapa cm² <b>luas</b> persegi panjang ini?`, p * w, { visual: rectLabeled(p, w), explain: `Luas = panjang × lebar = ${p} × ${w} = ${p * w} cm²` });
    }
    const s = R(2, 10);
    return inp(`Berapa cm² <b>luas</b> persegi ini?`, s * s, { visual: rectLabeled(s, s, 'cm', true), explain: `Luas = sisi × sisi = ${s} × ${s} = ${s * s} cm²` });
  }
  const t = R(1, 3);
  if (t === 1) {
    const s = R(3, 12);
    return inp(`Luas sebuah persegi <b>${s * s} cm²</b>. Berapa cm panjang sisinya?`, s, { explain: `Cari bilangan yang dikali dirinya sendiri = ${s * s}: ${s} × ${s} = ${s * s}` });
  }
  if (t === 2) {
    const p = R(4, 12), w = R(2, 9);
    return inp(`Luas persegi panjang <b>${p * w} cm²</b> dan panjangnya <b>${p} cm</b>. Berapa cm lebarnya?`, w, { explain: `Lebar = ${p * w} ÷ ${p} = ${w} cm` });
  }
  // Bentuk L
  const W = 6, H = 5, a = R(3, 5), b = R(2, 3), c = R(1, a - 1), d = R(b + 1, H);
  const cells = new Set();
  for (let y = 0; y < b; y++) for (let x = 0; x < a; x++) cells.add(`${x},${y}`);
  for (let y = b; y < d; y++) for (let x = 0; x < c; x++) cells.add(`${x},${y}`);
  return inp('Jika 1 kotak = 1 cm², berapa cm² luas bangun kuning ini?', cells.size, {
    visual: gridSVG(W, H, cells),
    explain: `Bagi menjadi 2 persegi panjang: ${a} × ${b} = ${a * b} dan ${c} × ${d - b} = ${c * (d - b)}. Total ${cells.size} cm²`,
  });
}

function genSudut(l) {
  const kinds = ['Lancip', 'Siku-siku', 'Tumpul'];
  if (l === 1) {
    const kind = pick(kinds);
    const deg = kind === 'Lancip' ? pick([25, 35, 45, 60, 70]) : kind === 'Siku-siku' ? 90 : pick([110, 125, 140, 155]);
    return ch('Sudut ini termasuk sudut...', kinds, kind, {
      visual: angleSVG(deg),
      explain: 'Lancip: lebih kecil dari siku-siku. Siku-siku: seperti pojok buku. Tumpul: lebih besar dari siku-siku.',
    });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const h = pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
      const deg = Math.min(h, 12 - h) * 30;
      const kind = deg < 90 ? 'Lancip' : deg === 90 ? 'Siku-siku' : 'Tumpul';
      return ch(`Pukul ${pad2(h)}.00, sudut antara jarum jam dan jarum menit adalah sudut...`, kinds, kind, { visual: clockSVG(h, 0) });
    }
    const k = pick(['persegi', 'persegiPanjang', 'segitiga', 'trapesium']);
    const ans = { persegi: 4, persegiPanjang: 4, segitiga: 0, trapesium: 0 }[k];
    return inp(`Berapa banyak sudut <b>siku-siku</b> pada ${SHAPES[k].name.toLowerCase()} ini?`, ans, { visual: shapeSVG(k) });
  }
  const t = R(1, 3);
  if (t === 1) {
    const a = R(30, 80), b = R(30, 150 - a);
    return inp(`Dua sudut segitiga besarnya <b>${a}°</b> dan <b>${b}°</b>. Berapa derajat sudut ketiga?`, 180 - a - b, { explain: `Jumlah sudut segitiga = 180°. 180 − ${a} − ${b} = ${180 - a - b}°` });
  }
  if (t === 2) {
    const h = R(1, 6);
    return inp(`Berapa derajat sudut kecil antara kedua jarum jam pada pukul ${pad2(h)}.00?`, h * 30, { visual: clockSVG(h, 0), explain: `Setiap angka berjarak 30° (360° ÷ 12). ${h} × 30° = ${h * 30}°` });
  }
  const a = R(20, 160);
  return inp(`Sudut lurus = 180°. Jika satu bagian besarnya <b>${a}°</b>, berapa derajat bagian lainnya?`, 180 - a, { explain: `180 − ${a} = ${180 - a}°` });
}

function genSimetri(l) {
  const SYM = ['A', 'M', 'T', 'U', 'V', 'W', 'Y', 'H', 'O', 'X', 'I'];
  const NON = ['F', 'G', 'J', 'L', 'P', 'R', 'S', 'Z', 'N', 'Q'];
  if (l === 1) {
    const good = pick(SYM);
    return ch('Huruf mana yang punya <b>simetri lipat</b> (bisa dilipat jadi dua bagian yang sama persis)?', [good, ...shuffle(NON).slice(0, 3)], good, {
      big: true,
      explain: `Huruf ${good} bisa dilipat tepat di tengah sehingga kedua sisinya sama.`,
    });
  }
  if (l === 2) {
    const k = pick(['persegi', 'persegiPanjang', 'segitiga', 'segienam', 'segilima', 'trapesium', 'jajargenjang', 'belahKetupat']);
    return inp(`Berapa banyak <b>sumbu simetri lipat</b> pada ${SHAPES[k].name.toLowerCase()} ini?`, SHAPES[k].sym, {
      visual: shapeSVG(k),
      explain: `${SHAPES[k].name} punya ${SHAPES[k].sym} sumbu simetri lipat`,
    });
  }
  if (chance(0.5)) {
    const k = pick(['persegi', 'persegiPanjang', 'segitiga', 'segienam', 'jajargenjang', 'belahKetupat']);
    return inp(`Berapa <b>tingkat simetri putar</b> ${SHAPES[k].name.toLowerCase()} ini? (berapa kali tampak sama dalam satu putaran penuh)`, SHAPES[k].rot, {
      visual: shapeSVG(k),
      explain: `${SHAPES[k].name} tampak sama ${SHAPES[k].rot} kali dalam satu putaran`,
    });
  }
  const word = pick(['MATEMATIKA', 'OLIMPIADE', 'INDONESIA', 'JUARA', 'HEBAT', 'PINTAR', 'BINTANG']);
  const cnt = [...word].filter((c) => SYM.includes(c) || c === 'B' || c === 'D' || c === 'E' || c === 'K' || c === 'C').length;
  return inp(`Pada kata <b>${word}</b>, berapa banyak huruf yang punya simetri lipat? (huruf boleh dihitung berulang)`, cnt, {
    explain: 'Huruf bersimetri lipat: A B C D E H I K M O T U V W X Y',
  });
}

function genKubus(l) {
  if (l === 1) {
    if (chance(0.7)) {
      const a = R(1, 3), b = R(2, 3);
      return inp('Berapa banyak <b>kubus kecil</b> pada gambar ini?', a * b, { visual: isoBlockSVG(a, b, 1), explain: `${a} × ${b} = ${a * b} kubus` });
    }
    return ch('Bentuk dadu 🎲 adalah bangun ruang...', ['Kubus', 'Bola', 'Tabung', 'Kerucut'], 'Kubus');
  }
  if (l === 2) {
    if (chance(0.6)) {
      const a = R(2, 3), b = R(2, 3), c = R(2, 3);
      return inp('Berapa banyak <b>kubus kecil</b> yang menyusun balok ini? (ada yang tersembunyi!)', a * b * c, {
        visual: isoBlockSVG(a, b, c),
        explain: `Satu lapis: ${a} × ${b} = ${a * b}. Ada ${c} lapis: ${a * b} × ${c} = ${a * b * c}`,
      });
    }
    const [what, ans] = pick([['sisi', 6], ['rusuk', 12], ['titik sudut', 8]]);
    return inp(`Berapa banyak <b>${what}</b> pada sebuah kubus?`, ans, { visual: isoBlockSVG(1, 1, 1), explain: 'Kubus: 6 sisi, 12 rusuk, 8 titik sudut' });
  }
  if (chance(0.6)) {
    const n = 3;
    const [what, ans] = pick([
      ['3 sisi', 8], ['2 sisi', 12 * (n - 2)], ['1 sisi', 6 * (n - 2) ** 2], ['tidak ada sisi (0 sisi)', (n - 2) ** 3],
    ]);
    return inp(`Kubus besar ini (${n}×${n}×${n}) dicat di seluruh permukaannya, lalu dipotong jadi kubus kecil. Berapa kubus kecil yang terkena cat pada <b>${what}</b>?`, ans, {
      visual: isoBlockSVG(n, n, n),
      explain: '3 sisi: di 8 pojok. 2 sisi: di tengah rusuk (12). 1 sisi: di tengah tiap muka (6). 0 sisi: di bagian dalam (1).',
    });
  }
  const s = R(2, 6);
  return inp(`Berapa cm³ <b>volume</b> kubus dengan panjang rusuk ${s} cm?`, s ** 3, { explain: `Volume = ${s} × ${s} × ${s} = ${s ** 3} cm³` });
}

/* =========================================================
   STATISTIKA DATA & PENGUKURAN
   ========================================================= */
function timeStr(h, m) {
  return `${pad2(h)}.${pad2(m)}`;
}
function genWaktu(l) {
  if (l === 1) {
    const h = R(1, 12), m = pick([0, 30]);
    const opts = new Set([timeStr(h, m), timeStr(h, m === 0 ? 30 : 0), timeStr((h % 12) + 1, m), timeStr(h === 1 ? 12 : h - 1, m)]);
    return ch('Pukul berapa yang ditunjukkan jam ini?', [...opts], timeStr(h, m), {
      visual: clockSVG(h, m),
      explain: 'Jarum pendek (hitam) = jam. Jarum panjang (merah) = menit. Di angka 6 artinya 30 menit.',
    });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const h = R(1, 12), m = pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);
      const opts = new Set([timeStr(h, m), timeStr(h, (m + 30) % 60), timeStr((h % 12) + 1, m), timeStr(h, m / 5)]);
      return ch('Pukul berapa yang ditunjukkan jam ini?', [...opts], timeStr(h, m), {
        visual: clockSVG(h, m),
        explain: `Jarum menit di angka ${m / 5}: ${m / 5} × 5 = ${m} menit.`,
      });
    }
    const [q, ans, ex] = pick([
      ...[2, 3, 4].map((x) => [`${x} jam = ? menit`, x * 60, `1 jam = 60 menit → ${x} × 60 = ${x * 60}`]),
      ['1 hari = ? jam', 24, '1 hari = 24 jam'],
      ...[2, 3].map((x) => [`${x} minggu = ? hari`, x * 7, `1 minggu = 7 hari → ${x} × 7 = ${x * 7}`]),
      ['1 menit = ? detik', 60, '1 menit = 60 detik'],
    ]);
    return inp(eq(q), ans, { explain: ex });
  }
  const h = R(6, 14), m = pick([0, 10, 15, 20, 30, 45]), d = pick([25, 35, 40, 45, 50, 75, 90, 105, 120]);
  const endTot = h * 60 + m + d, eh = Math.floor(endTot / 60), em = endTot % 60;
  if (chance(0.5))
    return inp(`⏰ ${pick(NAMES)} mulai belajar pukul <b>${timeStr(h, m)}</b> dan selesai pukul <b>${timeStr(eh, em)}</b>. Berapa menit lamanya?`, d, {
      explain: `Dari ${timeStr(h, m)} ke ${timeStr(eh, em)} = ${Math.floor(d / 60) ? `${Math.floor(d / 60)} jam ` : ''}${d % 60 ? `${d % 60} menit` : ''} = ${d} menit`,
    });
  const opts = new Set([timeStr(eh, em)]);
  while (opts.size < 4) {
    const t = endTot + pick([-15, -10, 10, 15, 30, -30, 60]);
    opts.add(timeStr(Math.floor(t / 60), t % 60));
  }
  return ch(`⚽ Pertandingan dimulai pukul <b>${timeStr(h, m)}</b> dan berlangsung <b>${d} menit</b>. Pukul berapa selesainya?`, [...opts], timeStr(eh, em));
}

function genSatuan(l) {
  if (l === 1) {
    const [q, ans, ex] = pick([
      ...[2, 3, 4, 5, 7].map((x) => [`${x} m = ? cm`, x * 100, `1 m = 100 cm → ${x} × 100`]),
      ...[2, 3, 5].map((x) => [`${x} kg = ? g`, x * 1000, `1 kg = 1.000 g → ${x} × 1.000`]),
      ...[3, 5, 8].map((x) => [`${x * 100} cm = ? m`, x, `100 cm = 1 m → ${x * 100} ÷ 100`]),
      ...[2, 4].map((x) => [`${x} km = ? m`, x * 1000, `1 km = 1.000 m`]),
    ]);
    return inp(eq(q), ans, { explain: ex });
  }
  if (l === 2) {
    const t = R(1, 3);
    if (t === 1) {
      const m = R(1, 5), c = R(5, 95);
      return inp(eq(`${m} m ${c} cm = ? cm`), m * 100 + c, { explain: `${m} m = ${m * 100} cm, ditambah ${c} cm = ${m * 100 + c} cm` });
    }
    if (t === 2) {
      const k = R(1, 4), g = pick([100, 250, 300, 500, 750]);
      return inp(eq(`${k} kg ${g} g = ? g`), k * 1000 + g, { explain: `${k} kg = ${k * 1000} g, + ${g} g = ${k * 1000 + g} g` });
    }
    const [u, v] = pick([['lusin', 12], ['kodi', 20]]), x = R(2, 5);
    return inp(`🧦 1 ${u} = ${v} buah. Berapa buah dalam <b>${x} ${u}</b>?`, x * v, { explain: `${x} × ${v} = ${x * v}` });
  }
  const t = R(1, 3);
  if (t === 1) {
    const v = pick([10, 20, 30, 40, 50, 60]), w = R(2, 4);
    return inp(`🚗 Mobil melaju dengan kecepatan <b>${v} km/jam</b>. Berapa km jarak yang ditempuh dalam ${w} jam?`, v * w, { explain: `Jarak = kecepatan × waktu = ${v} × ${w} = ${v * w} km` });
  }
  if (t === 2) {
    const v = pick([5, 10, 15, 20, 40, 60]), w = R(2, 5);
    return inp(`🚲 Jarak ${v * w} km ditempuh dalam ${w} jam. Berapa km/jam kecepatannya?`, v, { explain: `Kecepatan = jarak ÷ waktu = ${v * w} ÷ ${w} = ${v} km/jam` });
  }
  const d = R(2, 9), w = R(3, 12);
  return inp(`🚰 Keran mengalirkan air <b>${d} liter setiap menit</b>. Berapa liter air setelah ${w} menit?`, d * w, { explain: `Debit × waktu = ${d} × ${w} = ${d * w} liter` });
}

const CHART_SETS = [
  { title: 'Buah favorit teman sekelas', labels: ['🍎', '🍌', '🍊', '🍇'], names: ['apel', 'pisang', 'jeruk', 'anggur'] },
  { title: 'Hewan peliharaan teman', labels: ['🐱', '🐶', '🐟', '🐰'], names: ['kucing', 'anjing', 'ikan', 'kelinci'] },
  { title: 'Olahraga favorit', labels: ['⚽', '🏸', '🏊', '🏀'], names: ['sepak bola', 'bulu tangkis', 'renang', 'basket'] },
];
const BAR_COLORS = ['#ff4b4b', '#ffc800', '#ff9600', '#ce82ff'];
function uniqueMaxValues(n, lo, hi) {
  let v;
  do v = Array.from({ length: n }, () => R(lo, hi));
  while (v.filter((x) => x === Math.max(...v)).length > 1);
  return v;
}
function genDiagram(l) {
  const set = pick(CHART_SETS);
  if (l === 3) {
    const k = pick([2, 5]);
    const vals = uniqueMaxValues(4, 1, 5).map((x) => x * k);
    const e = set.labels;
    const vis = `<div class="picto"><div class="picto-title">${set.title}</div>${set.names
      .map((n, i) => `<div class="picto-row"><span class="picto-lab">${n}</span><span>${e[i].repeat(vals[i] / k)}</span></div>`)
      .join('')}<div class="picto-key">Setiap 1 gambar = <b>${k} anak</b></div></div>`;
    const i = R(0, 3);
    let j = R(0, 3);
    while (j === i || vals[j] === vals[i]) j = R(0, 3);
    const t = R(1, 3);
    if (t === 1) return inp(`Berapa anak yang memilih <b>${set.names[i]}</b>?`, vals[i], { visual: vis, explain: `${vals[i] / k} gambar × ${k} = ${vals[i]} anak` });
    if (t === 2) return inp(`Berapa jumlah <b>semua</b> anak?`, vals.reduce((a, b) => a + b, 0), { visual: vis, explain: `${vals.join(' + ')} = ${vals.reduce((a, b) => a + b, 0)}` });
    const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
    return inp(`Berapa anak lebih banyak yang memilih <b>${set.names[hi]}</b> daripada <b>${set.names[lo]}</b>?`, vals[hi] - vals[lo], {
      visual: vis,
      explain: `${vals[hi]} − ${vals[lo]} = ${vals[hi] - vals[lo]}`,
    });
  }
  const vals = uniqueMaxValues(4, 1, 10);
  const vis = `<div class="chart-title">${set.title}</div>${barChartSVG(set.labels, vals, BAR_COLORS)}`;
  const i = R(0, 3);
  if (l === 1) {
    if (chance(0.6)) return inp(`Berapa anak yang menyukai <b>${set.labels[i]} ${set.names[i]}</b>?`, vals[i], { visual: vis });
    const mx = vals.indexOf(Math.max(...vals));
    return ch('Mana yang <b>paling banyak</b> disukai?', set.labels.map((x, k) => `${x} ${set.names[k]}`), `${set.labels[mx]} ${set.names[mx]}`, { visual: vis });
  }
  let j = R(0, 3);
  while (j === i || vals[j] === vals[i]) j = R(0, 3);
  if (chance(0.5)) {
    const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
    return inp(`Berapa selisih anak yang suka <b>${set.labels[hi]} ${set.names[hi]}</b> dan <b>${set.labels[lo]} ${set.names[lo]}</b>?`, vals[hi] - vals[lo], {
      visual: vis,
      explain: `${vals[hi]} − ${vals[lo]} = ${vals[hi] - vals[lo]}`,
    });
  }
  return inp('Berapa jumlah <b>semua</b> anak yang ditanya?', vals.reduce((a, b) => a + b, 0), { visual: vis, explain: `${vals.join(' + ')} = ${vals.reduce((a, b) => a + b, 0)}` });
}

function dataVis(arr) {
  return `<div class="data-list">${arr.map((x) => `<span>${x}</span>`).join('')}</div>`;
}
function genRata(l) {
  if (l === 1) {
    const mode = R(5, 9);
    let arr = [mode, mode, mode];
    while (arr.length < 8) {
      const x = R(5, 10);
      if (x !== mode && arr.filter((y) => y === x).length < 2) arr.push(x);
    }
    arr = shuffle(arr);
    return inp(`Nilai ulangan beberapa anak:${dataVis(arr)}Nilai yang <b>paling sering</b> muncul (modus) adalah?`, mode, { explain: `${mode} muncul 3 kali, paling banyak` });
  }
  if (l === 2) {
    const n = pick([3, 4, 5]), m = R(4, 12);
    let arr = Array(n).fill(m);
    for (let k = 0; k < n; k++) {
      const a = R(0, n - 1), b = R(0, n - 1), d = R(1, 3);
      if (a !== b && arr[b] - d > 0) {
        arr[a] += d;
        arr[b] -= d;
      }
    }
    arr = shuffle(arr);
    return inp(`Berapa <b>rata-rata</b> dari bilangan berikut?${dataVis(arr)}`, m, {
      explain: `Jumlahkan: ${arr.join(' + ')} = ${m * n}. Bagi banyak data: ${m * n} ÷ ${n} = ${m}`,
    });
  }
  if (chance(0.5)) {
    const n = pick([5, 7]);
    const arr = shuffle(Array.from({ length: n }, () => R(1, 20)));
    const sorted = [...arr].sort((a, b) => a - b), med = sorted[(n - 1) / 2];
    return inp(`Berapa <b>median</b> (nilai tengah) dari data ini?${dataVis(arr)}`, med, { explain: `Urutkan dulu: ${sorted.join(', ')}. Nilai tengahnya ${med}` });
  }
  const m = R(6, 9), a = R(m - 2, m + 2), b = R(m - 2, m + 2), c = 3 * m - a - b;
  return inp(`Rata-rata nilai 3 anak adalah <b>${m}</b>. Nilai dua anak adalah ${a} dan ${b}. Berapa nilai anak ketiga?`, c, {
    explain: `Total = 3 × ${m} = ${3 * m}. Anak ketiga = ${3 * m} − ${a} − ${b} = ${c}`,
  });
}

/* =========================================================
   KOMBINATORIK & LOGIKA
   ========================================================= */
const PATTERN_SYMS = ['🔴', '🔵', '🟡', '🟢', '⭐', '❤️', '🔺', '🟣'];
function genPolaGambar(l) {
  const len = l === 1 ? pick([2, 3]) : pick([3, 4]);
  const unit = shuffle(PATTERN_SYMS).slice(0, len);
  if (chance(0.4) && len >= 3) unit[len - 1] = unit[0]; // pola seperti 🔴🔵🔴
  const shown = Array.from({ length: len * 2 + (l === 1 ? 1 : 0) }, (_, i) => unit[i % len]);
  const vis = `<div class="pattern">${shown.join('')}<span class="box">?</span></div>`;
  const uniq = [...new Set(unit)];
  const opts = [...new Set([...uniq, ...shuffle(PATTERN_SYMS)])].slice(0, 4);
  if (l === 1) return ch('Gambar apa yang berikutnya?', opts, unit[shown.length % len], { visual: vis, big: true });
  if (l === 2) {
    const n = R(10, 30);
    return ch(`Pola ini terus berulang. Gambar ke-<b>${n}</b> adalah?`, opts, unit[(n - 1) % len], {
      visual: `<div class="pattern">${shown.join('')}...</div>`,
      big: true,
      explain: `Pola berulang setiap ${len} gambar. ${n} ÷ ${len} = ${Math.floor(n / len)} sisa ${n % len || len} → gambar ke-${(n - 1) % len + 1} dalam pola`,
    });
  }
  const N = R(12, 30), sym = pick(uniq);
  const cnt = Array.from({ length: N }, (_, i) => unit[i % len]).filter((x) => x === sym).length;
  return inp(`Pola ini terus berulang. Dalam <b>${N}</b> gambar pertama, ada berapa ${sym}?`, cnt, {
    visual: `<div class="pattern">${shown.join('')}...</div>`,
    explain: `Hitung per kelompok ${len} gambar, lalu tambahkan sisanya → ${cnt}`,
  });
}

function genBanyakCara(l) {
  if (l === 1) {
    const a = R(2, 4), b = R(2, 4), N = pick(NAMES);
    return inp(`${N} punya <b>${a} baju</b> dan <b>${b} celana</b>. Berapa banyak pasangan baju dan celana yang berbeda?`, a * b, {
      visual: `<div class="emoji-sum">${emojiRow('👕', a)}<b>×</b>${emojiRow('👖', b)}</div>`,
      explain: `Setiap baju bisa dipasangkan dengan ${b} celana: ${a} × ${b} = ${a * b}`,
    });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const a = R(2, 4), b = R(2, 3), c = R(2, 3);
      return inp(`Ada <b>${a} baju</b>, <b>${b} celana</b>, dan <b>${c} topi</b>. Berapa banyak cara berpakaian yang berbeda?`, a * b * c, { explain: `${a} × ${b} × ${c} = ${a * b * c}` });
    }
    const a = R(2, 4), b = R(2, 4);
    return inp(`🗺️ Dari kota A ke kota B ada <b>${a} jalan</b>. Dari kota B ke kota C ada <b>${b} jalan</b>. Ada berapa cara pergi dari A ke C melewati B?`, a * b, {
      explain: `${a} × ${b} = ${a * b}`,
    });
  }
  const t = R(1, 4);
  if (t === 1) {
    const n = R(3, 8);
    return inp(`🤝 Ada <b>${n} anak</b>. Setiap anak berjabat tangan satu kali dengan setiap anak lainnya. Berapa banyak jabat tangan?`, (n * (n - 1)) / 2, {
      explain: `${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${(n * (n - 1)) / 2}`,
    });
  }
  if (t === 2) {
    const d = distinctDigits(R(3, 4), false);
    return inp(`Dari angka <b>${d.join(', ')}</b>, berapa banyak bilangan <b>dua angka</b> yang bisa dibuat jika angka tidak boleh berulang?`, d.length * (d.length - 1), {
      explain: `Angka puluhan: ${d.length} pilihan. Angka satuan: ${d.length - 1} pilihan. ${d.length} × ${d.length - 1} = ${d.length * (d.length - 1)}`,
    });
  }
  if (t === 3) {
    const n = pick([3, 4]);
    return inp(`📸 Berapa banyak cara <b>${n} anak</b> berbaris berjajar untuk difoto?`, n === 3 ? 6 : 24, { explain: n === 3 ? '3 × 2 × 1 = 6' : '4 × 3 × 2 × 1 = 24' });
  }
  const n = R(4, 7);
  return inp(`🏆 Dari <b>${n} anak</b> akan dipilih <b>2 anak</b> untuk lomba. Ada berapa cara memilihnya?`, (n * (n - 1)) / 2, {
    explain: `${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2} (urutan tidak penting)`,
  });
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
function genTekaTeki(l) {
  if (l === 1) {
    const a = R(2, 8), b = R(1, 6);
    const [h1, k1, h2, k2] = pick([['ayam', 2, 'kambing', 4], ['bebek', 2, 'kucing', 4], ['burung', 2, 'sapi', 4]]);
    return inp(`🐔 Di kebun ada <b>${a} ${h1}</b> dan <b>${b} ${h2}</b>. Berapa jumlah semua kakinya?`, a * k1 + b * k2, {
      explain: `${h1}: ${a} × ${k1} = ${a * k1}. ${h2}: ${b} × ${k2} = ${b * k2}. Total ${a * k1 + b * k2}`,
    });
  }
  if (l === 2) {
    if (chance(0.5)) {
      const d = R(0, 6), n = R(3, 20);
      return ch(`📅 Hari ini hari <b>${DAYS[d]}</b>. ${n} hari lagi hari apa?`, shuffle(DAYS.filter((_, i) => i !== (d + n) % 7)).slice(0, 3).concat(DAYS[(d + n) % 7]), DAYS[(d + n) % 7], {
        explain: `Setiap 7 hari kembali ke hari yang sama. ${n} ÷ 7 sisa ${n % 7} → maju ${n % 7} hari dari ${DAYS[d]}`,
      });
    }
    const [N, N2] = twoNames(), a = R(6, 9), d = R(2, 5), k = R(2, 6);
    return inp(`🎂 Umur ${N} sekarang <b>${a} tahun</b>. ${N2} <b>${d} tahun lebih tua</b>. Berapa umur ${N2} <b>${k} tahun lagi</b>?`, a + d + k, {
      explain: `Umur ${N2} sekarang ${a} + ${d} = ${a + d}. ${k} tahun lagi: ${a + d} + ${k} = ${a + d + k}`,
    });
  }
  if (chance(0.5)) {
    const ay = R(2, 8), kb = R(2, 8), H = ay + kb, L = ay * 2 + kb * 4;
    return inp(`🐔🐐 Ada ayam dan kambing. Jumlah kepalanya <b>${H}</b> dan jumlah kakinya <b>${L}</b>. Berapa ekor <b>kambing</b>?`, kb, {
      explain: `Misalkan semua ayam: ${H} × 2 = ${2 * H} kaki. Kurang ${L - 2 * H} kaki. Setiap kambing menambah 2 kaki: ${L - 2 * H} ÷ 2 = ${kb} kambing`,
    });
  }
  const d = R(1, 5), N = pick([20, 30, 50]);
  let cnt = 0;
  for (let i = 1; i <= N; i++) cnt += [...String(i)].filter((c) => c === String(d)).length;
  return inp(`✍️ Rina menulis bilangan dari 1 sampai ${N}. Berapa kali ia menulis angka <b>${d}</b>?`, cnt, {
    explain: `Hitung di satuan dan puluhan. Jangan lupa ${d}${d} kalau ada!`,
  });
}

/* =========================================================
   KURIKULUM
   ========================================================= */
const SECTIONS = [
  {
    id: 'aritmatika', title: 'Aritmatika', desc: 'Tambah, kurang, kali, bagi', icon: '🧮', color: '#58cc02', dark: '#58a700',
    units: [
      { id: 'tambah', title: 'Penjumlahan', icon: '➕', gen: genTambah },
      { id: 'kurang', title: 'Pengurangan', icon: '➖', gen: genKurang },
      { id: 'kali', title: 'Perkalian', icon: '✖️', gen: genKali },
      { id: 'bagi', title: 'Pembagian', icon: '➗', gen: genBagi },
      { id: 'kotak', title: 'Kotak Misteri', icon: '🎁', gen: genKotak },
      { id: 'campuran', title: 'Operasi Campuran', icon: '🧮', gen: genCampuran },
      { id: 'cerita', title: 'Soal Cerita', icon: '📖', gen: genCerita },
      { id: 'trik', title: 'Hitung Cerdas', icon: '⚡', gen: genTrik },
    ],
  },
  {
    id: 'bilangan', title: 'Bilangan', desc: 'Nilai tempat, pola, pecahan, prima, KPK & FPB', icon: '🔢', color: '#1cb0f6', dark: '#1899d6',
    units: [
      { id: 'nilai', title: 'Nilai Tempat', icon: '🏠', gen: genNilaiTempat },
      { id: 'ganjil', title: 'Ganjil & Genap', icon: '🎲', gen: genGanjilGenap },
      { id: 'pola', title: 'Pola Bilangan', icon: '🔁', gen: genPola },
      { id: 'pecahan', title: 'Pecahan', icon: '🍕', gen: genPecahan },
      { id: 'faktor', title: 'Faktor & Kelipatan', icon: '🧩', gen: genFaktor },
      { id: 'prima', title: 'Bilangan Prima', icon: '💎', gen: genPrima },
      { id: 'kpk', title: 'KPK & FPB', icon: '🔔', gen: genKpkFpb },
    ],
  },
  {
    id: 'geometri', title: 'Geometri', desc: 'Bangun datar, keliling, luas, sudut, bangun ruang', icon: '🔷', color: '#ce82ff', dark: '#a568cc',
    units: [
      { id: 'datar', title: 'Bangun Datar', icon: '🔺', gen: genBangunDatar },
      { id: 'keliling', title: 'Keliling', icon: '📏', gen: genKeliling },
      { id: 'luas', title: 'Luas', icon: '🟨', gen: genLuas },
      { id: 'sudut', title: 'Sudut', icon: '📐', gen: genSudut },
      { id: 'simetri', title: 'Simetri', icon: '🦋', gen: genSimetri },
      { id: 'kubus', title: 'Bangun Ruang', icon: '🧊', gen: genKubus },
    ],
  },
  {
    id: 'statistik', title: 'Data & Pengukuran', desc: 'Waktu, satuan, diagram, rata-rata', icon: '📊', color: '#ff9600', dark: '#e08600',
    units: [
      { id: 'waktu', title: 'Waktu & Jam', icon: '⏰', gen: genWaktu },
      { id: 'satuan', title: 'Satuan Ukuran', icon: '⚖️', gen: genSatuan },
      { id: 'diagram', title: 'Membaca Diagram', icon: '📊', gen: genDiagram },
      { id: 'rata', title: 'Modus, Rata-rata, Median', icon: '🎯', gen: genRata },
    ],
  },
  {
    id: 'kombinatorik', title: 'Logika & Kombinatorik', desc: 'Pola, banyak cara, teka-teki olimpiade', icon: '🧠', color: '#ff4b4b', dark: '#ea2b2b',
    units: [
      { id: 'polagambar', title: 'Pola Gambar', icon: '🌈', gen: genPolaGambar },
      { id: 'cara', title: 'Banyak Cara', icon: '👕', gen: genBanyakCara },
      { id: 'teka', title: 'Teka-teki Logika', icon: '🕵️', gen: genTekaTeki },
    ],
  },
];

/** Buat N soal unik (berdasarkan teks soal) dari generator */
function makeQuestions(gen, level, n) {
  const out = [], seen = new Set();
  let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    const q = gen(level);
    const key = q.q + (q.visual || '');
    if (seen.has(key) && guard < n * 15) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/** Soal kilat: hitung cepat aritmatika dasar (jawaban isian) */
function genKilat(score) {
  const lvl = score < 8 ? 1 : 2;
  const g = pick([genTambah, genKurang, genKali, genBagi]);
  let q;
  do q = g(lvl);
  while (q.kind !== 'input' || q.q.includes('sisa') || q.visual);
  return q;
}

window.JH = { SECTIONS, makeQuestions, genKilat, shuffle, pick, R };
