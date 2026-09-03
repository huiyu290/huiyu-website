/* ============================================================
   背景音乐（打开网站自动播放；被拦截时鼠标一动立即出声）
   实现要点：
   - 打开网站先尝试有声播放；若被浏览器拦截，则先静音播放
     （浏览器允许静音自动播放），鼠标一动 / 点击 / 按键立刻取消静音出声
   - 小喇叭按钮：播放中 → 暂停；暂停中 → 出声播放
   使用方式：
   1) 把音乐文件放到  assets/  文件夹
   2) 修改下面 BGM_FILE 为文件名，如 'assets/bgm.mp3'
   ============================================================ */
(function () {
  'use strict';

  var BGM_FILE = 'assets/bgm.m4a'; // 背景音乐文件（相对路径，file:// 与 http 均可）
  // 版本号用于 http 模式防缓存；file:// 直开时不能带 ?v=（会被当成文件名）
  var BGM_SRC = location.protocol === 'file:' ? BGM_FILE : BGM_FILE + '?v=20260903';
  var VOL_MAX = 0.85; // 最大音量（防止过响）

  var audio = document.getElementById('bgm');
  var btn = document.getElementById('bgm-toggle');

  if (!audio || !btn) {
    if (btn) btn.style.display = 'none'; // 未配置音乐时隐藏按钮
    return;
  }

  btn.style.display = ''; // 已配置音乐，显示开关按钮
  audio.volume = VOL_MAX; // 一开始就是正常音量
  audio.src = encodeURI(BGM_SRC);
  audio.load();

  var unmuted = false; // 是否已取消静音（出声）

  function tryPlay() {
    var pr = audio.play();
    if (pr && pr.catch) pr.catch(function () {});
  }

  // 打开时先尝试有声播放；被拦截则静音播放（浏览器允许静音自动播放）
  function autoStart() {
    var pr = audio.play();
    if (pr && pr.catch) {
      pr.catch(function () {
        audio.muted = true;
        audio.play().catch(function () {});
      });
    }
  }

  // 取消静音出声（首次用户交互时调用）
  function unmute() {
    if (unmuted) return;
    unmuted = true;
    audio.muted = false;
    if (audio.paused) audio.play().catch(function () {});
  }

  // 打开网站立即尝试（等音频可播放后再试，canplay 错过也无妨）
  audio.addEventListener('canplay', autoStart);
  autoStart();

  // 鼠标一移动 / 点击 / 按键 / 触摸 / 滚动 → 立即出声
  // 注意：不用 pointerdown，避免与按钮的 click 切换逻辑冲突
  var EVS = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'];
  for (var i = 0; i < EVS.length; i++) {
    window.addEventListener(EVS[i], unmute, { passive: true });
  }

  // 小喇叭按钮：播放中 → 暂停；暂停中 → 出声播放
  function syncBtn() {
    btn.textContent = audio.paused ? '🔇' : '🔊';
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!audio.paused) {
      audio.pause();
    } else {
      unmute();
      if (audio.paused) tryPlay();
    }
    syncBtn();
  });
  audio.addEventListener('play', syncBtn);
  audio.addEventListener('pause', syncBtn);
})();