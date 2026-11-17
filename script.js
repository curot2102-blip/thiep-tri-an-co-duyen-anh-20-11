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

  if (authorEl) authorEl.textContent = author ? `📸 ${author}` : '📸 Tập thể học trò tri ân Cô';
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
   - Không tạo khoảng trống dư thừa phía sau tấm ảnh cuối cùng
   =================================================================== */
function initFilmSprocketsText() {
  const topSprockets = document.getElementById('film-sprockets-top');
  const bottomSprockets = document.getElementById('film-sprockets-bottom');
  const filmFramesRow = document.getElementById('film-frames-row');

  const topText = '<span class="film-meta-text">KODAK VISION3 500T &bull; 20.11 &bull; KỶ YẾU & KỶ NIỆM CÔ DUYÊN ANH</span>';
  const bottomText = '<span class="film-meta-text">EASTMAN FILM &bull; SAFETY FILM &bull; TRI ÂN CÔ DUYÊN ANH 20.11</span>';

  const rowWidth = filmFramesRow ? (filmFramesRow.scrollWidth || 14000) : 14000;
  // Mỗi khối chữ span dài khoảng 460px
  const count = Math.max(8, Math.ceil(rowWidth / 460) + 2);

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
  const filmTrack = document.getElementById('film-track');
  if (filmFramesRow && filmFramesRow.scrollWidth > 0) {
    cachedFilmTrackWidth = filmFramesRow.scrollWidth;
  } else if (filmTrack) {
    cachedFilmTrackWidth = filmTrack.scrollWidth;
  }
}

function getDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem('co_duyen_anh_deleted_ids') || '[]');
  } catch (e) {
    return [];
  }
}

async function initWishesData() {
  const isInit = localStorage.getItem('co_duyen_anh_initialized');
  if (!isInit) {
    try {
      const res = await fetch('wishes.json');
      if (res.ok) {
        const fileWishes = await res.json();
        if (Array.isArray(fileWishes)) {
          const currentLocal = localStorage.getItem('co_duyen_anh_wishes');
          if (!currentLocal) {
            localStorage.setItem('co_duyen_anh_wishes', JSON.stringify(fileWishes));
          }
        }
      }
    } catch (e) {
      console.warn('Wishes fetch fallback', e);
    }
    localStorage.setItem('co_duyen_anh_initialized', 'true');
  }

  renderSubLetters();
  renderContributedPhotos();
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

  photos.forEach(photo => {
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
      <span class="contributor-icon">📸</span>
      <span class="contributor-name">${escapeHtml(photo.author || 'Bạn học trò')}</span>
    </div>
  `;

  const imgEl = new Image();
  imgEl.className = 'film-img';
  imgEl.src = photo.image;
  imgEl.alt = `Kỷ niệm từ ${photo.author || 'Bạn học trò'}`;
  imgEl.loading = 'lazy';

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
        if (!msg || !msg.action) return;

        switch (msg.action) {
          case 'ADD_WISH':
            appendWishToDeck(msg.data);
            playSound('chime');
            break;
          case 'ADD_PHOTOS':
            if (Array.isArray(msg.data)) {
              msg.data.forEach(p => appendPhotoToFilmStrip(p));
              playSound('chime');
            }
            break;
          case 'DELETE_WISH':
            removeWishFromDeck(msg.id);
            break;
          case 'DELETE_PHOTO':
            removePhotoFromFilmStrip(msg.id);
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
  });
}

function appendWishToDeck(wish) {
  if (!wish) return;
  const deck = document.getElementById('sub-letters-deck');
  if (deck) {
    const existing = deck.querySelector(`[data-id="${wish.id}"]`);
    if (!existing) {
      const card = createSubLetterCard(wish);
      deck.appendChild(card);
    }
  }
}

function appendPhotoToFilmStrip(photo) {
  if (!photo) return;
  const filmTrackRow = document.getElementById('film-frames-row');
  if (filmTrackRow) {
    const existing = filmTrackRow.querySelector(`[data-id="${photo.id}"]`);
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
  const deck = document.getElementById('sub-letters-deck');
  if (deck) {
    const el = deck.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
  }
}

function removePhotoFromFilmStrip(id) {
  if (!id) return;
  const filmTrackRow = document.getElementById('film-frames-row');
  if (filmTrackRow) {
    const el = filmTrackRow.querySelector(`[data-id="${id}"]`);
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
  if (!text) return '';
  return text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
}

/* ===================================================================
   3. TƯƠNG TÁC LỜI KẾT & LƯU LẠI MỤC TIM THỰC TẾ (PERSISTED HEARTS)
   =================================================================== */
function initFinalTribute() {
  const heartBtn = document.getElementById('heart-btn');
  const countSpan = document.getElementById('heart-count');
  const replayBtn = document.getElementById('replay-btn');

  // Khôi phục số tim thực tế đã lưu từ localStorage
  const savedHearts = localStorage.getItem('co_duyen_anh_hearts') || '999';
  if (countSpan) {
    countSpan.textContent = savedHearts;
  }

  if (heartBtn && countSpan) {
    heartBtn.addEventListener('click', (e) => {
      let count = parseInt(countSpan.textContent || '999', 10);
      count++;
      countSpan.textContent = count;
      try {
        localStorage.setItem('co_duyen_anh_hearts', count.toString());
      } catch (err) {}
      playSound('chime');

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
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 5: Thước phim Kỷ yếu & Kỷ niệm 35mm';
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
    // 1. PHONG BÌ THƯ & HIỆU ỨNG MỞ LÁ THƯ 3D (GIẢM CUỘN GẤP ĐÔI, MƯỢT MÀ)
    // -------------------------------------------------------------
    if (scrollHint) {
      scrollHint.style.opacity = mapRange(p, 0.00, 0.04, 1, 0);
    }

    // Mở nắp phong bì (p: 0.00 -> 0.05)
    const flapAngle = mapRange(p, 0.00, 0.05, 0, 180);

    // Tính toán trạng thái lá thư hoàn toàn liên tục
    let letterY = 0;
    let letterScale = 0.65;
    let letterOpacity = 1.0;
    let tiltX = 0, tiltY = 0;
    let unfoldProgress = 0;
    let letterZ = 2;

    if (p <= 0.04) {
      letterOpacity = 0;
      letterY = 15;
      letterScale = 0.85;
      unfoldProgress = 0;
      letterZ = 2;
      if (letter) letter.classList.remove('unfolded');
    } else if (p <= 0.10) {
      letterOpacity = mapRange(p, 0.04, 0.07, 0, 1);
      letterY = mapRange(p, 0.05, 0.10, 0, -240);
      letterScale = 1.0;
      unfoldProgress = 0;
      letterZ = p > 0.075 ? 65 : 2;
      if (letter) letter.classList.remove('unfolded');
    } else if (p <= 0.15) {
      unfoldProgress = mapRange(p, 0.10, 0.15, 0, 1);
      letterY = mapRange(p, 0.10, 0.15, -240, 0);
      letterScale = mapRange(p, 0.10, 0.15, 1.0, 1.1);
      letterZ = 65;
      if (letter) letter.classList.add('unfolded');
    } else if (p <= 0.19) {
      unfoldProgress = 1;
      letterY = Math.sin(time * 0.002) * 4;
      letterScale = 1.1;
      letterZ = 65;
      tiltX = mouseY * -5;
      tiltY = mouseX * 5;
      if (letter) letter.classList.add('unfolded');
    } else if (p <= 0.23) {
      unfoldProgress = 1;
      letterY = 0;
      letterScale = mapRange(p, 0.19, 0.23, 1.1, 1.85);
      letterOpacity = mapRange(p, 0.19, 0.23, 1, 0);
      letterZ = 65;
      if (letter) letter.classList.add('unfolded');
    } else {
      letterOpacity = 0;
      if (letter) letter.classList.remove('unfolded');
    }

    if (letterSecTop && letterSecBottom) {
      const topFoldAngle = (1 - unfoldProgress) * -85;
      const bottomFoldAngle = (1 - unfoldProgress) * 85;
      letterSecTop.style.transform = `rotateX(${topFoldAngle}deg)`;
      letterSecBottom.style.transform = `rotateX(${bottomFoldAngle}deg)`;
    }
    if (crease1 && crease2) {
      const creaseOp = mapRange(unfoldProgress, 0, 1, 0.6, 0.15);
      crease1.style.opacity = creaseOp;
      crease2.style.opacity = creaseOp;
    }

    // Phong bì (env-part) trôi xuống và mờ dần (với dirty flag tối ưu 60fps)
    if (p <= 0.20) {
      envHidden = false;
      const envDropY = mapRange(p, 0.10, 0.15, 0, 260);
      const envOpacity = mapRange(p, 0.10, 0.14, 1, 0);
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
      const totalWidth = (rowEl && rowEl.scrollWidth > 0) ? rowEl.scrollWidth : (cachedFilmTrackWidth || filmTrack.scrollWidth);
      const winWidth = window.innerWidth;
      const startOffset = winWidth > 768 ? 72 : 24;
      const endPadding = winWidth > 768 ? 48 : 24;
      // Dừng lại CHÍNH XÁC ở tấm ảnh cuối cùng, không cuộn sang đoạn trống không có ảnh
      const maxTranslate = Math.max(0, totalWidth - winWidth + startOffset + endPadding);
      const currentX = -filmProg * maxTranslate + startOffset;
      filmTrack.style.transform = `translateX(${currentX}px)`;
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