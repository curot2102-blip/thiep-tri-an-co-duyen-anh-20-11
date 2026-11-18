/* ===================================================================
   TRANG WEB KỶ NIỆM CÔ DUYÊN ANH - ANTIGRAVITY SCROLL KINETIC ENGINE
   Continuously scrubbed timeline with scroll progress (0.0 to 1.0).
   - Phong bì mở 3D chân thực, chuẩn xác, không bị đè lá thư lên nắp.
   - Giai đoạn 2 mượt mà 60fps, không khựng, chuyển động nội suy liên tục.
   - Thước phim 35mm cuộn ngang gộp toàn bộ ảnh kỷ yếu & kỷ niệm.
   - Hỗ trợ phóng to Lightbox Modal cho toàn bộ Meme & Ảnh kỷ niệm.
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initDust();
  initIcons();
  const lightbox = initLightbox();
  initFloatingUniverse(lightbox.openLightbox);
  initCleanViewer();
  initFilmStrip();
  initFilmSprocketsText();
  initWishesData();
  initRealtimeSync();
  initIndexWishForm();
  initFinalTribute();
  initEnvelopeClick();
  initAnimationLoop();
});

function initEnvelopeClick() {
  const env = document.getElementById('envelope-wrapper');
  if (env) {
    env.addEventListener('click', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < maxScroll * 0.06) {
        window.scrollTo({ top: maxScroll * 0.15, behavior: 'smooth' });
        playSound('chime');
      }
    });
  }
}

/* ===================================================================
   HỆ THỐNG ÂM THANH WEB AUDIO NỘI BỘ
   =================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  const soundBtn = document.getElementById('sound-btn');
  const iconOn = document.getElementById('sound-icon-on');
  const iconOff = document.getElementById('sound-icon-off');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      iconOn.classList.toggle('hidden', !soundEnabled);
      iconOff.classList.toggle('hidden', soundEnabled);
      if (soundEnabled) playSound('pop');
    });
  }
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type = 'pop') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.12, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    }
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

function playPaperRustle() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Tiếng cọ xát giấy nhẹ (White noise qua bandpass filter)
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Hòa quyện cùng một nốt chuông gió thanh thoát (Chime)
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = 'triangle';
    chimeOsc.frequency.setValueAtTime(880, now + 0.02); // Nốt A5 dịu dàng
    chimeGain.gain.setValueAtTime(0.06, now + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeOsc.start(now + 0.02);
    chimeOsc.stop(now + 0.36);
  } catch (e) {
    console.warn('Audio paper-rustle error:', e);
  }
}

/* ===================================================================
   HÀM TIỆN ÍCH ÁNH XẠ GIÁ TRỊ (MAP RANGE)
   =================================================================== */
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (value <= inMin) return outMin;
  if (value >= inMax) return outMax;
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/* ===================================================================
   LIGHTBOX MODAL PHÓNG TO MEME & ẢNH KỶ NIỆM
   =================================================================== */
function initLightbox() {
  const modal = document.getElementById('meme-lightbox');
  const backdrop = document.getElementById('lightbox-backdrop');
  const closeBtn = document.getElementById('lightbox-close');
  const modalImg = document.getElementById('lightbox-img');

  function openLightbox(src) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    playSound('chime');
  }

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    playSound('pop');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeLightbox();
    }
  });

  return { openLightbox, closeLightbox };
}

/* ===================================================================
   KHỞI TẠO BỤI VŨ TRỤ & SAO LẤP LÁNH
   =================================================================== */
const dustList = [];
function initDust() {
  const container = document.getElementById('dust-container');
  if (!container) return;
  const count = 65;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'dust-dot';
    const size = Math.random() * 3 + 1;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    const isGold = Math.random() > 0.6;
    el.style.backgroundColor = isGold ? '#fbbf24' : '#ffffff';
    el.style.boxShadow = isGold ? '0 0 8px #f59e0b' : '0 0 6px #ffffff';

    container.appendChild(el);
    dustList.push({
      el,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.02,
      vy: -(Math.random() * 0.04 + 0.01),
      baseAlpha: Math.random() * 0.5 + 0.2,
      twinkle: Math.random() * 0.04 + 0.02
    });
  }
}

/* ===================================================================
   KHỞI TẠO CÁC BIỂU TƯỢNG CƠ BẢN BAY NHẸ NHÀNG (BASIC AMBIENT ICONS)
   =================================================================== */
const iconList = [];
function initIcons() {
  const container = document.getElementById('icons-container');
  if (!container) return;
  // Biểu tượng basic tối giản, thanh lịch: Ngôi sao 4 cánh, hoa nhỏ, hạt sáng lấp lánh
  const symbols = ['✦', '✧', '⋆', '✿', '◇', '✯', '❀', '❋', '•'];
  const count = 36;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floating-icon';
    el.innerText = symbols[i % symbols.length];

    // Phân bổ dạt về 2 phía cánh trái/phải để không che lấp chữ tiêu đề ở giữa
    let startX;
    if (Math.random() > 0.25) {
      startX = Math.random() < 0.5 ? Math.random() * 26 + 3 : Math.random() * 26 + 71;
    } else {
      startX = Math.random() * 92 + 4;
    }

    const startY = 85 + Math.random() * 70;
    const targetY = -25 - Math.random() * 50;
    const driftX = (Math.random() - 0.5) * 12; // Di chuyển ngang cực kỳ chậm
    const rotSpeed = (Math.random() - 0.5) * 80; // Xoay nhẹ nhàng, chậm rãi
    const scale = Math.random() * 0.45 + 0.65; // Kích thước thanh thoát
    const wobbleSpeed = Math.random() * 0.0006 + 0.0003; // Dao động cực êm
    const wobbleAmp = Math.random() * 12 + 4; // Biên độ dao động nhỏ
    const offset = Math.random() * 1000;

    el.style.fontSize = `${scale * 1.3}rem`;
    el.style.color = i % 2 === 0 ? 'rgba(251, 191, 36, 0.65)' : 'rgba(254, 240, 138, 0.55)';
    el.style.textShadow = '0 0 10px rgba(245, 158, 11, 0.35)';
    container.appendChild(el);

    iconList.push({
      el, startX, startY, targetY, driftX, rotSpeed,
      scale, wobbleSpeed, wobbleAmp, offset
    });
  }
}

/* ===================================================================
   KHỞI TẠO 9 MEME CỦA CÔ DUYÊN ANH (CHỈ DÙNG ẢNH CÓ TÊN LÀ MEME)
   Không chữ dìm, hỗ trợ click phóng to Lightbox & chuyển động ngẫu nhiên sinh động
   =================================================================== */
const floatingItemList = [];
const memeOnlyData = [
  // --- CÁNH TRÁI (LEFT FLANK) ---
  { src: 'images/meme 1.webp', startP: 0.33, endP: 0.44, baseX: 5,  baseRot: -8, w: 215 },
  { src: 'images/meme 3.webp', startP: 0.34, endP: 0.45, baseX: 18, baseRot: 6,  w: 205 },
  { src: 'images/meme 5 .webp', startP: 0.35, endP: 0.46, baseX: 7,  baseRot: 10, w: 215 },
  { src: 'images/meme 7 .webp', startP: 0.36, endP: 0.47, baseX: 20, baseRot: -7, w: 210 },
  { src: 'images/meme 9 .webp', startP: 0.37, endP: 0.48, baseX: 9,  baseRot: 5,  w: 220 },

  // --- CÁNH PHẢI (RIGHT FLANK) ---
  { src: 'images/meme 2 .webp', startP: 0.33, endP: 0.44, baseX: 75, baseRot: 8,  w: 215 },
  { src: 'images/meme 4 .webp', startP: 0.34, endP: 0.45, baseX: 62, baseRot: -9, w: 205 },
  { src: 'images/meme 6.webp', startP: 0.35, endP: 0.46, baseX: 76, baseRot: -6, w: 220 },
  { src: 'images/meme 8.webp', startP: 0.36, endP: 0.47, baseX: 64, baseRot: 9,  w: 210 }
];

function initFloatingUniverse(openLightbox) {
  const container = document.getElementById('memes-container');
  if (!container) return;

  memeOnlyData.forEach((data, index) => {
    const card = document.createElement('div');
    card.className = 'floating-meme-card';
    card.style.width = `${data.w}px`;

    card.innerHTML = `
      <div class="meme-inner">
        <img src="${data.src}" alt="Meme Cô Duyên Anh" class="meme-thumb">
        <div class="meme-zoom-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          Phóng to
        </div>
      </div>
    `;

    card.addEventListener('mouseenter', () => playSound('pop'));
    card.addEventListener('click', () => {
      if (typeof openLightbox === 'function') {
        openLightbox(data.src);
      }
    });

    // Tạo các thông số chuyển động ngẫu nhiên độc lập cho từng thẻ
    const seed = index * 137.5;
    const freqX = 0.0011 + (index % 3) * 0.0004 + Math.random() * 0.0003;
    const freqY = 0.0015 + (index % 4) * 0.0004 + Math.random() * 0.0004;
    const freqRot = 0.0013 + (index % 3) * 0.0005;
    const phaseX = seed;
    const phaseY = seed * 1.5;
    const phaseRot = seed * 0.7;
    const ampX = 2.8 + Math.random() * 2.8;   // Dao động dạt ngang từ 2.8vw đến 5.6vw
    const ampY = 14 + Math.random() * 16;     // Bồng bềnh dọc từ 14px đến 30px
    const rotAmp = 6 + Math.random() * 7;     // Đung đưa xoay ±6deg đến ±13deg
    const curveAmp = (index % 2 === 0 ? 1 : -1) * (2 + Math.random() * 3); // Lượn sóng theo cuộn
    const parallax = 0.45 + (index % 4) * 0.25; // Chiều sâu tương tác chuột

    container.appendChild(card);
    floatingItemList.push({
      el: card,
      data: data,
      timeOffset: index * 160,
      freqX, freqY, freqRot,
      phaseX, phaseY, phaseRot,
      ampX, ampY, rotAmp, curveAmp, parallax
    });
  });
}

/* ===================================================================
   BỘ XEM ẢNH TRỰC TIẾP TINH GỌN (CLEAN IMAGE VIEWER CÓ THÔNG TIN NGƯỜI GỬI)
   =================================================================== */
let cleanViewerEl = null;
let cleanViewerImg = null;

function initCleanViewer() {
  cleanViewerEl = document.getElementById('clean-image-viewer');
  cleanViewerImg = document.getElementById('clean-viewer-img');
  const closeBtn = document.getElementById('clean-viewer-close');

  if (cleanViewerEl) {
    cleanViewerEl.addEventListener('click', (e) => {
      if (e.target === cleanViewerEl || e.target === closeBtn) {
        closeCleanViewer();
      }
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCleanViewer();
    });
  }
}

function closeCleanViewer() {
  if (!cleanViewerEl) return;
  cleanViewerEl.classList.remove('active');
  cleanViewerEl.setAttribute('aria-hidden', 'true');
  setTimeout(() => { if (cleanViewerImg) cleanViewerImg.src = ''; }, 200);
}

function openCleanImage(src, author, time) {
  if (!cleanViewerEl || !cleanViewerImg || !src) return;
  cleanViewerImg.src = src;

  const authorEl = document.getElementById('clean-viewer-author');
  const timeEl = document.getElementById('clean-viewer-time');

  if (authorEl) authorEl.textContent = author || 'Tập thể học trò tri ân Cô';
  if (timeEl) timeEl.textContent = time || 'Kỷ niệm thanh xuân';

  cleanViewerEl.classList.add('active');
  cleanViewerEl.setAttribute('aria-hidden', 'false');
  playSound('pop');
}

/* ===================================================================
   KHỞI TẠO THƯỚC PHIM KỶ YẾU ĐIỆN ẢNH (FILM STRIP)
   - Tuyệt đối KHÔNG mở popup khi di chuột qua các ảnh
   - Chỉ khi người dùng chủ động click tĩnh (không kéo/di chuột) mới mở xem ảnh
   =================================================================== */
function initFilmStrip() {
  const frames = document.querySelectorAll('.film-frame');
  frames.forEach(frame => {
    const img = frame.querySelector('img');
    if (img) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      img.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
      });

      img.addEventListener('mousemove', (e) => {
        if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
          isDragging = true;
        }
      });

      img.addEventListener('click', (e) => {
        // Tuyệt đối không mở popup khi di chuột qua hoặc kéo cuộn
        if (isDragging) {
          e.stopPropagation();
          return;
        }
        e.stopPropagation();
        openCleanImage(img.getAttribute('src'), 'Tập thể học trò tri ân Cô Duyên Anh', 'Kỷ yếu thanh xuân');
      });
    }
  });
}

/* ===================================================================
   LẶP LẠI DÒNG CHỮ RĂNG CƯA 35MM (FILM SPROCKET METADATA)
   - Tự động phủ kín chính xác theo chiều dài hàng ảnh thực tế
   - Tuyệt đối không tạo khoảng trống dư thừa phía sau tấm ảnh cuối cùng
   =================================================================== */
function initFilmSprocketsText() {
  const topSprockets = document.getElementById('film-sprockets-top');
  const bottomSprockets = document.getElementById('film-sprockets-bottom');
  const filmFramesRow = document.getElementById('film-frames-row');

  const topText = '<span class="film-meta-text">KODAK VISION3 500T &bull; 20.11 &bull; KỶ YẾU & KỶ NIỆM CÔ DUYÊN ANH</span>';
  const bottomText = '<span class="film-meta-text">EASTMAN FILM &bull; SAFETY FILM &bull; TRI ÂN CÔ DUYÊN ANH 20.11</span>';

  const rowWidth = filmFramesRow ? (filmFramesRow.scrollWidth || 8000) : 8000;
  // Mỗi khối chữ span dài khoảng 460px, chỉ tạo số lượng vừa đủ khít chiều dài ảnh
  const count = Math.max(6, Math.ceil(rowWidth / 460));

  if (topSprockets) {
    topSprockets.innerHTML = Array(count).fill(topText).join('');
  }

  if (bottomSprockets) {
    bottomSprockets.innerHTML = Array(count).fill(bottomText).join('');
  }
}

/* ===================================================================
   QUẢN LÝ DỮ LIỆU ĐÓNG GÓP, SUB-LETTERS & ẢNH CUỘN PHIM 35MM
   =================================================================== */
let cachedFilmTrackWidth = 0;

function updateFilmDimensions() {
  const filmFramesRow = document.getElementById('film-frames-row');
  if (filmFramesRow && filmFramesRow.scrollWidth > 0) {
    cachedFilmTrackWidth = filmFramesRow.scrollWidth;
  }
}

/* ===================================================================
   CẤU HÌNH GOOGLE APPS SCRIPT WEB APP & ĐỒNG BỘ ĐÁM MÂY GOOGLE SHEETS
   =================================================================== */
const GAS_CONFIG = {
  // URL Web App Google Apps Script kết nối Google Sheets thời gian thực
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwUrK7M8gtsRfLzXoyTBAQUD5Q8-5rAA-7YdxlQkZwGWWoqnl_eBFMIMVvWSWGNU4FB/exec',
  STORAGE_KEY: 'co_duyen_anh_gas_url',
  PENDING_WISHES_KEY: 'co_duyen_anh_pending_wishes',
  PENDING_PHOTOS_KEY: 'co_duyen_anh_pending_photos'
};

function getGasWebAppUrl() {
  try {
    let userUrl = localStorage.getItem(GAS_CONFIG.STORAGE_KEY);
    if (userUrl && typeof userUrl === 'string') {
      userUrl = userUrl.trim().replace(/^["']|["']$/g, '');
      if (userUrl && userUrl !== 'null' && userUrl !== 'undefined') {
        return userUrl.replace(/[?&]+$/, '');
      }
    }
  } catch (e) {}
  let defaultUrl = GAS_CONFIG.WEB_APP_URL ? String(GAS_CONFIG.WEB_APP_URL).trim().replace(/^["']|["']$/g, '') : '';
  if (defaultUrl && defaultUrl !== 'null' && defaultUrl !== 'undefined') {
    return defaultUrl.replace(/[?&]+$/, '');
  }
  return '';
}

function getDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem('co_duyen_anh_deleted_ids') || '[]');
  } catch (e) {
    return [];
  }
}

async function initWishesData() {
  // Render dữ liệu hiện có ngay lập tức để không bị độ trễ
  renderSubLetters();
  renderContributedPhotos();

  // Luôn luôn đồng bộ mới nhất từ Google Apps Script / Google Sheets / wishes.json
  await syncWishesFromRemote();

  // Tự động kiểm tra và đồng bộ khi người dùng quay lại tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncWishesFromRemote();
    }
  });

  // Tự động đồng bộ ngầm định kỳ mỗi 15 giây
  setInterval(syncWishesFromRemote, 15000);
}

async function syncWishesFromRemote() {
  const deletedIds = getDeletedIds();
  const gasUrl = getGasWebAppUrl();
  let gasSynced = false;

  // 1. Đồng bộ qua Google Apps Script Web App (nếu có URL cấu hình)
  if (gasUrl) {
    try {
      const sep = gasUrl.includes('?') ? '&' : '?';
      const res = await fetch(`${gasUrl}${sep}action=getWishes&_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const gasData = await res.json();
        if (!gasData || typeof gasData !== 'object' || gasData.status === 'error') {
          throw new Error((gasData && gasData.message) || 'GAS returned invalid or error status');
        }
        const remoteWishes = Array.isArray(gasData) ? gasData : (gasData.wishes || gasData.data || []);
        const remotePhotos = gasData.photos || [];

        if (Array.isArray(remoteWishes)) {
          // Khi đã kết nối Google Sheets: Google Sheets là nguồn chuẩn duy nhất (Single Source of Truth)
          // Chỉ giữ lại các lời chúc đang chờ gửi ngoại tuyến của máy này nếu có
          let pendingWishes = [];
          try {
            const rawPend = localStorage.getItem(GAS_CONFIG.PENDING_WISHES_KEY);
            if (rawPend) pendingWishes = JSON.parse(rawPend);
          } catch (e) {}

          const wishMap = new Map();
          // 1. Giữ các lời chúc đang chờ gửi ngoại tuyến của thiết bị này
          if (Array.isArray(pendingWishes)) {
            pendingWishes.forEach(w => {
              if (w && w.id && !deletedIds.includes(w.id)) {
                wishMap.set(w.id, w);
              }
            });
          }
          // 2. Nạp toàn bộ danh sách lời chúc chính thức từ Google Sheets
          remoteWishes.forEach(w => {
            if (w && w.id && !deletedIds.includes(w.id)) {
              wishMap.set(w.id, w);
            }
          });

          const merged = Array.from(wishMap.values());
          localStorage.setItem('co_duyen_anh_wishes', JSON.stringify(merged));
          renderSubLetters();
          gasSynced = true;
        }

        if (Array.isArray(remotePhotos)) {
          let pendingPhotos = [];
          try {
            const rawPendP = localStorage.getItem(GAS_CONFIG.PENDING_PHOTOS_KEY);
            if (rawPendP) pendingPhotos = JSON.parse(rawPendP);
          } catch (e) {}

          const photoMap = new Map();
          // 1. Giữ các ảnh đang chờ gửi ngoại tuyến của thiết bị này
          if (Array.isArray(pendingPhotos)) {
            pendingPhotos.forEach(p => {
              if (p && p.id && !deletedIds.includes(p.id)) {
                const pKey = (p.id || '') + '_' + (p.image ? p.image.substring(p.image.length - 35) : Math.random());
                photoMap.set(pKey, p);
              }
            });
          }
          // 2. Nạp toàn bộ ảnh từ Google Sheets (dùng key kết hợp ID + URL để tránh mất ảnh nếu trùng ID)
          remotePhotos.forEach(p => {
            if (p && p.id && !deletedIds.includes(p.id)) {
              const pKey = (p.id || '') + '_' + (p.image ? p.image.substring(p.image.length - 35) : Math.random());
              photoMap.set(pKey, p);
            }
          });

          localStorage.setItem('co_duyen_anh_photos', JSON.stringify(Array.from(photoMap.values())));
          renderContributedPhotos();
        }

        // Đồng bộ tổng lượt tim từ Google Sheets
        if (gasData && typeof gasData.hearts === 'number') {
          updateHeartCounter(gasData.hearts);
        }

        // Tự động đẩy bù các lời chúc và hình ảnh lưu tạm khi ngoại tuyến
        flushPendingWishesToGas();
        flushPendingPhotosToGas();
      }
    } catch (gasErr) {
      console.warn('Đồng bộ Google Apps Script không khả dụng, chuyển sang chế độ dự phòng:', gasErr);
    }
  }

  // 2. Chế độ dự phòng 1: Tải từ tệp tĩnh wishes.json của dự án
  if (!gasSynced) {
    try {
      const res = await fetch('wishes.json?_t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const remoteWishes = await res.json();
        if (Array.isArray(remoteWishes)) {
          let localWishes = [];
          try {
            const raw = localStorage.getItem('co_duyen_anh_wishes');
            if (raw) localWishes = JSON.parse(raw);
          } catch (e) {}

          const wishMap = new Map();
          localWishes.forEach(w => {
            if (w && w.id && !deletedIds.includes(w.id) && !remoteWishes.some(rw => rw.id === w.id)) {
              wishMap.set(w.id, w);
            }
          });
          remoteWishes.forEach(w => {
            if (w && w.id && !deletedIds.includes(w.id)) {
              wishMap.set(w.id, w);
            }
          });
          localWishes.forEach(w => {
            if (w && w.id && !deletedIds.includes(w.id)) {
              if (!wishMap.has(w.id)) {
                wishMap.set(w.id, w);
              }
            }
          });

          const merged = Array.from(wishMap.values());
          localStorage.setItem('co_duyen_anh_wishes', JSON.stringify(merged));
          renderSubLetters();
        }
      }
    } catch (e) {
      // 3. Chế độ dự phòng ngoại tuyến hoàn toàn (Offline Fallback 2): Nạp từ localStorage
      renderSubLetters();
      renderContributedPhotos();
    }
  }
}

async function sendWishToGas(wish) {
  const gasUrl = getGasWebAppUrl();
  if (!gasUrl) {
    queuePendingWish(wish);
    return { success: false, reason: 'no_gas_url' };
  }

  try {
    const payload = {
      action: 'addWish',
      id: wish.id,
      author: wish.author,
      wish: wish.wish,
      time: wish.time,
      image: wish.image || ''
    };

    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'error') {
        queuePendingWish(wish);
        return { success: false, error: data.message || 'error' };
      }
      return { success: true, data: data };
    } else {
      queuePendingWish(wish);
      return { success: false, status: res.status };
    }
  } catch (err) {
    queuePendingWish(wish);
    return { success: false, error: err };
  }
}

function queuePendingWish(wish) {
  try {
    const key = GAS_CONFIG.PENDING_WISHES_KEY;
    let pending = JSON.parse(localStorage.getItem(key) || '[]');
    if (!pending.some(p => p.id === wish.id)) {
      pending.push(wish);
      localStorage.setItem(key, JSON.stringify(pending));
    }
  } catch (e) {}
}

async function flushPendingWishesToGas() {
  const gasUrl = getGasWebAppUrl();
  if (!gasUrl) return;

  const key = GAS_CONFIG.PENDING_WISHES_KEY;
  let pending = [];
  try {
    pending = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return;
  }

  if (pending.length === 0) return;

  const remaining = [];
  for (const item of pending) {
    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addWish',
          id: item.id,
          author: item.author,
          wish: item.wish,
          time: item.time,
          image: item.image || ''
        })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.status === 'error') {
          remaining.push(item);
        } else if (resData && resData.data && resData.data.image && resData.data.image.startsWith('http')) {
          try {
            const rawWishes = localStorage.getItem('co_duyen_anh_wishes');
            if (rawWishes) {
              const currentWishes = JSON.parse(rawWishes);
              const target = currentWishes.find(w => w.id === item.id);
              if (target) {
                target.image = resData.data.image;
                localStorage.setItem('co_duyen_anh_wishes', JSON.stringify(currentWishes));
                renderSubLetters();
              }
            }
          } catch (storageErr) {}
        }
      } else {
        remaining.push(item);
      }
    } catch (e) {
      remaining.push(item);
    }
  }

  try {
    const currentPending = JSON.parse(localStorage.getItem(key) || '[]');
    const flushedIds = new Set(pending.map(p => p.id));
    const newItems = currentPending.filter(p => !flushedIds.has(p.id));
    localStorage.setItem(key, JSON.stringify([...remaining, ...newItems]));
  } catch (e) {}
}

async function flushPendingPhotosToGas() {
  const gasUrl = getGasWebAppUrl();
  if (!gasUrl) return;

  const key = GAS_CONFIG.PENDING_PHOTOS_KEY;
  let pending = [];
  try {
    pending = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return;
  }

  if (pending.length === 0) return;

  const remaining = [];
  for (const p of pending) {
    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addPhoto',
          id: p.id,
          author: p.author,
          caption: p.caption || '',
          image: p.image,
          aspect: p.aspect || 'landscape',
          time: p.time
        })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData && resData.status === 'error') {
          remaining.push(p);
        } else if (resData && resData.data && resData.data.image && resData.data.image.startsWith('http')) {
          try {
            const rawPhotos = localStorage.getItem('co_duyen_anh_photos');
            if (rawPhotos) {
              const currentPhotos = JSON.parse(rawPhotos);
              const target = currentPhotos.find(item => item.id === p.id);
              if (target) {
                target.image = resData.data.image;
                localStorage.setItem('co_duyen_anh_photos', JSON.stringify(currentPhotos));
                renderContributedPhotos();
              }
            }
          } catch (storageErr) {}
        }
      } else {
        remaining.push(p);
      }
    } catch (e) {
      remaining.push(p);
    }
  }

  try {
    const currentPending = JSON.parse(localStorage.getItem(key) || '[]');
    const flushedIds = new Set(pending.map(p => p.id));
    const newItems = currentPending.filter(p => !flushedIds.has(p.id));
    localStorage.setItem(key, JSON.stringify([...remaining, ...newItems]));
  } catch (e) {}
}

function renderSubLetters() {
  const deck = document.getElementById('sub-letters-deck');
  if (!deck) return;
  deck.innerHTML = '';

  const deletedIds = getDeletedIds();
  let wishes = [];
  try {
    const raw = localStorage.getItem('co_duyen_anh_wishes');
    if (raw) wishes = JSON.parse(raw);
  } catch (e) {}

  wishes = wishes.filter(w => !deletedIds.includes(w.id));

  wishes.forEach(w => {
    const card = createSubLetterCard(w);
    deck.appendChild(card);
  });
}

function createSubLetterCard(wish) {
  const card = document.createElement('div');
  card.className = 'sub-letter-card';
  card.setAttribute('data-id', wish.id || '');
  card.innerHTML = `
    <div class="sub-letter-card-header">
      <div class="sub-letter-author">${escapeHtml(wish.author || 'Bạn học trò')}</div>
      <div class="sub-letter-meta">
        <span class="sub-letter-time">${escapeHtml(wish.time || '')}</span>
        <div class="sub-letter-stamp" title="Tri ân 20.11">20.11</div>
      </div>
    </div>
    <div class="sub-letter-body">${escapeHtml(wish.wish || '')}</div>
    ${wish.image ? `<img class="sub-letter-img" src="${escapeHtml(wish.image)}" alt="Ảnh kỷ niệm đính kèm" style="max-height: 120px; width: fit-content; border-radius: 8px; margin-top: 8px; object-fit: cover;" loading="lazy">` : ''}
  `;

  card.addEventListener('click', () => {
    playPaperRustle();
  });
  card.addEventListener('mouseenter', () => {
    playPaperRustle();
  });

  return card;
}

function renderContributedPhotos() {
  const filmTrackRow = document.getElementById('film-frames-row');
  if (!filmTrackRow) return;

  // Xóa sạch các khung hình động đã gắn trước đó
  filmTrackRow.querySelectorAll('.dynamic-contributed-frame').forEach(el => el.remove());

  const deletedIds = getDeletedIds();
  let photos = [];
  try {
    const raw = localStorage.getItem('co_duyen_anh_photos');
    if (raw) photos = JSON.parse(raw);
  } catch (e) {}

  // Hỗ trợ trường hợp dữ liệu cũ trong co_duyen_anh_wishes có trường image
  try {
    const rawWishes = localStorage.getItem('co_duyen_anh_wishes');
    if (rawWishes) {
      const wishes = JSON.parse(rawWishes);
      wishes.forEach(w => {
        if (w.image && !photos.some(p => p.id === w.id || p.image === w.image)) {
          photos.push({
            id: w.id,
            author: w.author,
            time: w.time,
            image: w.image,
            aspect: 'landscape'
          });
        }
      });
    }
  } catch (e) {}

  photos = photos.filter(p => !deletedIds.includes(p.id));

  const renderedKeys = new Set();
  photos.forEach(photo => {
    if (!photo || !photo.image) return;
    const key = (photo.id || '') + '_' + photo.image;
    if (renderedKeys.has(key)) return;
    renderedKeys.add(key);
    const frame = createContributedFilmFrame(photo);
    filmTrackRow.appendChild(frame);
  });

  initFilmSprocketsText();
  updateFilmDimensions();
}

function createContributedFilmFrame(photo) {
  const frame = document.createElement('div');
  const aspectClass = photo.aspect === 'landscape' ? 'landscape' : 'portrait';
  frame.className = `film-frame dynamic-contributed-frame ${aspectClass}`;
  frame.setAttribute('data-id', photo.id || '');
  frame.setAttribute('data-src', photo.image);

  frame.innerHTML = `
    <div class="frame-contributor-tag" title="Người đóng góp: ${escapeHtml(photo.author || 'Bạn học trò')}">
      <svg class="contributor-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
      <span class="contributor-name">${escapeHtml(photo.author || 'Bạn học trò')}</span>
    </div>
  `;

  const imgEl = new Image();
  imgEl.className = 'film-img';
  imgEl.src = photo.image;
  imgEl.alt = `Kỷ niệm từ ${photo.author || 'Bạn học trò'}`;
  imgEl.loading = 'lazy';

  imgEl.onerror = function() {
    if (photo.image && photo.image.includes('lh3.googleusercontent.com/d/')) {
      const parts = photo.image.split('/d/');
      const fileId = parts[1] ? parts[1].split('?')[0] : '';
      if (fileId && !imgEl.getAttribute('data-fallback-tried')) {
        imgEl.setAttribute('data-fallback-tried', '1');
        imgEl.src = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1600';
        return;
      }
    }
  };

  imgEl.onload = function() {
    if (imgEl.naturalWidth >= imgEl.naturalHeight) {
      frame.classList.remove('portrait');
      frame.classList.add('landscape');
    } else {
      frame.classList.remove('landscape');
      frame.classList.add('portrait');
    }
    initFilmSprocketsText();
    updateFilmDimensions();
  };

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  imgEl.addEventListener('mousedown', (e) => {
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  imgEl.addEventListener('mousemove', (e) => {
    if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
      isDragging = true;
    }
  });

  imgEl.addEventListener('click', (e) => {
    if (isDragging) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    openCleanImage(photo.image, photo.author, photo.time);
  });

  frame.appendChild(imgEl);
  // Không kích hoạt âm thanh pop hay popup khi di chuột qua ảnh
  return frame;
}

/* ===================================================================
   CƠ CHẾ ĐỒNG BỘ CLIENT-SIDE THỜI GIAN THỰC (REALTIME SYNC CHANNEL)
   =================================================================== */
const SYNC_CHANNEL_NAME = 'co_duyen_anh_sync_channel';
let syncChannel = null;

function initRealtimeSync() {
  if ('BroadcastChannel' in window) {
    try {
      syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      syncChannel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;
        const action = msg.action || msg.type;
        const payload = msg.data || msg.payload;
        const targetId = msg.id || (payload && payload.id);

        switch (action) {
          case 'ADD_WISH':
            appendWishToDeck(payload);
            playSound('chime');
            break;
          case 'ADD_PHOTOS':
            if (Array.isArray(payload)) {
              payload.forEach(p => appendPhotoToFilmStrip(p));
              playSound('chime');
            }
            break;
          case 'DELETE_WISH':
            removeWishFromDeck(targetId);
            break;
          case 'DELETE_PHOTO':
            removePhotoFromFilmStrip(targetId);
            break;
          case 'UPDATE_HEARTS':
            updateHeartCounter(payload || msg.hearts);
            break;
          case 'SYNC_ALL':
            refreshAllData();
            break;
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  }

  // Fallback qua Storage Event
  window.addEventListener('storage', (e) => {
    if (e.key === 'co_duyen_anh_wishes' || e.key === 'co_duyen_anh_photos' || e.key === 'co_duyen_anh_deleted_ids') {
      refreshAllData();
    }
    if (e.key === GAS_CONFIG.STORAGE_KEY) {
      syncWishesFromRemote();
    }
  });
}

function initIndexWishForm() {
  const form = document.getElementById('form-wish-index');
  const toggleBtn = document.getElementById('btn-toggle-wish-form');
  const cancelBtn = document.getElementById('index-wish-cancel-btn');
  const authorInput = document.getElementById('index-author-input');
  const wishInput = document.getElementById('index-wish-input');
  const statusEl = document.getElementById('index-wish-status');

  const submitBtn = document.getElementById('index-wish-submit-btn');

  if (toggleBtn && form) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = form.style.display === 'none';
      form.style.display = isHidden ? 'flex' : 'none';
      toggleBtn.style.display = isHidden ? 'none' : 'inline-flex';
      if (isHidden && authorInput) {
        authorInput.focus();
      }
    });
  }

  if (cancelBtn && form && toggleBtn) {
    cancelBtn.addEventListener('click', () => {
      form.style.display = 'none';
      toggleBtn.style.display = 'inline-flex';
      if (statusEl) statusEl.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = authorInput ? authorInput.value.trim() : '';
      const wishText = wishInput ? wishInput.value.trim() : '';

      if (!author || !wishText) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
      }

      const now = new Date();
      const timeStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const newWish = {
        id: 'wish-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        author: author,
        wish: wishText,
        time: timeStr
      };

      // 1. Lưu ngay vào localStorage
      let wishes = [];
      try {
        const raw = localStorage.getItem('co_duyen_anh_wishes');
        if (raw) wishes = JSON.parse(raw);
      } catch (err) {}
      wishes.unshift(newWish);
      try {
        localStorage.setItem('co_duyen_anh_wishes', JSON.stringify(wishes));
      } catch (err) {}

      // 2. Thêm ngay vào giao diện thiệp
      appendWishToDeck(newWish);

      // 3. Phát tín hiệu Real-time sang các tab đang mở
      if (syncChannel) {
        try {
          syncChannel.postMessage({
            action: 'ADD_WISH',
            type: 'ADD_WISH',
            data: newWish,
            payload: newWish
          });
        } catch (err) {}
      }

      // 4. Phát âm thanh phản hồi
      playSound('chime');

      // 5. Gửi trực tiếp lên Google Apps Script Web App
      if (statusEl) {
        statusEl.textContent = 'Đang đồng bộ lời chúc lên Google Sheets...';
        statusEl.className = 'index-wish-status info';
        statusEl.style.display = 'block';
      }

      try {
        const sendResult = await sendWishToGas(newWish);
        if (sendResult.success && sendResult.data && sendResult.data.data && sendResult.data.data.image && sendResult.data.data.image.startsWith('http')) {
          try {
            const rawWishes = localStorage.getItem('co_duyen_anh_wishes');
            if (rawWishes) {
              const currentWishes = JSON.parse(rawWishes);
              const target = currentWishes.find(w => w.id === newWish.id);
              if (target) {
                target.image = sendResult.data.data.image;
                localStorage.setItem('co_duyen_anh_wishes', JSON.stringify(currentWishes));
                renderSubLetters();
              }
            }
          } catch (storageErr) {}
        }
        if (statusEl) {
          if (sendResult.success) {
            statusEl.textContent = 'Lời chúc của bạn đã được ghi vào Google Sheets và hiển thị trên thiệp!';
            statusEl.className = 'index-wish-status success';
          } else {
            statusEl.textContent = 'Lời chúc đã được lưu vào bộ nhớ thiệp và sẽ tự động đồng bộ khi có kết nối!';
            statusEl.className = 'index-wish-status success';
          }
          statusEl.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Gửi lời chúc';
        }
      }

      if (authorInput) authorInput.value = '';
      if (wishInput) wishInput.value = '';

      setTimeout(() => {
        if (statusEl) statusEl.style.display = 'none';
        if (form) form.style.display = 'none';
        if (toggleBtn) toggleBtn.style.display = 'inline-flex';
      }, 4000);
    });
  }
}

function appendWishToDeck(wish) {
  if (!wish) return;
  const targetId = String(wish.id);
  const deck = document.getElementById('sub-letters-deck');
  if (deck) {
    const existing = Array.from(deck.children).find(card => card.getAttribute('data-id') === targetId)
                     || (window.CSS && CSS.escape ? deck.querySelector(`[data-id="${CSS.escape(targetId)}"]`) : null);
    if (!existing) {
      const card = createSubLetterCard(wish);
      deck.prepend(card);
      deck.scrollTop = 0;
    }
  }
}

function appendPhotoToFilmStrip(photo) {
  if (!photo) return;
  const targetId = String(photo.id);
  const filmTrackRow = document.getElementById('film-frames-row');
  if (filmTrackRow) {
    const existing = Array.from(filmTrackRow.children).find(frame => frame.getAttribute('data-id') === targetId)
                     || (window.CSS && CSS.escape ? filmTrackRow.querySelector(`[data-id="${CSS.escape(targetId)}"]`) : null);
    if (!existing) {
      const frame = createContributedFilmFrame(photo);
      filmTrackRow.appendChild(frame);
      initFilmSprocketsText();
      updateFilmDimensions();
    }
  }
}

function removeWishFromDeck(id) {
  if (!id) return;
  const targetId = String(id);
  const deck = document.getElementById('sub-letters-deck');
  if (deck) {
    const el = Array.from(deck.children).find(card => card.getAttribute('data-id') === targetId)
               || (window.CSS && CSS.escape ? deck.querySelector(`[data-id="${CSS.escape(targetId)}"]`) : null);
    if (el) el.remove();
  }
}

function removePhotoFromFilmStrip(id) {
  if (!id) return;
  const targetId = String(id);
  const filmTrackRow = document.getElementById('film-frames-row');
  if (filmTrackRow) {
    const el = Array.from(filmTrackRow.children).find(frame => frame.getAttribute('data-id') === targetId)
               || (window.CSS && CSS.escape ? filmTrackRow.querySelector(`[data-id="${CSS.escape(targetId)}"]`) : null);
    if (el) {
      el.remove();
      initFilmSprocketsText();
      updateFilmDimensions();
    }
  }
}

function refreshAllData() {
  renderSubLetters();
  renderContributedPhotos();
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
}

/* ===================================================================
   3. TƯƠNG TÁC LỜI KẾT & LƯU LẠI MỤC TIM THỰC TẾ (PERSISTED HEARTS)
   - Khởi tạo lượt tim bắt đầu từ 0 và lưu trữ bền bỉ trong localStorage
   =================================================================== */
function updateHeartCounter(newCount) {
  const countSpan = document.getElementById('heart-count');
  const num = parseInt(newCount, 10);
  if (isNaN(num)) return;
  const current = parseInt(localStorage.getItem('co_duyen_anh_hearts') || '0', 10);
  const finalNum = Math.max(num, current);
  try {
    localStorage.setItem('co_duyen_anh_hearts', finalNum.toString());
  } catch (e) {}
  if (countSpan) {
    countSpan.textContent = finalNum.toString();
  }
}

let pendingHeartClicks = 0;
let heartSyncTimer = null;

function flushHeartClicksToGas() {
  if (pendingHeartClicks <= 0) return;
  const countToSend = pendingHeartClicks;
  pendingHeartClicks = 0;
  const gasUrl = getGasWebAppUrl();
  if (!gasUrl) return;

  fetch(gasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'addHeart', count: countToSend })
  }).then(res => res.json()).then(data => {
    if (data && typeof data.hearts === 'number') {
      updateHeartCounter(data.hearts);
      if (syncChannel) {
        try { syncChannel.postMessage({ action: 'UPDATE_HEARTS', hearts: data.hearts }); } catch (e) {}
      }
    }
  }).catch(e => {
    console.warn('Lỗi đồng bộ lượt tim lên Google Sheets:', e);
  });
}

function initFinalTribute() {
  const heartBtn = document.getElementById('heart-btn');
  const countSpan = document.getElementById('heart-count');
  const replayBtn = document.getElementById('replay-btn');

  // Khôi phục số tim thực tế đã lưu từ localStorage (bắt đầu từ 0, dọn sạch giá trị 999 cũ nếu có)
  let savedHearts = localStorage.getItem('co_duyen_anh_hearts');
  if (savedHearts === '999' || savedHearts === '1000') {
    savedHearts = '0';
    try {
      localStorage.setItem('co_duyen_anh_hearts', '0');
    } catch (e) {}
  }
  const initialHearts = savedHearts !== null ? savedHearts : '0';
  if (countSpan) {
    countSpan.textContent = initialHearts;
  }

  if (heartBtn && countSpan) {
    heartBtn.addEventListener('click', (e) => {
      let count = parseInt(countSpan.textContent || '0', 10);
      if (isNaN(count)) count = 0;
      count++;
      countSpan.textContent = count;
      try {
        localStorage.setItem('co_duyen_anh_hearts', count.toString());
      } catch (err) {}
      playSound('chime');

      // Gom lượt click và tự động đẩy lên Google Sheets sau 1.2s (Debounce tối ưu mạng)
      pendingHeartClicks++;
      clearTimeout(heartSyncTimer);
      heartSyncTimer = setTimeout(flushHeartClicksToGas, 1200);

      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'flying-heart';
          heart.innerText = ['❤️', '💖', '💐', '✨', '🌸'][Math.floor(Math.random() * 5)];
          heart.style.left = `${e.clientX + (Math.random() - 0.5) * 90}px`;
          heart.style.top = `${e.clientY - 20}px`;
          document.body.appendChild(heart);
          setTimeout(() => heart.remove(), 2000);
        }, i * 60);
      }
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playSound('pop');
    });
  }
}

/* ===================================================================
   VÒNG LẶP ĐIỀU KHIỂN CHUYỂN ĐỘNG ANTIGRAVITY THEO CUỘN TRANG
   =================================================================== */
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// Hỗ trợ cảm ứng vuốt trên màn hình điện thoại di động
window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches[0]) {
    mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }
}, { passive: true });

let targetProgress = 0;
let currentProgress = 0;
let lastTriggerStage = -1;

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  targetProgress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
}, { passive: true });

function initAnimationLoop() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const stageBadge = document.getElementById('stage-badge');

  const flap = document.getElementById('flap');
  const envParts = document.querySelectorAll('.env-part');
  const letter = document.getElementById('letter');
  const letterSecTop = document.getElementById('letter-sec-top');
  const letterSecBottom = document.getElementById('letter-sec-bottom');
  const crease1 = document.getElementById('crease-1');
  const crease2 = document.getElementById('crease-2');
  const scrollHint = document.getElementById('scroll-hint');
  const mainGreeting = document.getElementById('main-greeting');
  const teacherCenterpiece = document.getElementById('teacher-centerpiece');
  const filmStage = document.getElementById('film-stage');
  const filmTrack = document.getElementById('film-track');
  const subLettersStage = document.getElementById('sub-letters-stage');
  const finalTribute = document.getElementById('final-tribute');

  // Khởi tạo cache kích thước filmTrack để triệt tiêu Forced Synchronous Reflow trong rAF
  updateFilmDimensions();
  initFilmSprocketsText();
  window.addEventListener('resize', () => {
    updateFilmDimensions();
    initFilmSprocketsText();
  });
  window.addEventListener('load', () => {
    updateFilmDimensions();
    initFilmSprocketsText();
  });

  let envHidden = false;

  function animate(time) {
    // Lerp mượt mà 60fps (thích ứng phản hồi cảm ứng nhanh trên điện thoại)
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isPortrait = window.innerWidth < window.innerHeight;
    const isMobilePortrait = isPortrait && window.innerWidth <= 768;
    const lerpRate = isTouch ? 0.08 : 0.055;
    currentProgress += (targetProgress - currentProgress) * lerpRate;
    if (Math.abs(targetProgress - currentProgress) < 0.0001) {
      currentProgress = targetProgress;
    }

    const p = currentProgress;

    // Cập nhật thanh tiến độ
    if (progressBar) progressBar.style.width = `${p * 100}%`;

    // Cập nhật nhãn giai đoạn (7 giai đoạn trang trọng, rõ ràng)
    let currentStage = 1;
    if (p < 0.06) {
      currentStage = 1;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 1: Mở phong bì thư';
    } else if (p < 0.22) {
      currentStage = 2;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 2: Bức tâm thư tri ân Cô Duyên Anh';
    } else if (p < 0.33) {
      currentStage = 3;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 3: Chúc Cô Duyên Anh 20/11 vui vẻ!';
    } else if (p < 0.46) {
      currentStage = 4;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 4: Vũ trụ Meme Cô Duyên Anh';
    } else if (p < 0.76) {
      currentStage = 5;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 5: Cuộn phim Kỷ yếu & Kỷ niệm 35mm';
    } else if (p < 0.90) {
      currentStage = 6;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 6: Những lá thư tri ân từ học trò';
    } else {
      currentStage = 7;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 7: Thả tim tri ân 20/11';
    }

    // Phát âm thanh khi đổi giai đoạn
    if (currentStage !== lastTriggerStage) {
      if (currentStage === 2) playSound('chime');
      else if (currentStage === 3) playSound('chime');
      else if (currentStage === 4) playSound('pop');
      else if (currentStage === 5) playSound('chime');
      else if (currentStage === 6) playPaperRustle();
      else if (currentStage === 7) playSound('chime');
      lastTriggerStage = currentStage;
    }

    // -------------------------------------------------------------
    // 1. PHONG BÌ THƯ & HIỆU ỨNG MỞ LÁ THƯ 3D (CHUYỂN TIẾP MƯỢT MÀ, KHÔNG KHỰNG)
    // -------------------------------------------------------------
    if (scrollHint) {
      scrollHint.style.opacity = mapRange(p, 0.00, 0.035, 1, 0);
    }

    // Mở nắp phong bì mềm mại (p: 0.00 -> 0.065)
    const flapAngle = mapRange(p, 0.00, 0.065, 0, 180);

    // Tính toán trạng thái lá thư hoàn toàn liên tục
    let letterY = 0;
    let letterScale = 0.65;
    let letterOpacity = 1.0;
    let tiltX = 0, tiltY = 0;
    let unfoldProgress = 0;
    let letterZ = 2;

    if (p <= 0.045) {
      // Khi phong bì chưa mở hẳn: lá thư ẩn kín 100%, tuyệt đối không thò mép
      letterOpacity = 0;
      letterY = 25;
      letterScale = 0.65;
      unfoldProgress = 0;
      letterZ = 2;
      if (letter) {
        letter.style.visibility = 'hidden';
        letter.classList.remove('unfolded');
      }
    } else if (p <= 0.085) {
      // Nắp mở ra, lá thư mới xuất hiện và trượt êm ái lên trên khỏi miệng phong bì
      if (letter) letter.style.visibility = 'visible';
      letterOpacity = mapRange(p, 0.045, 0.065, 0, 1);
      letterY = mapRange(p, 0.045, 0.085, 25, -140);
      letterScale = mapRange(p, 0.045, 0.085, 0.65, 0.78);
      unfoldProgress = 0;
      letterZ = p > 0.07 ? 65 : 2;
      if (letter) letter.classList.remove('unfolded');
    } else if (p <= 0.15) {
      // Lá thư mở bung 3D, phóng to và lướt về trung tâm màn hình mượt mà
      if (letter) letter.style.visibility = 'visible';
      unfoldProgress = mapRange(p, 0.085, 0.15, 0, 1);
      letterY = mapRange(p, 0.085, 0.15, -140, 0);
      letterScale = mapRange(p, 0.085, 0.15, 0.78, 1.0);
      letterOpacity = 1;
      letterZ = 65;
      if (letter) letter.classList.add('unfolded');
    } else if (p <= 0.20) {
      // Lá thư dừng ở trung tâm màn hình để người đọc thưởng thức, bồng bềnh nhẹ nhàng
      if (letter) letter.style.visibility = 'visible';
      unfoldProgress = 1;
      letterY = Math.sin(time * 0.002) * 4;
      letterScale = 1.0;
      letterOpacity = 1;
      letterZ = 65;
      tiltX = mouseY * -4;
      tiltY = mouseX * 4;
      if (letter) letter.classList.add('unfolded');
    } else if (p <= 0.25) {
      // Chuyển tiếp mượt sang giai đoạn chữ tri ân
      if (letter) letter.style.visibility = 'visible';
      unfoldProgress = 1;
      letterY = mapRange(p, 0.20, 0.25, 0, -30);
      letterScale = mapRange(p, 0.20, 0.25, 1.0, 1.35);
      letterOpacity = mapRange(p, 0.20, 0.25, 1, 0);
      letterZ = 65;
      if (letter) letter.classList.add('unfolded');
    } else {
      letterOpacity = 0;
      if (letter) {
        letter.style.visibility = 'hidden';
        letter.classList.remove('unfolded');
      }
    }

    if (letterSecTop && letterSecBottom) {
      const topFoldAngle = (1 - unfoldProgress) * -85;
      const bottomFoldAngle = (1 - unfoldProgress) * 85;
      letterSecTop.style.transform = `rotateX(${topFoldAngle}deg)`;
      letterSecBottom.style.transform = `rotateX(${bottomFoldAngle}deg)`;
    }
    if (crease1 && crease2) {
      const creaseOp = mapRange(unfoldProgress, 0, 1, 0.6, 0.08);
      crease1.style.opacity = creaseOp;
      crease2.style.opacity = creaseOp;
    }

    // Phong bì (env-part) trôi xuống và mờ dần rất êm dịu
    if (p <= 0.20) {
      envHidden = false;
      const envDropY = mapRange(p, 0.085, 0.15, 0, 240);
      const envOpacity = mapRange(p, 0.085, 0.13, 1, 0);
      envParts.forEach(el => {
        if (el.id === 'flap') {
          el.style.transform = `translateY(${envDropY}px) rotateX(${flapAngle}deg)`;
          el.style.zIndex = flapAngle > 90 ? 1 : 5;
        } else {
          el.style.transform = `translateY(${envDropY}px)`;
        }
        el.style.opacity = envOpacity;
        el.style.pointerEvents = 'none';
      });
    } else if (!envHidden) {
      envHidden = true;
      envParts.forEach(el => {
        el.style.opacity = 0;
        el.style.pointerEvents = 'none';
      });
    }

    const envWrapper = document.getElementById('envelope-wrapper');
    if (envWrapper) {
      envWrapper.style.pointerEvents = p < 0.06 ? 'auto' : 'none';
    }

    if (letter) {
      letter.style.transform = `translate(-50%, calc(-50% + ${letterY}px)) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${letterScale})`;
      letter.style.opacity = letterOpacity;
      letter.style.zIndex = letterZ;
      letter.style.pointerEvents = (letterOpacity > 0.1 && p <= 0.20) ? 'auto' : 'none';
    }

    // -------------------------------------------------------------
    // 2. CHỮ CHÚC MỪNG CHÍNH (p: 0.22 -> 0.33) - HOÀN TOÀN ĐỘC LẬP
    // -------------------------------------------------------------
    let greetingOpacity = 0;
    let greetingScale = 0.8;
    if (p >= 0.22 && p <= 0.33) {
      greetingOpacity = p < 0.25 ? mapRange(p, 0.22, 0.25, 0, 1) : (p > 0.30 ? mapRange(p, 0.30, 0.33, 1, 0) : 1);
      greetingScale = mapRange(p, 0.22, 0.33, 0.85, 1.15);
    }
    if (mainGreeting) {
      mainGreeting.style.opacity = greetingOpacity;
      mainGreeting.style.transform = `translate(-50%, -50%) scale(${greetingScale})`;
    }

    // -------------------------------------------------------------
    // 3. ICON CƠ BẢN BAY NHẸ NHÀNG, CHẬM RÃI (p: 0.12 -> 1.00)
    // -------------------------------------------------------------
    const iconProgress = Math.max(0, mapRange(p, 0.12, 1.00, 0, 1));
    iconList.forEach(item => {
      const currentY = item.startY - (item.startY - item.targetY) * iconProgress;
      const currentX = item.startX + item.driftX * iconProgress;
      const currentRot = item.rotSpeed * iconProgress;

      const wobbleX = Math.sin(time * item.wobbleSpeed + item.offset) * item.wobbleAmp;
      const wobbleY = Math.cos(time * item.wobbleSpeed + item.offset) * (item.wobbleAmp / 2);

      const op = mapRange(p, 0.12, 0.22, 0, 0.65);
      item.el.style.transform = `translate(${currentX + wobbleX}vw, ${currentY + wobbleY}vh) rotate(${currentRot}deg) scale(${item.scale})`;
      item.el.style.opacity = op;
    });

    // -------------------------------------------------------------
    // 4. 9 MEME CỦA CÔ DUYÊN ANH (p: 0.33 -> 0.46) - TỐI ƯU CỜ TRẠNG THÁI 60FPS
    // -------------------------------------------------------------
    floatingItemList.forEach(item => {
      const d = item.data;
      if (p < d.startP - 0.02 || p > d.endP + 0.02) {
        if (!item.isHidden) {
          item.el.style.opacity = 0;
          item.el.style.pointerEvents = 'none';
          item.el.style.transform = `translate(0px, 120vh)`;
          item.isHidden = true;
        }
        return;
      }

      item.isHidden = false;
      const itemProgress = mapRange(p, d.startP, d.endP, 0, 1);
      const currentY = 112 - itemProgress * 148;
      const swayX = Math.sin(time * item.freqX + item.phaseX) * item.ampX + Math.sin(itemProgress * Math.PI * 1.5) * item.curveAmp;
      const floatY = Math.cos(time * item.freqY + item.phaseY) * item.ampY;
      const dynamicRot = d.baseRot + Math.sin(time * item.freqRot + item.phaseRot) * item.rotAmp + (Math.cos(itemProgress * Math.PI) * 4);
      const tiltX = mouseY * item.parallax * -12 + Math.sin(time * 0.001 + item.phaseX) * 3;
      const tiltY = mouseX * item.parallax * 12 + Math.cos(time * 0.001 + item.phaseY) * 3;
      const scaleBreath = 1 + Math.sin(time * 0.002 + item.phaseY) * 0.035;

      let op = 1;
      if (itemProgress < 0.15) op = mapRange(itemProgress, 0, 0.15, 0, 1);
      else if (itemProgress > 0.85) op = mapRange(itemProgress, 0.85, 1, 1, 0);

      const targetBaseX = isMobilePortrait 
        ? (d.baseX > 50 ? (58 + (d.baseX - 62) * 0.35) : (2 + (d.baseX - 5) * 0.35))
        : d.baseX;
      const actualSwayX = isMobilePortrait ? swayX * 0.45 : swayX;

      item.el.style.transform = `translate(${targetBaseX + actualSwayX}vw, calc(${currentY}vh + ${floatY}px)) rotate(${dynamicRot}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scaleBreath})`;
      item.el.style.opacity = op;
      item.el.style.pointerEvents = op > 0.2 ? 'auto' : 'none';
    });

    // TRUNG TÂM KỶ NIỆM (CÔ DUYÊN ANH) (p: 0.34 -> 0.46)
    let teacherOp = 0;
    let teacherScale = 0.7;
    if (p >= 0.34 && p <= 0.46) {
      teacherOp = p < 0.38 ? mapRange(p, 0.34, 0.38, 0, 1) : mapRange(p, 0.42, 0.46, 1, 0);
      teacherScale = mapRange(p, 0.34, 0.40, 0.7, 1);
    }
    if (teacherCenterpiece) {
      const bobY = Math.sin(time * 0.002) * 8;
      teacherCenterpiece.style.opacity = teacherOp;
      teacherCenterpiece.style.transform = `translate(-50%, calc(-50% + ${bobY}px)) scale(${teacherScale})`;
    }

    // -------------------------------------------------------------
    // 5. ĐẠI THƯỚC PHIM KỶ YẾU & KỶ NIỆM 35MM (p: 0.46 -> 0.76)
    // TỐI ƯU 60FPS: SỬ DỤNG CACHED SCROLLWIDTH KHÔNG GÂY LAYOUT THRASHING
    // -------------------------------------------------------------
    let filmOp = 0;
    if (p >= 0.46 && p <= 0.78) {
      filmOp = p < 0.50 ? mapRange(p, 0.46, 0.50, 0, 1) : mapRange(p, 0.73, 0.77, 1, 0);
    }
    if (filmStage) {
      filmStage.style.opacity = filmOp;
      filmStage.style.pointerEvents = (filmOp > 0.3 && p < 0.75) ? 'auto' : 'none';
    }
    if (filmTrack && p >= 0.46 && p <= 0.78) {
      const filmProg = p < 0.50 ? 0 : (p > 0.73 ? 1 : mapRange(p, 0.50, 0.73, 0, 1));
      const rowEl = document.getElementById('film-frames-row');
      if (rowEl) {
        const lastFrame = rowEl.lastElementChild;
        const winWidth = window.innerWidth;
        const startOffset = winWidth > 768 ? 72 : 24;
        const endPadding = winWidth > 768 ? 48 : 24;
        // Điểm kết thúc chính xác của tấm ảnh cuối cùng (tự động mở rộng khi có ảnh mới, dừng ngang tấm cuối)
        const contentEnd = lastFrame ? (lastFrame.offsetLeft + lastFrame.offsetWidth + endPadding) : (rowEl.scrollWidth || cachedFilmTrackWidth);
        const maxTranslate = Math.max(0, contentEnd - winWidth + startOffset);
        const currentX = -filmProg * maxTranslate + startOffset;
        filmTrack.style.transform = `translateX(${currentX}px)`;
      }
    }

    // -------------------------------------------------------------
    // 6. PHÂN ĐOẠN CÁC LÁ THƯ CON TRI ÂN XẾP TẦNG (p: 0.75 -> 0.91)
    // -------------------------------------------------------------
    let subOp = 0;
    if (p >= 0.75 && p <= 0.91) {
      subOp = p < 0.78 ? mapRange(p, 0.75, 0.78, 0, 1) : mapRange(p, 0.87, 0.91, 1, 0);
    }
    if (subLettersStage) {
      subLettersStage.style.opacity = subOp;
      subLettersStage.style.pointerEvents = subOp > 0.3 ? 'auto' : 'none';
      const subY = mapRange(p, 0.75, 0.91, 20, -20);
      subLettersStage.style.transform = `translate(-50%, calc(-50% + ${subY}px))`;
    }

    // -------------------------------------------------------------
    // 7. TƯƠNG TÁC THẢ TIM & CUỘN LÊN ĐẦU TRANG (p: 0.88 -> 1.00)
    // -------------------------------------------------------------
    let tributeOp = 0;
    let tributeY = 30;
    if (p >= 0.88) {
      tributeOp = mapRange(p, 0.88, 0.93, 0, 1);
      tributeY = mapRange(p, 0.88, 0.93, 30, 0);
    }
    if (finalTribute) {
      finalTribute.style.opacity = tributeOp;
      finalTribute.style.transform = `translate(-50%, calc(-50% + ${tributeY}px))`;
      finalTribute.style.pointerEvents = tributeOp > 0.2 ? 'auto' : 'none';
      finalTribute.style.zIndex = '100';
    }

    // -------------------------------------------------------------
    // 8. CẬP NHẬT HỆ THỐNG BỤI VŨ TRỤ
    // -------------------------------------------------------------
    dustList.forEach(dust => {
      dust.x += dust.vx;
      dust.y += dust.vy;
      if (dust.y < -5) dust.y = 105;
      if (dust.x < -5) dust.x = 105;
      if (dust.x > 105) dust.x = -5;

      const alpha = dust.baseAlpha + Math.sin(time * dust.twinkle) * 0.3;
      dust.el.style.transform = `translate(${dust.x}vw, ${dust.y}vh)`;
      dust.el.style.opacity = Math.max(0.05, alpha);
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}