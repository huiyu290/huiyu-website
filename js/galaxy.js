/* ============================================================
   惠瑜 · 个人网站 —— 银河系粒子系统（v4 视觉 · 正式版）
   - 黑色背景 + 细碎星光（加色混合）
   - 椭圆星轨 + 真实太阳系排布 + 彩色粒子星球
   - 悬停暂停 + 英文粒子文字标签
   - 点击星球 → 放大挂角 + 暗黑玻璃面板（content.js 提供内容）
   - 左上角欢迎语（鼠标悬停银河系时出现）
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('galaxy');
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, cx = 0, cy = 0, R = 0, zone = 0;

  var q = location.search;
  var forceLabels = q.indexOf('labels') >= 0;
  var forceNoLabels = q.indexOf('nolabels') >= 0;
  var forceWelcome = q.indexOf('welcome') >= 0;
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  var touchPaused = false;

  /* ---------- 星轨参数 ---------- */
  var ORBIT_SPEED = 0.055;          // 所有行星共用角速度（刚性旋转）
  var R_MIN = 0.26, R_MAX = 0.96;   // 内/外轨道半径（相对 R）
  var ANG_STEP = Math.PI / 4;       // 均匀 45°
  var vRatio = 0.62;               // 椭圆竖直压扁比（适配宽屏）

  /* ---------- sprites ---------- */
  function makeSprite(inner, mid) {
    var s = document.createElement('canvas'); s.width = s.height = 64;
    var g = s.getContext('2d');
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, inner); grad.addColorStop(0.4, mid); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return s;
  }
  var SPR = {
    white: makeSprite('rgba(255,255,255,1)', 'rgba(215,228,250,0.55)'),
    dim: makeSprite('rgba(230,236,250,1)', 'rgba(160,175,205,0.45)'),
    warm: makeSprite('rgba(255,255,255,0.95)', 'rgba(255,214,150,0.50)'),
    blue: makeSprite('rgba(255,255,255,0.95)', 'rgba(160,200,255,0.50)')
  };

  /* ---------- 行星配置（真实太阳系顺序，彩色） ---------- */
  var PLANET_DEFS = [
    { key: 'mercury', name: '水星',   size: 0.045, color: ['#F0C488','#8A5A2E','rgba(240,196,136,0.60)'], acc: '#FFE0AE', accR: 0.14, n: 260 },
    { key: 'venus',   name: '金星',   size: 0.060, color: ['#FFE38A','#C9930E','rgba(255,215,110,0.60)'], acc: '#FFF3C4', accR: 0.12, n: 420 },
    { key: 'earth',   name: '地球',   size: 0.058, color: ['#4FA0F0','#1E3D5F','rgba(79,160,240,0.60)'], acc: '#33D17A', accR: 0.22, n: 360 },
    { key: 'moon',    name: '月亮',   size: 0.050, color: ['#F6F9FF','#98A0B8','rgba(230,238,255,0.60)'], acc: '#FFFFFF', accR: 0.14, n: 300 },
    { key: 'mars',    name: '火星',   size: 0.048, color: ['#FF5A2A','#8F2424','rgba(255,90,42,0.60)'], acc: '#FFB58A', accR: 0.20, n: 280, soon: true },
    { key: 'jupiter', name: '木星',   size: 0.085, color: ['#F2C46A','#9A6432','rgba(242,196,106,0.60)'], acc: '#E84A3A', accR: 0.14, n: 520, soon: true },
    { key: 'saturn',  name: '土星',   size: 0.075, color: ['#EFCB8F','#6B4A3A','rgba(239,203,143,0.60)'], acc: '#FFF0D0', accR: 0.14, n: 460, ring: true },
    { key: 'neptune', name: '海王星', size: 0.068, color: ['#3F8BFF','#12458F','rgba(63,139,255,0.60)'], acc: '#9FD0FF', accR: 0.14, n: 420 }
  ];

  /* 悬停标签（英文） */
  var LABELS = {
    '水星': 'Internships', '金星': 'Portfolio', '月亮': 'Projects',
    '地球': 'More', '火星': 'Mars', '木星': 'Jupiter',
    '土星': 'Education', '海王星': 'to be explored', '太阳': 'Work Experience'
  };

  /* ---------- 状态 ---------- */
  var bg = [], stars = [], spiral = [], planets = [], sun = null;
  var galaxyAngle = 0, rotAngle = 0, angle0 = -Math.PI / 2;
  var speedFactor = 1, targetSpeed = forceLabels ? 0 : 1;
  var mouse = { x: -999999, y: -999999 };
  var hoveredIdx = -1, hoveredSun = false;
  var zoom = null;                 // 放大状态
  var welcomeShown = false;        // 欢迎语状态
  var labelCache = new Map();
  var last = performance.now(), t = 0;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function hexRgb(h) { h = h.replace('#', ''); return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16) }; }
  function sphere(n) {
    var p = [], g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), th = g * i;
      p.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
    }
    return p;
  }
  function ring(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push({ a: Math.random() * Math.PI * 2, r: 1 + (Math.random() - 0.5) * 0.35 });
    return a;
  }
  function sprite(s, x, y, z) { ctx.drawImage(s, x - z / 2, y - z / 2, z, z); }

  function ringRadius(i) { return R_MIN + (R_MAX - R_MIN) * i / (PLANET_DEFS.length - 1); }

  /* ---------- 初始化 ---------- */
  function build() {
    bg = [];
    var n = Math.round((W * H) / 11000);
    for (var i = 0; i < n; i++) bg.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, s: 0.7 + Math.random() * 1.3, al: 0.10 + Math.random() * 0.25, ph: Math.random() * 6.28 });

    /* 星光（加色混合、亮银/暖金/蓝白、带星团） */
    stars = [];
    var sn = Math.min(400, Math.round((W * H) / 4200));
    var starCols = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFE9C0', '#D8EBFF'];
    var clusters = [];
    for (var c = 0; c < 9; c++) clusters.push({ x: Math.random() * W, y: Math.random() * H, s: 30 + Math.random() * 90 });
    for (var i = 0; i < sn; i++) {
      var x, y;
      if (Math.random() < 0.28) { var cl = clusters[Math.floor(Math.random() * clusters.length)];
        x = cl.x + (Math.random() - 0.5) * cl.s; y = cl.y + (Math.random() - 0.5) * cl.s; }
      else { x = Math.random() * W; y = Math.random() * H; }
      var hero = Math.random() < 0.06;
      stars.push({ x: x, y: y,
        sz: hero ? (1.6 + Math.random() * 1.4) : (0.5 + Math.random() * 1.4),
        base: hero ? (0.6 + Math.random() * 0.4) : (0.5 + Math.random() * 0.5),
        col: starCols[Math.floor(Math.random() * starCols.length)],
        spr: hero ? (Math.random() < 0.5 ? SPR.warm : SPR.blue) : null,
        ph: Math.random() * 6.28, spd: 0.8 + Math.random() * 2.4,
        hero: hero });
    }

    /* 螺旋星系 */
    spiral = [];
    var arms = 3, per = Math.max(180, Math.round(R / 1.3));
    for (var a = 0; a < arms; a++) {
      var base = (a / arms) * 6.283;
      for (var i = 0; i < per; i++) {
        var rr = 0.07 + Math.pow(Math.random(), 0.65) * 0.90, ang = base + rr * 7 + (Math.random() - 0.5) * 0.4;
        spiral.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr, s: 0.5 + Math.random() * 1.1, al: 0.05 + Math.random() * 0.14, ph: Math.random() * 6.28 });
      }
    }

    /* 太阳（中心 = Work Experience） */
    sun = {
      pts: sphere(750), rot: Math.random() * 6.28, pulse: 0,
      radius: Math.max(24, R * 0.09),
      core: hexRgb('#FFF8E0'), edge: hexRgb('#E9A63B'),
      glow: makeSprite('rgba(255,255,255,1)', 'rgba(255,200,120,0.60)'),
      glowBlue: makeSprite('rgba(255,255,255,0.55)', 'rgba(120,160,255,0.30)')
    };

    /* 行星：等比/等距半径 + 均匀45° + 刚性旋转 */
    planets = PLANET_DEFS.map(function (d, i) {
      var core = hexRgb(d.color[0]), edge = hexRgb(d.color[1]), acc = hexRgb(d.acc);
      var accMask = [];
      for (var k = 0; k < d.n; k++) accMask.push(Math.random() < d.accR);
      return {
        key: d.key, name: d.name, soon: !!d.soon, ring: !!d.ring,
        size: d.size, radiusFrac: ringRadius(i), angle0: angle0 + i * ANG_STEP,
        rot: Math.random() * 6.28, x: 0, y: 0,
        pts: sphere(d.n), ringPts: d.ring ? ring(Math.round(d.n * 0.6)) : null,
        partSize: 1.1 + d.size * 6,
        core: core, edge: edge, acc: acc, accMask: accMask,
        glow: makeSprite('rgba(255,255,255,0.85)', d.color[2])
      };
    });
  }

  function resize() {
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    if (W / H < 0.9) {
      /* 竖屏手机：星系更大更圆、略偏上 */
      R = W * 0.46; cy = H * 0.46; vRatio = 0.88;
    } else {
      R = Math.min(W, H) * 0.40; cy = H / 2; vRatio = 0.62;
    }
    zone = R * 1.04 + 90;
    var _rotQ = (location.search.match(/[?&]rot=(\d+(?:\.\d+)?)/) || [])[1];
    if (_rotQ) { rotAngle = (parseFloat(_rotQ) * Math.PI) / 180; targetSpeed = 0; speedFactor = 0; }
    build();
  }
  window.addEventListener('resize', resize);

  /* ---------- 更新 ---------- */
  function update(dt) {
    if (touchPaused) targetSpeed = 0;
    else if (document.body.classList.contains('panel-open')) targetSpeed = 0;
    else if (forceLabels) targetSpeed = 0;
    else if (forceNoLabels) targetSpeed = 1;
    else { var d = Math.hypot(mouse.x - cx, mouse.y - cy); targetSpeed = d <= zone ? 0 : 1; }
    welcomeShown = (targetSpeed === 0 || forceWelcome);

    speedFactor += (targetSpeed - speedFactor) * Math.min(1, dt * 5);
    var sp = speedFactor;
    rotAngle += dt * ORBIT_SPEED * sp;
    galaxyAngle += dt * ORBIT_SPEED * sp;
    sun.rot += dt * 0.35 * sp; sun.pulse += dt;
    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      var ang = p.angle0 + rotAngle;
      p.rot += dt * (0.35 + p.size * 6) * sp;
      p.x = cx + Math.cos(ang) * p.radiusFrac * R;
      p.y = cy + Math.sin(ang) * p.radiusFrac * R * vRatio;
    }
    for (var b = 0; b < bg.length; b++) {
      var bgp = bg[b];
      bgp.x += bgp.vx * dt; bgp.y += bgp.vy * dt;
      if (bgp.x < -20) bgp.x = W + 20; else if (bgp.x > W + 20) bgp.x = -20;
      if (bgp.y < -20) bgp.y = H + 20; else if (bgp.y > H + 20) bgp.y = -20;
    }

    /* 放大动画 */
    if (zoom) {
      zoom.t += dt / 0.9;
      if (zoom.t > 1) zoom.t = 1;
      var e = easeInOut(zoom.t);
      zoom.x = zoom.sx + (zoom.tx - zoom.sx) * e;
      zoom.y = zoom.sy + (zoom.ty - zoom.sy) * e;
      zoom.r = zoom.sr + (zoom.tr - zoom.sr) * e;
    }

    /* 悬停检测 */
    hoveredIdx = -1; hoveredSun = false;
    var hr = hitTest(mouse.x, mouse.y);
    hoveredIdx = hr.idx; hoveredSun = hr.sun;
    canvas.style.cursor = (hoveredIdx >= 0 || hoveredSun) ? 'pointer' : 'default';
  }

  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function hitTest(x, y) {
    var idx = -1, best = Infinity;
    for (var j = 0; j < planets.length; j++) {
      var pl = planets[j];
      if (zoom && zoom.def === pl) continue;
      var pd = Math.hypot(x - pl.x, y - pl.y);
      var hit = pl.size * R * 1.4 + 8;
      if (pd < hit && pd < best) { best = pd; idx = j; }
    }
    return { idx: idx, sun: Math.hypot(x - cx, y - cy) < sun.radius * 1.6 };
  }

  /* ---------- 星光 ---------- */
  function drawStars() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = 0.5 + 0.5 * Math.sin(t * s.spd + s.ph);
      if (s.hero) {
        var flare = 0.5 + 0.5 * Math.sin(t * s.spd * 0.5 + s.ph * 1.6);
        var sz = s.sz * (1 + 0.55 * flare);
        ctx.globalAlpha = Math.min(1, s.base * (0.35 + 0.55 * flare));
        sprite(s.spr, s.x, s.y, sz * 9);
        ctx.globalAlpha = Math.min(1, s.base * 0.7 * (0.4 + 0.6 * tw));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.x - sz * 0.3, s.y - sz * 0.3, sz * 0.6, sz * 0.6);
      } else {
        ctx.globalAlpha = Math.min(1, s.base * (0.65 + 0.35 * tw));
        ctx.fillStyle = s.col;
        ctx.fillRect(s.x - s.sz / 2, s.y - s.sz / 2, s.sz, s.sz);
        ctx.globalAlpha = Math.min(0.55, s.base * 0.75 * (0.55 + 0.45 * tw));
        sprite(SPR.white, s.x, s.y, s.sz * 6);
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ---------- 太阳 ---------- */
  function drawSun() {
    var pr = sun.radius * (1 + 0.045 * Math.sin(sun.pulse * 0.9));
    ctx.globalAlpha = 0.55; sprite(sun.glow, cx, cy, pr * 5);
    ctx.globalAlpha = 0.25; sprite(sun.glowBlue, cx, cy, pr * 8);
    var co = Math.cos(sun.rot), si = Math.sin(sun.rot);
    for (var i = 0; i < sun.pts.length; i++) {
      var q = sun.pts[i], xr = q.x * co + q.z * si, zr = -q.x * si + q.z * co;
      var sx = cx + xr * pr, sy = cy + q.y * pr, d = (zr + 1) / 2, r = (1 + d * 1.2) * 1.7;
      ctx.fillStyle = 'rgb(' + Math.round(sun.edge.r + (sun.core.r - sun.edge.r) * d) + ',' + Math.round(sun.edge.g + (sun.core.g - sun.edge.g) * d) + ',' + Math.round(sun.edge.b + (sun.core.b - sun.edge.b) * d) + ')';
      ctx.globalAlpha = 0.2 + d * 0.8;
      ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
      if (d > 0.85) {
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.55 * d;
        ctx.fillRect(sx - r * 0.65 / 2, sy - r * 0.65 / 2, r * 0.65, r * 0.65);
      }
    }
    ctx.globalAlpha = 1;
    if (hoveredSun) {
      ctx.globalAlpha = 0.5; ctx.strokeStyle = '#dfe9ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, pr + 12, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 行星 ---------- */
  function drawPlanet(p) {
    var pr = p.size * R;
    ctx.globalAlpha = 0.14; sprite(p.glow, p.x, p.y, pr * 3.4);
    var ug = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr);
    ug.addColorStop(0, 'rgba(238,244,255,0.32)');
    ug.addColorStop(0.7, 'rgba(215,228,250,0.15)');
    ug.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ug; ctx.fillRect(p.x - pr, p.y - pr, pr * 2, pr * 2);
    if (p.ring) drawRing(p, pr, false);
    var co = Math.cos(p.rot), si = Math.sin(p.rot);
    for (var i = 0; i < p.pts.length; i++) {
      var q = p.pts[i], xr = q.x * co + q.z * si, zr = -q.x * si + q.z * co;
      if (zr < 0) continue;
      var sx = p.x + xr * pr, sy = p.y + q.y * pr, d = (zr + 1) / 2, dm = 0.5 + d * 0.5;
      var r = (0.8 + d * 0.9) * p.partSize;
      if (p.accMask[i]) {
        ctx.fillStyle = 'rgb(' + p.acc.r + ',' + p.acc.g + ',' + p.acc.b + ')';
        ctx.globalAlpha = 0.35 + 0.6 * dm;
      } else {
        ctx.fillStyle = 'rgb(' + Math.round(p.edge.r + (p.core.r - p.edge.r) * dm) + ',' + Math.round(p.edge.g + (p.core.g - p.edge.g) * dm) + ',' + Math.round(p.edge.b + (p.core.b - p.edge.b) * dm) + ')';
        ctx.globalAlpha = 0.35 + 0.65 * dm;
      }
      ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
      if (xr * xr + q.y * q.y < 0.55 && i % 3 === 0) {
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.3 * dm;
        ctx.fillRect(sx - r * 0.45 / 2, sy - r * 0.45 / 2, r * 0.45, r * 0.45);
      }
    }
    ctx.globalAlpha = 1;
    if (p.ring) drawRing(p, pr, true);
    if (hoveredIdx >= 0 && planets[hoveredIdx] === p) {
      ctx.globalAlpha = 0.6; ctx.strokeStyle = '#e4ecff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, pr + 12, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawRing(p, pr, front) {
    var rx = pr * 2.05, ry = pr * 0.72;
    for (var i = 0; i < p.ringPts.length; i++) {
      var rp = p.ringPts[i], sa = Math.sin(rp.a);
      if ((sa >= 0) !== front) continue;
      var sx = p.x + Math.cos(rp.a) * rx * rp.r, sy = p.y + sa * ry * rp.r, dep = Math.abs(sa), r = (1.1 + dep) * 1.5;
      var ri = Math.floor((Math.cos(rp.a * 2) + 1) * 0.5 * 255);
      ctx.fillStyle = 'rgb(' + Math.round(190 + ri * 0.2) + ',' + Math.round(150 + ri * 0.2) + ',' + Math.round(110 + ri * 0.2) + ')';
      ctx.globalAlpha = 0.1 + dep * 0.5;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- 放大星球 ---------- */
  function startZoom(pl) {
    var accMask = [];
    var pts = sphere(isTouch ? 14000 : 30000);
    for (var i = 0; i < pts.length; i++) accMask.push(Math.random() < pl.accR);
    var _cap = (W / H < 0.9) ? Math.min(W, H) * 0.95 : Math.min(W, H) * 1.5;
    var _tr = Math.min(Math.sqrt([1 / 3, 1 / 4, 1 / 5][Math.floor(Math.random() * 3)] * W * H / Math.PI) * 3, _cap);
    zoom = {
      def: pl, core: pl.core, edge: pl.edge, acc: pl.acc, accMask: accMask, pts: pts,
      sx: pl.x, sy: pl.y, sr: pl.size * R,
      tx: W + _tr * 0.25, ty: -_tr * 0.25, tr: _tr,
      t: 0
    };
  }

  function drawZoomedPlanet(z) {
    var pr = z.r;
    ctx.globalAlpha = 0.32; sprite(z.def.glow, z.x, z.y, pr * 1.1);
    var ug = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, pr);
    ug.addColorStop(0, 'rgba(238,244,255,0.28)');
    ug.addColorStop(0.7, 'rgba(215,228,250,0.13)');
    ug.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ug; ctx.fillRect(z.x - pr, z.y - pr, pr * 2, pr * 2);
    var co = Math.cos(z.def.rot), si = Math.sin(z.def.rot);
    var psize = Math.max(1.2, pr / 90);
    for (var i = 0; i < z.pts.length; i++) {
      var q = z.pts[i], xr = q.x * co + q.z * si, zr = -q.x * si + q.z * co;
      if (zr < 0) continue;
      var sx = z.x + xr * pr, sy = z.y + q.y * pr, d = (zr + 1) / 2, dm = 0.5 + d * 0.5;
      if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
      var r = (0.6 + d * 0.8) * psize;
      if (z.accMask[i]) {
        ctx.fillStyle = 'rgb(' + z.acc.r + ',' + z.acc.g + ',' + z.acc.b + ')';
        ctx.globalAlpha = 0.35 + 0.55 * dm;
      } else {
        ctx.fillStyle = 'rgb(' + Math.round(z.edge.r + (z.core.r - z.edge.r) * dm) + ',' + Math.round(z.edge.g + (z.core.g - z.edge.g) * dm) + ',' + Math.round(z.edge.b + (z.core.b - z.edge.b) * dm) + ')';
        ctx.globalAlpha = 0.35 + 0.6 * dm;
      }
      ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
      if (xr * xr + q.y * q.y < 0.55 && i % 3 === 0) {
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.28 * dm;
        ctx.fillRect(sx - r * 0.45 / 2, sy - r * 0.45 / 2, r * 0.45, r * 0.45);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- 标签（实心银白） ---------- */
  function textPts(text) {
    if (labelCache.has(text)) return labelCache.get(text);
    var size = 13, font = '600 ' + size + 'px "Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
    var off = document.createElement('canvas'), o = off.getContext('2d');
    o.font = font;
    var tw = o.measureText(text).width;
    off.width = Math.ceil(tw) + 28; off.height = Math.ceil(size * 1.6) + 28;
    o = off.getContext('2d'); o.font = font; o.textBaseline = 'middle'; o.fillStyle = '#fff';
    o.fillText(text, 14, off.height / 2);
    var data = o.getImageData(0, 0, off.width, off.height).data, pts = [];
    for (var y = 0; y < off.height; y += 2) for (var x = 0; x < off.width; x += 2)
      if (data[(y * off.width + x) * 4 + 3] > 110) pts.push({ x: x - off.width / 2, y: y - off.height / 2, s: 0.8 + Math.random() * 0.8, ph: Math.random() * 6.28 });
    labelCache.set(text, pts);
    return pts;
  }
  function drawText(text, lx, ly, br, sz, al) {
    if (!text) return;
    ctx.save();
    ctx.font = '600 ' + (sz || 13) + 'px "Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(210,225,255,0.85)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'rgba(238,244,255,' + ((al == null ? 0.95 : al) * (br == null ? 1 : br)) + ')';
    ctx.fillText(text, lx, ly);
    ctx.restore();
  }

  /* ---------- 欢迎语（粒子灰黑） ---------- */
  function drawWelcome() {
    var size = W < 480 ? 22 : 27;
    var text = "Welcome to Yu's Universe.";
    var key = 'wel' + size;
    var pts;
    if (labelCache.has(key)) { pts = labelCache.get(key); }
    else {
      var font = '600 ' + size + 'px "Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
      var off = document.createElement('canvas'), o = off.getContext('2d');
      o.font = font;
      var tw = o.measureText(text).width;
      off.width = Math.ceil(tw) + 40; off.height = Math.ceil(size * 1.6) + 40;
      o = off.getContext('2d'); o.font = font; o.textBaseline = 'middle'; o.fillStyle = '#fff';
      o.fillText(text, 20, off.height / 2);
      var data = o.getImageData(0, 0, off.width, off.height).data;
      pts = [];
      for (var y = 0; y < off.height; y += 2) for (var x = 0; x < off.width; x += 2)
        if (data[(y * off.width + x) * 4 + 3] > 110) pts.push({ x: x - 20, y: y - off.height / 2, ph: Math.random() * 6.28 });
      labelCache.set(key, pts);
    }
    var lx = 24, ly = W < 480 ? 92 : 110;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], twk = 0.55 + 0.45 * Math.sin(t * 1.6 + p.ph);
      ctx.globalAlpha = 0.6 * twk;
      ctx.fillStyle = '#5f6a80';
      ctx.fillRect(lx + p.x, ly + p.y, 2.3, 2.3);
    }
    ctx.globalAlpha = 1;
  }

      /* ---------- 标签绘制（带防重叠布局，且不覆盖星球） ---------- */
  function drawLabels() {
    var items = [];
    // 收集行星标签
    for (var k = 0; k < planets.length; k++) {
      var pl = planets[k];
      if (zoom && zoom.def === pl) continue;
      var lsz = W < 480 ? 11 : 13;
      var la = pl.angle0 + rotAngle;
      var lr = (pl.radiusFrac + pl.size + 0.12) * R;
      var text = pl.soon ? 'to be explored' : (LABELS[pl.name] || pl.name);
      var sz = pl.soon ? (W < 480 ? 8 : 9) : lsz;
      items.push({
        text: text, sz: sz, al: pl.soon ? 0.7 : 0.95,
        x: clamp(cx + Math.cos(la) * lr, 26, W - 26),
        y: clamp(cy + Math.sin(la) * lr * vRatio, 34, H - 34)
      });
    }
    // 太阳标签（也参与避让）
    items.push({
      text: LABELS['太阳'], sz: W < 480 ? 11 : 13, al: 0.95,
      x: cx, y: cy + sun.radius + 30,
      fixed: true, sunLabel: true
    });

    // 星球本体（作为圆形障碍物，标签不得覆盖）
    var obstacles = [];
    for (var k = 0; k < planets.length; k++) {
      var pl = planets[k];
      if (zoom && zoom.def === pl) continue;
      var pr = pl.size * R;
      obstacles.push({ x: pl.x, y: pl.y, r: pr + 10 });
    }
    obstacles.push({ x: cx, y: cy, r: sun.radius + 14, isSun: true, coreR: sun.radius + 4 }); // 太阳
    // 矩形-圆碰撞工具（标签是矩形，星球是圆形）
    function rectOverlap(it, ob) {
      if (it.sunLabel && ob.isSun) return false; // 太阳标签不避开太阳本体
      var hw = it.w / 2, hh = it.h / 2;
      var cx2 = Math.max(it.x - hw, Math.min(ob.x, it.x + hw));
      var cy2 = Math.max(it.y - hh, Math.min(ob.y, it.y + hh));
      var dx = ob.x - cx2, dy = ob.y - cy2;
      return (dx * dx + dy * dy) < ob.r * ob.r;
    }
    function rectPush(it, ob) {
      if (it.sunLabel && ob.isSun) return { x: it.x, y: it.y }; // 太阳标签不避开太阳本体
      var rr = ob.r;
      var hw = it.w / 2, hh = it.h / 2;
      var cx2 = Math.max(it.x - hw, Math.min(ob.x, it.x + hw));
      var cy2 = Math.max(it.y - hh, Math.min(ob.y, it.y + hh));
      var dx = ob.x - cx2, dy = ob.y - cy2;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var nx, ny;
      if (dist > 0.0001) {
        var push = (rr - dist) + 8;
        nx = it.x - (dx / dist) * push;
        ny = it.y - (dy / dist) * push;
      } else {
        var dl = ob.x - (it.x - hw), dr = (it.x + hw) - ob.x;
        var dt = ob.y - (it.y - hh), db = (it.y + hh) - ob.y;
        var mn = Math.min(dl, dr, dt, db);
        if (mn === dl) { nx = it.x - (rr - dl + 8); ny = it.y; }
        else if (mn === dr) { nx = it.x + (rr - dr + 8); ny = it.y; }
        else if (mn === dt) { nx = it.x; ny = it.y - (rr - dt + 8); }
        else { nx = it.x; ny = it.y + (rr - db + 8); }
      }
      return { x: nx, y: ny };
    }


    // 测量每个标签的宽高
    ctx.save();
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      ctx.font = '600 ' + it.sz + 'px "Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
      var tw = ctx.measureText(it.text).width;
      it.w = tw + 14;
      it.h = it.sz * 1.5 + 8;
    }
    ctx.restore();

    // 迭代分离：标签互相推挤 + 标签避开星球（矩形-圆），太阳标签带锚点拉力（最多 80 轮）
    var sunAnchor = { x: cx, y: cy + sun.radius + 30 }; // 太阳标签锚点
    for (var round = 0; round < 80; round++) {
      var moved = false;
      // 1) 标签 vs 标签：互相推挤（余量加大到 6）
      for (var a = 0; a < items.length; a++) {
        for (var b = a + 1; b < items.length; b++) {
          var A = items[a], B = items[b];
          var dx = B.x - A.x, dy = B.y - A.y;
          var minDx = (A.w + B.w) / 2, minDy = (A.h + B.h) / 2;
          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            var px = (minDx - Math.abs(dx)) + 6;
            var py = (minDy - Math.abs(dy)) + 6;
            var sx = dx === 0 ? (A.x < cx ? -1 : 1) : (dx > 0 ? 1 : -1);
            var sy = dy === 0 ? (A.y < cy ? -1 : 1) : (dy > 0 ? 1 : -1);
            if (A.fixed && B.fixed) { /* 两个固定标签不动 */ }
            else if (A.fixed) { B.x += sx * px; B.y += sy * py; }
            else if (B.fixed) { A.x -= sx * px; A.y -= sy * py; }
            else if (px <= py) {
              A.x -= sx * px / 2; B.x += sx * px / 2;
            } else {
              A.y -= sy * py / 2; B.y += sy * py / 2;
            }
            moved = true;
          }
        }
      }
      // 2) 标签 vs 星球：矩形-圆碰撞，把标签推出星球（太阳标签不避太阳本体）
      for (var a = 0; a < items.length; a++) {
        var it = items[a];
        for (var o = 0; o < obstacles.length; o++) {
          var ob = obstacles[o];
          // 太阳标签也用较小核心半径避让太阳（见 rectOverlap/rectPush）
          if (rectOverlap(it, ob)) {
            var pp = rectPush(it, ob);
            it.x = pp.x; it.y = pp.y;
            moved = true;
          }
        }
      }
      // 3) 太阳标签锚点拉力：只有拉回后不与行星重叠时才拉（避免拉力与避让力对抗）
      for (var a = 0; a < items.length; a++) {
        var it = items[a];
        if (!it.sunLabel) continue;
        var pdx = sunAnchor.x - it.x, pdy = sunAnchor.y - it.y;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pd < 0.5) continue;
        var step = Math.min(pd, 4);
        var nx = it.x + (pdx / pd) * step, ny = it.y + (pdy / pd) * step;
        var tx = it.x, ty = it.y;
        it.x = nx; it.y = ny;
        var blocked = false;
        for (var o2 = 0; o2 < obstacles.length; o2++) {
          if (rectOverlap(it, obstacles[o2])) { blocked = true; break; }
        }
        if (blocked) { it.x = tx; it.y = ty; }
        else { moved = true; }
      }
      // 4) 边界限制（每轮都做）
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        it.x = clamp(it.x, it.w / 2 + 6, W - it.w / 2 - 6);
        it.y = clamp(it.y, it.h / 2 + 6, H - it.h / 2 - 6);
      }
      if (!moved) break;
    }

    // 最终强制修正：反复矩形-圆避让直到无重叠（太阳标签用核心半径避太阳）
    for (var fr = 0; fr < 60; fr++) {
      var fmoved = false;
      for (var a = 0; a < items.length; a++) {
        var it = items[a];
        for (var o = 0; o < obstacles.length; o++) {
          var ob = obstacles[o];
          if (rectOverlap(it, ob)) {
            var pp = rectPush(it, ob);
            it.x = pp.x; it.y = pp.y;
            fmoved = true;
          }
        }
        it.x = clamp(it.x, it.w / 2 + 6, W - it.w / 2 - 6);
        it.y = clamp(it.y, it.h / 2 + 6, H - it.h / 2 - 6);
      }
      if (!fmoved) break;
    }

    // sunLabel 环绕修正：在太阳圆周上寻找不覆盖行星的位置
    var sit = null;
    for (var si = 0; si < items.length; si++) if (items[si].sunLabel) { sit = items[si]; break; }
    if (sit) {
      var orbitR = sun.radius + 40; // 环绕半径（太阳半径 + 余量）
      var best = null, bestOverlap = 1e9;
      for (var sa = 0; sa < 36; sa++) {
        var a = (sa / 36) * Math.PI * 2;
        var tx = cx + Math.cos(a) * orbitR;
        var ty = cy + Math.sin(a) * orbitR;
        tx = clamp(tx, sit.w / 2 + 6, W - sit.w / 2 - 6);
        ty = clamp(ty, sit.h / 2 + 6, H - sit.h / 2 - 6);
        // 计算该位置与所有行星的穿透量
        var pen = 0;
        for (var so = 0; so < obstacles.length - 1; so++) {
          var sob = obstacles[so];
          var cx2 = Math.max(tx - sit.w / 2, Math.min(sob.x, tx + sit.w / 2));
          var cy2 = Math.max(ty - sit.h / 2, Math.min(sob.y, ty + sit.h / 2));
          var d = Math.hypot(sob.x - cx2, sob.y - cy2);
          if (d < sob.r) pen += (sob.r - d);
        }
        // 也考虑与太阳核心的最小距离（保持贴太阳）
        var dSun = Math.hypot(tx - cx, ty - cy);
        var sunPen = Math.max(0, sun.radius - dSun) * 0.5; // 轻微惩罚太近太阳
        var score = pen * 100 + sunPen;
        if (best === null || score < bestOverlap) { bestOverlap = score; best = { x: tx, y: ty, pen: pen }; }
      }
      if (best) { sit.x = best.x; sit.y = best.y; }
    }

    // 绘制
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      drawText(it.text, it.x, it.y, 1, it.sz, it.al);
    }
  }

  /* ---------- 绘制 ---------- */
  function draw() {
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < bg.length; i++) {
      var q = bg[i], a = q.al * (0.7 + 0.3 * Math.sin(t * 1.2 + q.ph));
      ctx.globalAlpha = Math.max(0, a); sprite(SPR.dim, q.x, q.y, q.s * 4);
    }

    drawStars();

    var cg = Math.cos(galaxyAngle), sg = Math.sin(galaxyAngle);
    for (var s = 0; s < spiral.length; s++) {
      var sp = spiral[s];
      var gx = cx + (sp.x * cg - sp.y * sg) * R, gy = cy + (sp.x * sg + sp.y * cg) * R * vRatio;
      ctx.globalAlpha = Math.max(0, sp.al * (0.7 + 0.3 * Math.sin(t * 0.6 + sp.ph)));
      sprite(SPR.dim, gx, gy, sp.s * 3);
    }

    ctx.globalAlpha = 0.20; ctx.strokeStyle = '#9db4e0'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    for (var o = 0; o < planets.length; o++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, planets[o].radiusFrac * R, planets[o].radiusFrac * R * vRatio, 0, 0, 6.283);
      ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    drawSun();
    for (var p = 0; p < planets.length; p++) {
      if (zoom && zoom.def === planets[p]) continue;
      drawPlanet(planets[p]);
    }
    if (zoom) drawZoomedPlanet(zoom);

    var labelA = forceLabels ? 1 : Math.max(0, Math.min(1, (0.35 - speedFactor) / 0.28));
    if (labelA > 0.01) {
      drawLabels();
    }
    if (welcomeShown) drawWelcome();
    ctx.globalAlpha = 1;
  }

  /* ---------- 主循环 ---------- */
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now; t = now / 1000;
    update(dt); draw();
    requestAnimationFrame(frame);
  }

  /* ---------- 事件 ---------- */
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', function () { mouse.x = -999999; mouse.y = -999999; });

  canvas.addEventListener('click', function (e) {
    var hr = hitTest(e.clientX, e.clientY);
    if (zoom && zoom.t >= 1 && Math.hypot(e.clientX - zoom.x, e.clientY - zoom.y) < zoom.r * 1.5) {
      window.closePanel(); return;
    }
    if (hr.sun) { window.openPanel('sun'); return; }
    if (hr.idx >= 0) {
      var pl = planets[hr.idx];
      if (zoom && zoom.def === pl) { window.closePanel(); return; }
      startZoom(pl);
      window.openPanel(pl.key);
      return;
    }
    if (isTouch) touchPaused = !touchPaused; // 手机点空白处：暂停 / 继续旋转
  });

  /* 面板关闭时收起放大星球 */
  window.__onPanelClose = function () { zoom = null; };

  /* ?zoom=key 演示放大 */
  var _q = location.search;
  if (_q.indexOf('zoom=') >= 0) {
    var _zm = decodeURIComponent(_q.split('zoom=')[1].split('&')[0]);
    for (var zi = 0; zi < planets.length; zi++) {
      if (planets[zi].key === _zm || planets[zi].name === _zm) {
        startZoom(planets[zi]);
        zoom.t = 1; zoom.x = zoom.tx; zoom.y = zoom.ty; zoom.r = zoom.tr;
        if (_q.indexOf('nopanel') < 0) window.openPanel(planets[zi].key);
        break;
      }
    }
  }

  if (isTouch) {
    var hintEl = document.getElementById('hint');
    if (hintEl) hintEl.innerHTML = '点击银河系 · 暂停并显示星球名&nbsp;&nbsp;|&nbsp;&nbsp;点击星球 · 查看内容';
  }
  resize();
  requestAnimationFrame(frame);
})();
