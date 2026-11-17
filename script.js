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
  initWishesWall();
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
  { src: 'images/meme 1.png', startP: 0.33, endP: 0.44, baseX: 5,  baseRot: -8, w: 215 },
  { src: 'images/meme 3.png', startP: 0.34, endP: 0.45, baseX: 18, baseRot: 6,  w: 205 },
  { src: 'images/meme 5 .png', startP: 0.35, endP: 0.46, baseX: 7,  baseRot: 10, w: 215 },
  { src: 'images/meme 7 .png', startP: 0.36, endP: 0.47, baseX: 20, baseRot: -7, w: 210 },
  { src: 'images/meme 9 .png', startP: 0.37, endP: 0.48, baseX: 9,  baseRot: 5,  w: 220 },

  // --- CÁNH PHẢI (RIGHT FLANK) ---
  { src: 'images/meme 2 .png', startP: 0.33, endP: 0.44, baseX: 75, baseRot: 8,  w: 215 },
  { src: 'images/meme 4 .png', startP: 0.34, endP: 0.45, baseX: 62, baseRot: -9, w: 205 },
  { src: 'images/meme 6.png', startP: 0.35, endP: 0.46, baseX: 76, baseRot: -6, w: 220 },
  { src: 'images/meme 8.png', startP: 0.36, endP: 0.47, baseX: 64, baseRot: 9,  w: 210 }
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
   BỘ XEM ẢNH TRỰC TIẾP TINH GỌN (CHỈ HIỆN ẢNH, CHẠM ĐỂ ĐÓNG, KHÔNG POPUP)
   =================================================================== */
let cleanViewerEl = null;
let cleanViewerImg = null;

function initCleanViewer() {
  cleanViewerEl = document.getElementById('clean-image-viewer');
  cleanViewerImg = document.getElementById('clean-viewer-img');

  if (cleanViewerEl) {
    cleanViewerEl.addEventListener('click', () => {
      cleanViewerEl.classList.remove('active');
      setTimeout(() => { if (cleanViewerImg) cleanViewerImg.src = ''; }, 200);
    });
  }
}

function openCleanImage(src) {
  if (!cleanViewerEl || !cleanViewerImg || !src) return;
  cleanViewerImg.src = src;
  cleanViewerEl.classList.add('active');
  playSound('pop');
}

/* ===================================================================
   KHỞI TẠO THƯỚC PHIM KỶ YẾU ĐIỆN ẢNH (FILM STRIP)
   - Tắt popup phiền phức; CHỈ KHI NHẤN TRỰC TIẾP VÀO ẢNH (IMG) MỚI MỞ XEM
   =================================================================== */
function initFilmStrip() {
  const frames = document.querySelectorAll('.film-frame');
  frames.forEach(frame => {
    const img = frame.querySelector('img');
    if (img) {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openCleanImage(img.getAttribute('src'));
      });
    }
    frame.addEventListener('mouseenter', () => playSound('pop'));
  });
}

/* ===================================================================
   BỨC TƯỜNG LỜI CHÚC CỦA CÁC BẠN TRONG LỚP & NỐI TIẾP ẢNH VÀO CUỘN PHIM
   =================================================================== */
function initWishesWall() {
  const toggleBtn = document.getElementById('toggle-wishes-btn');
  const wishesWall = document.getElementById('classmates-wishes-wall');
  const container = document.getElementById('wishes-cards-container');
  const filmTrackRow = document.querySelector('.film-frames-row');

  if (toggleBtn && wishesWall) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = wishesWall.classList.toggle('active');
      toggleBtn.textContent = isActive 
        ? '✕ Thu Gọn Lời Chúc' 
        : '💌 Xem Lời Chúc Của Các Bạn Trong Lớp';
      playSound('pop');
    });
  }

  loadWishes(container, filmTrackRow);
}

async function loadWishes(container, filmTrackRow) {
  let wishes = [];
  try {
    const res = await fetch('wishes.json');
    if (res.ok) {
      wishes = await res.json();
    }
  } catch (e) {
    console.warn('Fallback wishes');
  }

  // Kết hợp các lời chúc và ảnh mới được lưu trong localStorage
  try {
    const local = localStorage.getItem('co_duyen_anh_wishes');
    if (local) {
      const localWishes = JSON.parse(local);
      if (Array.isArray(localWishes)) {
        localWishes.forEach(lw => {
          if (!wishes.some(w => w.id === lw.id)) {
            wishes.push(lw);
          }
        });
      }
    }
  } catch (err) {}

  if (!container) return;
  container.innerHTML = '';

  wishes.forEach(item => {
    const card = document.createElement('div');
    card.className = 'wish-mini-card';
    card.innerHTML = `
      <div class="wish-card-author">
        <span>🌸 ${item.author || 'Bạn học sinh'}</span>
        <span class="wish-card-time">${item.time || ''}</span>
      </div>
      <div class="wish-card-text">${item.wish || ''}</div>
      ${item.image ? `<img class="wish-card-img" src="${item.image}" alt="Ảnh kỷ niệm đính kèm" loading="lazy">` : ''}
    `;

    const cardImg = card.querySelector('.wish-card-img');
    if (cardImg) {
      cardImg.addEventListener('click', (e) => {
        e.stopPropagation();
        openCleanImage(item.image);
      });
    }

    container.appendChild(card);

    // YÊU CẦU: Nếu có ảnh trong lời chúc, tự động NỐI TIẾP VÀO CUỘN PHIM 35MM
    if (item.image && filmTrackRow) {
      const newFrame = document.createElement('div');
      newFrame.className = 'film-frame portrait dynamic-contributed-frame';
      newFrame.setAttribute('data-src', item.image);
      newFrame.innerHTML = `
        <img src="${item.image}" alt="Kỷ niệm từ ${item.author}" loading="lazy">
      `;
      const img = newFrame.querySelector('img');
      if (img) {
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          openCleanImage(item.image);
        });
      }
      filmTrackRow.appendChild(newFrame);
    }
  });
}

/* ===================================================================
   TƯƠNG TÁC LỜI KẾT & THẢ TIM (FINAL TRIBUTE)
   =================================================================== */
function initFinalTribute() {
  const heartBtn = document.getElementById('heart-btn');
  const countSpan = document.getElementById('heart-count');
  const replayBtn = document.getElementById('replay-btn');

  if (heartBtn && countSpan) {
    heartBtn.addEventListener('click', (e) => {
      let count = parseInt(countSpan.textContent || '999', 10);
      countSpan.textContent = count + 1;
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
  const finalTribute = document.getElementById('final-tribute');

  function animate(time) {
    // Lerp mượt mà 60fps (thích ứng phản hồi cảm ứng nhanh trên điện thoại)
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const isPortrait = window.innerWidth < window.innerHeight;
    const isMobilePortrait = isTouch && isPortrait;
    const lerpRate = isTouch ? 0.08 : 0.055;
    currentProgress += (targetProgress - currentProgress) * lerpRate;
    if (Math.abs(targetProgress - currentProgress) < 0.0001) {
      currentProgress = targetProgress;
    }

    const p = currentProgress;

    // Cập nhật thanh tiến độ
    if (progressBar) progressBar.style.width = `${p * 100}%`;

    // Cập nhật nhãn giai đoạn (6 giai đoạn tinh gọn, cân đối hoàn hảo)
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
    } else if (p < 0.48) {
      currentStage = 4;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 4: Vũ trụ Meme Cô Duyên Anh';
    } else if (p < 0.90) {
      currentStage = 5;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 5: Thước phim Kỷ yếu & Kỷ niệm 35mm';
    } else {
      currentStage = 6;
      if (stageBadge) stageBadge.textContent = 'Giai đoạn 6: Thả tim tri ân 20/11';
    }

    // Phát âm thanh khi đổi giai đoạn
    if (currentStage !== lastTriggerStage) {
      if (currentStage === 2) playSound('chime');
      else if (currentStage === 3) playSound('chime');
      else if (currentStage === 4) playSound('pop');
      else if (currentStage === 5) playSound('chime');
      else if (currentStage === 6) playSound('chime');
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
      // Khi phong bì chưa mở: Lá thư ẩn hoàn toàn 100% bên trong phong bì, tuyệt đối không lộ mép
      letterOpacity = 0;
      letterY = 15;
      letterScale = 0.85;
      unfoldProgress = 0;
      letterZ = 2;
      if (letter) letter.classList.remove('unfolded');
    } else if (p <= 0.10) {
      // Khi nắp mở (p: 0.04 -> 0.10): Lá thư hiện ra và trượt thẳng lên trên khỏi miệng phong bì
      letterOpacity = mapRange(p, 0.04, 0.07, 0, 1);
      letterY = mapRange(p, 0.05, 0.10, 0, -240);
      letterScale = 1.0;
      unfoldProgress = 0;
      letterZ = p > 0.075 ? 65 : 2;
      if (letter) letter.classList.remove('unfolded');
    } else if (p <= 0.15) {
      // === GIAI ĐOẠN MỞ BUNG LÁ THƯ 3D (p: 0.10 -> 0.15) ===
      unfoldProgress = mapRange(p, 0.10, 0.15, 0, 1);
      letterY = mapRange(p, 0.10, 0.15, -240, 0);
      letterScale = mapRange(p, 0.10, 0.15, 1.0, 1.1);
      letterZ = 65;
      if (letter) letter.classList.add('unfolded');
    } else if (p <= 0.19) {
      // === KHOẢNG CUỘN ĐỌC BỨC THƯ (p: 0.15 -> 0.19) ===
      unfoldProgress = 1;
      letterY = Math.sin(time * 0.002) * 4; // Bồng bềnh nhẹ nhàng
      letterScale = 1.1;
      letterZ = 65;
      tiltX = mouseY * -5;
      tiltY = mouseX * 5;
      if (letter) letter.classList.add('unfolded');
    } else if (p <= 0.23) {
      // Đọc thư xong: Bay phóng lớn về phía trước và tan biến vào vũ trụ
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

    // Hiệu ứng mở nếp gấp thư 3D (3-panel unfolding mượt mà)
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

    // Phong bì (env-part) trôi xuống và mờ dần khi thư đã rút ra
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

    const envWrapper = document.getElementById('envelope-wrapper');
    if (envWrapper) {
      envWrapper.style.pointerEvents = p < 0.06 ? 'auto' : 'none';
    }

    // Áp dụng transform GPU liên tục cho lá thư
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
    // 4. 9 MEME CỦA CÔ DUYÊN ANH (p: 0.33 -> 0.48) - CHUYỂN ĐỘNG NGẪU NHIÊN SINH ĐỘNG
    // -------------------------------------------------------------
    floatingItemList.forEach(item => {
      const d = item.data;
      if (p < d.startP - 0.02 || p > d.endP + 0.02) {
        item.el.style.opacity = 0;
        item.el.style.pointerEvents = 'none';
        item.el.style.transform = `translate(0px, 120vh)`;
        return;
      }

      const itemProgress = mapRange(p, d.startP, d.endP, 0, 1);

      // Quỹ đạo trôi dọc lượn sóng tự nhiên
      const currentY = 112 - itemProgress * 148;

      // Dao động ngang hình sin đa hài ngẫu nhiên + uốn cong theo cuộn
      const swayX = Math.sin(time * item.freqX + item.phaseX) * item.ampX + Math.sin(itemProgress * Math.PI * 1.5) * item.curveAmp;

      // Bồng bềnh lên xuống theo nhịp thở zero-gravity
      const floatY = Math.cos(time * item.freqY + item.phaseY) * item.ampY;

      // Xoay lắc tự nhiên theo nhịp riêng của từng thẻ
      const dynamicRot = d.baseRot + Math.sin(time * item.freqRot + item.phaseRot) * item.rotAmp + (Math.cos(itemProgress * Math.PI) * 4);

      // Nghiêng 3D theo chuột nhẹ nhàng (Parallax Depth)
      const tiltX = mouseY * item.parallax * -12 + Math.sin(time * 0.001 + item.phaseX) * 3;
      const tiltY = mouseX * item.parallax * 12 + Math.cos(time * 0.001 + item.phaseY) * 3;

      // Nhịp thở scale nhẹ nhàng
      const scaleBreath = 1 + Math.sin(time * 0.002 + item.phaseY) * 0.035;

      let op = 1;
      if (itemProgress < 0.15) op = mapRange(itemProgress, 0, 0.15, 0, 1);
      else if (itemProgress > 0.85) op = mapRange(itemProgress, 0.85, 1, 1, 0);

      // Cân chỉnh toạ độ baseX và biên độ lắc để không bị tràn hoặc che khuất ảnh cô trên màn hình dọc điện thoại
      // Khi người dùng xoay ngang màn hình (landscape), tự động dùng chuẩn 16:9 widescreen rộng rãi như máy tính
      const targetBaseX = isMobilePortrait 
        ? (d.baseX > 50 ? (58 + (d.baseX - 62) * 0.35) : (2 + (d.baseX - 5) * 0.35))
        : d.baseX;
      const actualSwayX = isMobilePortrait ? swayX * 0.45 : swayX;

      item.el.style.transform = `translate(${targetBaseX + actualSwayX}vw, calc(${currentY}vh + ${floatY}px)) rotate(${dynamicRot}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scaleBreath})`;
      item.el.style.opacity = op;
      item.el.style.pointerEvents = op > 0.2 ? 'auto' : 'none';
    });

    // TRUNG TÂM KỶ NIỆM (CÔ DUYÊN ANH) (p: 0.34 -> 0.48)
    let teacherOp = 0;
    let teacherScale = 0.7;
    if (p >= 0.34 && p <= 0.48) {
      teacherOp = p < 0.38 ? mapRange(p, 0.34, 0.38, 0, 1) : mapRange(p, 0.44, 0.48, 1, 0);
      teacherScale = mapRange(p, 0.34, 0.40, 0.7, 1);
    }
    if (teacherCenterpiece) {
      const bobY = Math.sin(time * 0.002) * 8;
      teacherCenterpiece.style.opacity = teacherOp;
      teacherCenterpiece.style.transform = `translate(-50%, calc(-50% + ${bobY}px)) scale(${teacherScale})`;
    }

    // -------------------------------------------------------------
    // 5. ĐẠI THƯỚC PHIM KỶ YẾU & KỶ NIỆM 35MM (p: 0.48 -> 0.90)
    // TĂNG KHOẢNG CUỘN RỘNG RÃI ĐỂ THOẢI MÁI XEM 31 BỨC ẢNH
    // -------------------------------------------------------------
    let filmOp = 0;
    if (p >= 0.48 && p <= 0.91) {
      filmOp = p < 0.52 ? mapRange(p, 0.48, 0.52, 0, 1) : mapRange(p, 0.86, 0.90, 1, 0);
    }
    if (filmStage) {
      filmStage.style.opacity = filmOp;
      filmStage.style.pointerEvents = (filmOp > 0.3 && p < 0.87) ? 'auto' : 'none';
    }
    if (filmTrack && p >= 0.48 && p <= 0.91) {
      // Khi đang chuyển cảnh mờ dần vào (p: 0.48 -> 0.52), giữ nguyên vị trí đầu dải phim
      // Trượt ngang thong thả qua toàn bộ 31 khung hình (p: 0.52 -> 0.86)
      const filmProg = p < 0.52 ? 0 : (p > 0.86 ? 1 : mapRange(p, 0.52, 0.86, 0, 1));
      const totalWidth = filmTrack.scrollWidth;
      const winWidth = window.innerWidth;
      const startOffset = winWidth > 768 ? 72 : 24;
      const maxTranslate = Math.max(0, totalWidth - winWidth + startOffset + 80);
      const currentX = -filmProg * maxTranslate + startOffset;
      filmTrack.style.transform = `translateX(${currentX}px)`;
    }

    // -------------------------------------------------------------
    // 6. TƯƠNG TÁC THẢ TIM & CUỘN LÊN ĐẦU TRANG (p: 0.88 -> 1.00)
    // BẤM LÀ NHẬN NGAY LẬP TỨC, KHÔNG BỊ HÚT HOẶC CHE BỞI CÁC LỚP KHÁC
    // -------------------------------------------------------------
    let tributeOp = 0;
    let tributeY = 30;
    if (p >= 0.88) {
      tributeOp = mapRange(p, 0.88, 0.92, 0, 1);
      tributeY = mapRange(p, 0.88, 0.92, 30, 0);
    }
    if (finalTribute) {
      finalTribute.style.opacity = tributeOp;
      finalTribute.style.transform = `translate(-50%, calc(-50% + ${tributeY}px))`;
      finalTribute.style.pointerEvents = tributeOp > 0.2 ? 'auto' : 'none';
      finalTribute.style.zIndex = '100';
    }

    // -------------------------------------------------------------
    // 7. CẬP NHẬT HỆ THỐNG BỤI VŨ TRỤ
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