/**
 * ===================================================================
 * PHOTOBOOTH DẢI 4 Ô — TRI ÂN CÔ DUYÊN ANH
 * Anti-AI Slop Implementation: Genuine WebRTC, 2x Canvas HD Engine,
 * Direct Touch/Pointer Sticker & Text Transformation, High-DPI Export.
 * ===================================================================
 */

(function () {
  'use strict';

  // -----------------------------------------------------------------
  // 1. DATA CATALOGS (WITH OFFLINE/FALLBACK EMBEDDING)
  // -----------------------------------------------------------------

  const SLOTS_16_9 = [
    { x: 56, y: 140, width: 448, height: 250 },
    { x: 56, y: 414, width: 448, height: 250 },
    { x: 56, y: 688, width: 448, height: 250 },
    { x: 56, y: 962, width: 448, height: 250 }
  ];

  const SLOTS_4_3 = [
    { x: 89, y: 120, width: 449, height: 338 },
    { x: 89, y: 482, width: 449, height: 338 },
    { x: 89, y: 844, width: 449, height: 338 },
    { x: 89, y: 1206, width: 449, height: 338 }
  ];

  const DEFAULT_FRAMES = [
    {
      id: 'pb_vintage_kraft',
      name: 'Vintage Kraft Linen',
      badge: '16:9 Hoài niệm',
      description: 'Tông màu be kraft ấm áp cổ điển với chân cam đất hoài niệm',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#EDE0CF',
      footerColor: '#D1842A',
      textColor: '#3d2410',
      overlay: 'assets/frames/photobooth/pb_vintage_kraft.png',
      thumb: 'assets/frames/photobooth/pb_vintage_kraft_thumb.png'
    },
    {
      id: 'pb_ocean_sky',
      name: 'Ocean Sky Blue',
      badge: '16:9 Tươi mát',
      description: 'Tông xanh da trời tươi mát điểm chân xanh đại dương sâu lắng',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#1B97CB',
      footerColor: '#058CC3',
      textColor: '#ffffff',
      overlay: 'assets/frames/photobooth/pb_ocean_sky.png',
      thumb: 'assets/frames/photobooth/pb_ocean_sky_thumb.png'
    },
    {
      id: 'pb_sage_mint',
      name: 'Sage Mint Green',
      badge: '16:9 Dịu nhẹ',
      description: 'Tông xanh xô thơm bạc hà dịu nhẹ với chân xanh lục bảo',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#C0F0E4',
      footerColor: '#319B73',
      textColor: '#164230',
      overlay: 'assets/frames/photobooth/pb_sage_mint.png',
      thumb: 'assets/frames/photobooth/pb_sage_mint_thumb.png'
    },
    {
      id: 'pb_pastel_ice',
      name: 'Pastel Ice Blue',
      badge: '16:9 Băng tuyết',
      description: 'Tông xanh băng tuyết pastel thanh lịch với chân xanh thẫm',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#C5F0FF',
      footerColor: '#036BA2',
      textColor: '#034164',
      overlay: 'assets/frames/photobooth/pb_pastel_ice.png',
      thumb: 'assets/frames/photobooth/pb_pastel_ice_thumb.png'
    },
    {
      id: 'pb_peach_apricot',
      name: 'Peach Warm Apricot',
      badge: '16:9 Ấm áp',
      description: 'Tông cam đào mơ chín ấm áp với chân ngà trang nhã',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#FBC994',
      footerColor: '#FFF6F3',
      textColor: '#4a2505',
      overlay: 'assets/frames/photobooth/pb_peach_apricot.png',
      thumb: 'assets/frames/photobooth/pb_peach_apricot_thumb.png'
    },
    {
      id: 'pb_dark_pine',
      name: 'Dark Pine Teal',
      badge: '16:9 Sang trọng',
      description: 'Tông xanh thông thẫm sang trọng với điểm nhấn vàng chanh',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#214045',
      footerColor: '#FEE833',
      textColor: '#ffffff',
      overlay: 'assets/frames/photobooth/pb_dark_pine.png',
      thumb: 'assets/frames/photobooth/pb_dark_pine_thumb.png'
    },
    {
      id: 'pb_vintage_wine',
      name: 'Vintage Wine Burgundy',
      badge: '16:9 Cổ điển',
      description: 'Tông đỏ vang nho nồng ấm hoài niệm với điểm nhấn vàng bơ',
      aspectRatio: '16:9',
      width: 560,
      height: 1320,
      slots: SLOTS_16_9,
      bgColor: '#742310',
      footerColor: '#FEF68B',
      textColor: '#ffffff',
      overlay: 'assets/frames/photobooth/pb_vintage_wine.png',
      thumb: 'assets/frames/photobooth/pb_vintage_wine_thumb.png'
    },
    {
      id: 'pb_studio_burgundy',
      name: 'Studio Burgundy Vintage',
      badge: '4:3 Phim Studio',
      description: 'Dải phim 4:3 phong cách Studio cổ điển chuẩn quốc tế tông đỏ burgundy quý phái',
      aspectRatio: '4:3',
      width: 627,
      height: 1875,
      slots: SLOTS_4_3,
      bgColor: '#460005',
      footerColor: '#300004',
      textColor: '#fdf2e9',
      overlay: 'assets/frames/photobooth/pb_studio_burgundy.png',
      thumb: 'assets/frames/photobooth/pb_studio_burgundy_thumb.png'
    }
  ];

  const DEFAULT_STICKERS = [
    { id: 'postmark_vintage', name: 'Dấu Bưu Điện Cổ', category: 'vintage', file: 'assets/stickers/postmark_vintage.svg', defaultWidth: 110, defaultHeight: 110 },
    { id: 'stamp_gratitude', name: 'Tem Thư Tri Ân', category: 'vintage', file: 'assets/stickers/stamp_gratitude.svg', defaultWidth: 100, defaultHeight: 118 },
    { id: 'botanical_branch', name: 'Nhành Hoa Vẽ Tay', category: 'botanical', file: 'assets/stickers/botanical_branch.svg', defaultWidth: 110, defaultHeight: 110 },
    { id: 'graduation_cap', name: 'Nón Cử Nhân', category: 'school', file: 'assets/stickers/graduation_cap.svg', defaultWidth: 110, defaultHeight: 99 },
    { id: 'washi_tape_blush', name: 'Băng Dán Hoa Hồng', category: 'washi', file: 'assets/stickers/washi_tape_blush.svg', defaultWidth: 140, defaultHeight: 43 },
    { id: 'washi_tape_vintage', name: 'Băng Dán Kraft Retro', category: 'washi', file: 'assets/stickers/washi_tape_vintage.svg', defaultWidth: 140, defaultHeight: 43 },
    { id: 'heart_delicate', name: 'Trái Tim Nét Mảnh', category: 'love', file: 'assets/stickers/heart_delicate.svg', defaultWidth: 90, defaultHeight: 90 },
    { id: 'calligraphy_trian', name: 'Chữ Tri Ân Thư Pháp', category: 'text', file: 'assets/stickers/calligraphy_trian.svg', defaultWidth: 130, defaultHeight: 54 },
    { id: 'calligraphy_kyniem', name: 'Chữ Kỷ Niệm Dấu Yêu', category: 'text', file: 'assets/stickers/calligraphy_kyniem.svg', defaultWidth: 130, defaultHeight: 54 },
    { id: 'badge_2011', name: 'Huy Hiệu 20/11', category: 'school', file: 'assets/stickers/badge_2011.svg', defaultWidth: 100, defaultHeight: 100 },
    { id: 'sparkle_minimal', name: 'Ánh Sao Lấp Lánh', category: 'decor', file: 'assets/stickers/sparkle_minimal.svg', defaultWidth: 80, defaultHeight: 80 },
    { id: 'film_roll_mini', name: 'Cuộn Phim 35mm', category: 'vintage', file: 'assets/stickers/film_roll_mini.svg', defaultWidth: 100, defaultHeight: 78 }
  ];

  // -----------------------------------------------------------------
  // 2. APPLICATION STATE
  // -----------------------------------------------------------------

  const state = {
    frames: DEFAULT_FRAMES,
    stickers: DEFAULT_STICKERS,
    currentFrameId: 'pb_vintage_kraft',
    currentFrame: DEFAULT_FRAMES[0],
    currentStep: 1,
    activeSlotIndex: 0,
    slots: [
      { image: null, rotation: 0 },
      { image: null, rotation: 0 },
      { image: null, rotation: 0 },
      { image: null, rotation: 0 }
    ],
    decorations: [], // Array of { id, type: 'sticker'|'text', ... }
    selectedItemId: null,
    zoom: 1.0,

    // Camera state
    cameraStream: null,
    cameraFacing: 'user', // 'user' or 'environment'
    cameraMirrored: true,
    countdownSeconds: 3,
    burstActive: false,

    // Text tool state
    selectedFont: 'Dancing Script',
    selectedColor: '#ffffff',
    selectedSize: 28,

    // Image caches
    overlayCache: new Map(),
    stickerImageCache: new Map()
  };

  // Pointer drag state
  const dragInteraction = {
    active: false,
    mode: null, // 'move', 'rotate', 'scale'
    targetId: null,
    startX: 0,
    startY: 0,
    itemStartX: 0,
    itemStartY: 0,
    itemStartRotation: 0,
    itemStartScale: 1.0,
    initialDist: 0,
    initialAngle: 0
  };

  // -----------------------------------------------------------------
  // 3. DOM ELEMENTS
  // -----------------------------------------------------------------

  let canvas, ctx;
  let videoEl;
  let toastEl, toastMessageEl;

  // -----------------------------------------------------------------
  // 4. INITIALIZATION
  // -----------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', async () => {
    canvas = document.getElementById('pb-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    videoEl = document.getElementById('camera-video');
    toastEl = document.getElementById('pb-toast');
    toastMessageEl = document.getElementById('toast-message');

    // Attempt to fetch frames & stickers from json
    await loadCatalogs();

    // Setup initial frame
    selectFrame(state.currentFrameId, false);

    // Initialize UI listeners
    setupNavigation();
    setupFrameSelection();
    setupCameraAndUpload();
    setupDecorations();
    setupCanvasInteractions();
    setupExportActions();
    setupZoomControls();

    // Initial render
    renderCanvas();
  });

  async function loadCatalogs() {
    try {
      const fRes = await fetch('assets/frames/photobooth/frames.json');
      if (fRes.ok) {
        state.frames = await fRes.json();
      }
    } catch (_) {
      // Use fallback
    }

    try {
      const sRes = await fetch('assets/stickers/stickers.json');
      if (sRes.ok) {
        state.stickers = await sRes.json();
      }
    } catch (_) {
      // Use fallback
    }
  }

  // -----------------------------------------------------------------
  // 5. SYNTHETIC SOUND & CAMERA EFFECTS
  // -----------------------------------------------------------------

  function playShutterSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();

      // Mirror-up impulse
      const osc1 = actx.createOscillator();
      const gain1 = actx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(650, actx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(70, actx.currentTime + 0.05);
      gain1.gain.setValueAtTime(0.7, actx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.05);
      osc1.connect(gain1);
      gain1.connect(actx.destination);
      osc1.start();
      osc1.stop(actx.currentTime + 0.06);

      // Shutter curtain release
      setTimeout(() => {
        try {
          const osc2 = actx.createOscillator();
          const gain2 = actx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(850, actx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(120, actx.currentTime + 0.06);
          gain2.gain.setValueAtTime(0.8, actx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.06);
          osc2.connect(gain2);
          gain2.connect(actx.destination);
          osc2.start();
          osc2.stop(actx.currentTime + 0.07);
        } catch (_) {}
      }, 60);
    } catch (_) {}
  }

  function flashCameraScreen() {
    const flashEl = document.getElementById('camera-flash');
    if (!flashEl) return;
    flashEl.classList.add('flash');
    setTimeout(() => {
      flashEl.classList.remove('flash');
    }, 150);
  }

  function showToast(message) {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // -----------------------------------------------------------------
  // 6. STEP NAVIGATION
  // -----------------------------------------------------------------

  function setupNavigation() {
    const tabs = document.querySelectorAll('.pb-step-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const stepNum = parseInt(tab.dataset.step, 10);
        goToStep(stepNum);
      });
    });

    // Step footer buttons
    document.getElementById('btn-to-step-2')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btn-step-2-back')?.addEventListener('click', () => goToStep(1));
    document.getElementById('btn-to-step-3')?.addEventListener('click', () => goToStep(3));
    document.getElementById('btn-step-3-back')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btn-to-step-4')?.addEventListener('click', () => goToStep(4));
    document.getElementById('btn-step-4-back')?.addEventListener('click', () => goToStep(3));
  }

  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 4) return;
    state.currentStep = stepNum;

    // Deselect active item when leaving step 3
    if (stepNum !== 3) {
      state.selectedItemId = null;
    }

    // Cancel active burst when leaving step 2
    if (stepNum !== 2) {
      state.burstActive = false;
    }

    // Update tab bar
    document.querySelectorAll('.pb-step-tab').forEach(tab => {
      const s = parseInt(tab.dataset.step, 10);
      const isActive = (s === stepNum);
      tab.classList.toggle('active', isActive);
      tab.classList.toggle('completed', s < stepNum);
      if (isActive) {
        tab.setAttribute('aria-current', 'step');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    // Update panels
    document.querySelectorAll('.pb-step-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`step-panel-${stepNum}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Step 2 camera handling
    if (stepNum === 2) {
      startCamera();
    } else {
      state.burstActive = false;
      stopCamera();
    }

    // Step 4 summary sync
    if (stepNum === 4) {
      updateStep4Summary();
    }

    renderCanvas();
  }

  // -----------------------------------------------------------------
  // 7. STEP 1: FRAME SELECTION
  // -----------------------------------------------------------------

  function setupFrameSelection() {
    renderFrameCards('all');

    // Filter pills
    const pills = document.querySelectorAll('.pb-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderFrameCards(pill.dataset.filter);
      });
    });
  }

  function renderFrameCards(filter) {
    const grid = document.getElementById('frames-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = state.frames.filter(frame => {
      if (filter === '16:9') return frame.aspectRatio === '16:9';
      if (filter === '4:3') return frame.aspectRatio === '4:3';
      return true;
    });

    filtered.forEach(frame => {
      const card = document.createElement('div');
      card.className = `pb-frame-card ${frame.id === state.currentFrameId ? 'selected' : ''}`;
      card.dataset.id = frame.id;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Chọn mẫu khung ${frame.name} (${frame.aspectRatio})`);

      card.innerHTML = `
        <div class="pb-frame-thumb-wrap">
          <img class="pb-frame-thumb-img" src="${frame.thumb}" alt="${frame.name}" loading="lazy">
        </div>
        <div class="pb-frame-info">
          <div class="pb-frame-title">${frame.name}</div>
          <div class="pb-frame-badges">
            <span class="pb-badge-ratio">${frame.aspectRatio}</span>
            <span class="pb-badge-style">${frame.badge}</span>
          </div>
          <p class="pb-frame-desc">${frame.description}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        selectFrame(frame.id, true);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectFrame(frame.id, true);
        }
      });

      grid.appendChild(card);
    });
  }

  function selectFrame(frameId, shouldRender = true) {
    const found = state.frames.find(f => f.id === frameId);
    if (!found) return;

    state.currentFrameId = frameId;
    state.currentFrame = found;

    // Update cards UI
    document.querySelectorAll('.pb-frame-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.id === frameId);
    });

    // Update meta dimension text
    const metaEl = document.getElementById('preview-frame-dim');
    if (metaEl) {
      metaEl.textContent = `${found.width} × ${found.height} px (${found.aspectRatio})`;
    }

    // Preload overlay image
    preloadOverlayImage(found);

    if (shouldRender) {
      renderCanvas();
      showToast(`Đã chọn mẫu: ${found.name}`);
    }
  }

  function preloadOverlayImage(frame) {
    if (state.overlayCache.has(frame.id)) return;
    const img = new Image();
    img.src = frame.overlay;
    img.onload = () => {
      state.overlayCache.set(frame.id, img);
      renderCanvas();
    };
  }

  // -----------------------------------------------------------------
  // 8. STEP 2: CAMERA WEBRTC & PHOTO INGESTION
  // -----------------------------------------------------------------

  function setupCameraAndUpload() {
    // Slot selector cards
    const slotCards = document.querySelectorAll('.pb-slot-card');
    slotCards.forEach(card => {
      card.addEventListener('click', () => {
        const slotIdx = parseInt(card.dataset.slot, 10);
        setActiveSlot(slotIdx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const slotIdx = parseInt(card.dataset.slot, 10);
          setActiveSlot(slotIdx);
        }
      });
    });

    // Camera facing toggle
    document.getElementById('btn-camera-toggle')?.addEventListener('click', () => {
      state.cameraFacing = state.cameraFacing === 'user' ? 'environment' : 'user';
      state.cameraMirrored = (state.cameraFacing === 'user');
      updateCameraMirrorState();
      const label = document.getElementById('label-camera-facing');
      if (label) {
        label.textContent = state.cameraFacing === 'user' ? 'Camera trước' : 'Camera sau';
      }
      startCamera();
    });

    // Mirror toggle
    document.getElementById('btn-mirror-toggle')?.addEventListener('click', () => {
      state.cameraMirrored = !state.cameraMirrored;
      updateCameraMirrorState();
    });

    // Countdown toggle pills
    const cdOpts = document.querySelectorAll('#countdown-toggle-group .pb-toggle-opt');
    cdOpts.forEach(btn => {
      btn.addEventListener('click', () => {
        cdOpts.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.countdownSeconds = parseInt(btn.dataset.seconds, 10);
      });
    });

    // Shutter single snap
    document.getElementById('btn-snap-single')?.addEventListener('click', () => {
      handleSingleSnapshot();
    });

    // Shutter burst 4-shot
    document.getElementById('btn-snap-burst')?.addEventListener('click', () => {
      handleBurstSnapshot();
    });

    // Single file upload
    const inputSingle = document.getElementById('input-file-single');
    document.getElementById('btn-upload-single')?.addEventListener('click', () => {
      inputSingle?.click();
    });
    inputSingle?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadPhotoFromFile(e.target.files[0], state.activeSlotIndex);
        e.target.value = '';
      }
    });

    // Batch file upload
    const inputBatch = document.getElementById('input-file-batch');
    document.getElementById('btn-upload-batch')?.addEventListener('click', () => {
      inputBatch?.click();
    });
    inputBatch?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files).slice(0, 4);
        files.forEach((file, idx) => {
          loadPhotoFromFile(file, idx);
        });
        e.target.value = '';
        showToast(`Đã nạp ${files.length} ảnh vào dải photobooth!`);
      }
    });

    // Rotate active slot
    document.getElementById('btn-rotate-slot')?.addEventListener('click', () => {
      const slot = state.slots[state.activeSlotIndex];
      if (slot.image) {
        slot.rotation = (slot.rotation + 90) % 360;
        updateSlotThumbnails();
        renderCanvas();
        showToast(`Đã xoay ảnh ô ${state.activeSlotIndex + 1} sang ${slot.rotation}°`);
      } else {
        showToast(`Ô ${state.activeSlotIndex + 1} chưa có ảnh để xoay!`);
      }
    });

    // Clear active slot
    document.getElementById('btn-clear-slot')?.addEventListener('click', () => {
      state.slots[state.activeSlotIndex].image = null;
      state.slots[state.activeSlotIndex].rotation = 0;
      updateSlotThumbnails();
      renderCanvas();
      showToast(`Đã xóa ảnh ở ô số ${state.activeSlotIndex + 1}`);
    });
  }

  function setActiveSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex > 3) return;
    state.activeSlotIndex = slotIndex;

    document.querySelectorAll('.pb-slot-card').forEach(card => {
      const s = parseInt(card.dataset.slot, 10);
      card.classList.toggle('active', s === slotIndex);
    });

    // Update button labels
    const snapLabel = document.getElementById('label-snap-single');
    if (snapLabel) snapLabel.textContent = `Chụp ảnh ô số ${slotIndex + 1}`;

    const uploadLabel = document.getElementById('label-upload-single');
    if (uploadLabel) uploadLabel.textContent = `Nạp ảnh ô ${slotIndex + 1}`;
  }

  function updateCameraMirrorState() {
    if (!videoEl) return;
    if (state.cameraMirrored) {
      videoEl.classList.remove('unmirrored');
    } else {
      videoEl.classList.add('unmirrored');
    }
  }

  async function startCamera() {
    const errorBanner = document.getElementById('camera-error-banner');
    if (errorBanner) errorBanner.classList.remove('show');

    try {
      if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC getUserMedia không được hỗ trợ');
      }

      const constraints = {
        video: {
          facingMode: state.cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      state.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoEl) {
        videoEl.srcObject = state.cameraStream;
        await videoEl.play();
      }
    } catch (err) {
      console.warn('Camera inaccessible:', err);
      if (errorBanner) errorBanner.classList.add('show');
    }
  }

  function stopCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(t => t.stop());
      state.cameraStream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  async function runCountdown(seconds, promptText = 'Tạo dáng chuẩn bị chụp nhé!') {
    const countdownEl = document.getElementById('camera-countdown');
    const promptEl = document.getElementById('camera-prompt');
    if (!countdownEl || !promptEl) return;

    const isBurst = state.burstActive;

    if (promptText) {
      promptEl.textContent = promptText;
      promptEl.classList.add('show');
    }

    if (seconds <= 0) {
      promptEl.classList.remove('show');
      return;
    }

    countdownEl.classList.add('show');
    for (let c = seconds; c > 0; c--) {
      if (state.currentStep !== 2 || (isBurst && !state.burstActive)) {
        countdownEl.classList.remove('show');
        promptEl.classList.remove('show');
        return;
      }
      countdownEl.textContent = c;
      countdownEl.style.transform = 'scale(1.2)';
      setTimeout(() => {
        countdownEl.style.transform = 'scale(1.0)';
      }, 100);
      await new Promise(r => setTimeout(r, 900));
      if (state.currentStep !== 2 || (isBurst && !state.burstActive)) {
        countdownEl.classList.remove('show');
        promptEl.classList.remove('show');
        return;
      }
    }
    countdownEl.classList.remove('show');
    promptEl.classList.remove('show');
  }

  async function handleSingleSnapshot() {
    if (!videoEl || !state.cameraStream) {
      showToast('Camera chưa sẵn sàng hoặc bị chặn.');
      return;
    }

    if (state.countdownSeconds > 0) {
      await runCountdown(state.countdownSeconds, `Chuẩn bị chụp ô ${state.activeSlotIndex + 1}...`);
      if (state.currentStep !== 2 || !state.cameraStream) {
        return;
      }
    }

    snapCurrentVideoToSlot(state.activeSlotIndex);
    playShutterSound();
    flashCameraScreen();
    showToast(`Đã chụp ảnh cho ô số ${state.activeSlotIndex + 1}!`);

    // Advance to next empty slot
    advanceToNextSlot();
  }

  async function handleBurstSnapshot() {
    if (!videoEl || !state.cameraStream) {
      showToast('Camera chưa sẵn sàng hoặc bị chặn.');
      return;
    }
    if (state.burstActive) return;
    state.burstActive = true;

    for (let slotIdx = 0; slotIdx < 4; slotIdx++) {
      if (!state.burstActive || state.currentStep !== 2 || !state.cameraStream) {
        state.burstActive = false;
        return;
      }
      setActiveSlot(slotIdx);
      await runCountdown(state.countdownSeconds || 3, `Chuẩn bị kiểu ${slotIdx + 1}/4...`);
      if (!state.burstActive || state.currentStep !== 2 || !state.cameraStream) {
        state.burstActive = false;
        return;
      }
      snapCurrentVideoToSlot(slotIdx);
      playShutterSound();
      flashCameraScreen();
      renderCanvas();

      if (slotIdx < 3) {
        await new Promise(r => setTimeout(r, 1000));
        if (!state.burstActive || state.currentStep !== 2 || !state.cameraStream) {
          state.burstActive = false;
          return;
        }
      }
    }

    if (!state.burstActive || state.currentStep !== 2) {
      state.burstActive = false;
      return;
    }

    state.burstActive = false;
    showToast('Hoàn tất chụp liên hoàn 4 kiểu! Chuyển sang bước Trang trí.');
    setTimeout(() => {
      if (state.currentStep === 2) {
        goToStep(3);
      }
    }, 800);
  }

  function snapCurrentVideoToSlot(slotIndex) {
    if (!videoEl || videoEl.videoWidth === 0) return;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = videoEl.videoWidth;
    snapCanvas.height = videoEl.videoHeight;
    const sctx = snapCanvas.getContext('2d');

    // Handle mirror
    if (state.cameraMirrored) {
      sctx.translate(snapCanvas.width, 0);
      sctx.scale(-1, 1);
    }
    sctx.drawImage(videoEl, 0, 0);

    const img = new Image();
    img.src = snapCanvas.toDataURL('image/jpeg', 0.95);
    img.onload = () => {
      state.slots[slotIndex].image = img;
      state.slots[slotIndex].rotation = 0;
      updateSlotThumbnails();
      renderCanvas();
    };
  }

  function loadPhotoFromFile(file, slotIndex) {
    if (!file || slotIndex < 0 || slotIndex > 3) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        state.slots[slotIndex].image = img;
        state.slots[slotIndex].rotation = 0;
        updateSlotThumbnails();
        renderCanvas();
        showToast(`Đã nạp ảnh vào ô số ${slotIndex + 1}`);
      };
    };
    reader.readAsDataURL(file);
  }

  function advanceToNextSlot() {
    for (let i = 0; i < 4; i++) {
      if (!state.slots[i].image) {
        setActiveSlot(i);
        return;
      }
    }
    // If all slots are full, keep activeSlotIndex as is
  }

  function updateSlotThumbnails() {
    for (let i = 0; i < 4; i++) {
      const thumbBox = document.getElementById(`slot-thumb-${i}`);
      const statusEl = document.getElementById(`slot-status-${i}`);
      const cardEl = document.querySelector(`.pb-slot-card[data-slot="${i}"]`);
      if (!thumbBox || !statusEl || !cardEl) continue;

      const slot = state.slots[i];
      if (slot.image) {
        cardEl.classList.add('has-image');
        thumbBox.innerHTML = `<img class="pb-slot-thumb-img" src="${slot.image.src}" style="transform: rotate(${slot.rotation}deg);" alt="Ảnh ô ${i+1}">`;
        statusEl.textContent = 'Đã có ảnh';
      } else {
        cardEl.classList.remove('has-image');
        thumbBox.innerHTML = `
          <svg class="pb-slot-empty-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        `;
        statusEl.textContent = 'Chưa có ảnh';
      }
    }
  }

  // -----------------------------------------------------------------
  // 9. STEP 3: DECORATIONS (STICKERS & TEXT)
  // -----------------------------------------------------------------

  function setupDecorations() {
    // Sub tabs
    const tabs = document.querySelectorAll('.pb-decor-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.pb-decor-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`decor-panel-${tabName}`)?.classList.add('active');
      });
    });

    // Sticker filters & tray
    renderStickersTray('all');
    const sFilters = document.querySelectorAll('[data-sticker-filter]');
    sFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        sFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderStickersTray(btn.dataset.stickerFilter);
      });
    });

    // Text Font selectors
    const fontBtns = document.querySelectorAll('.pb-font-btn');
    fontBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedFont = btn.dataset.font;
      });
    });

    // Text Color presets
    const colorDots = document.querySelectorAll('.pb-color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        state.selectedColor = dot.dataset.color;
      });
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          colorDots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          state.selectedColor = dot.dataset.color;
        }
      });
    });

    // Text Size slider
    const sizeSlider = document.getElementById('input-text-size');
    const sizeDisplay = document.getElementById('text-size-display');
    sizeSlider?.addEventListener('input', (e) => {
      state.selectedSize = parseInt(e.target.value, 10);
      if (sizeDisplay) sizeDisplay.textContent = `${state.selectedSize}px`;
    });

    // Add text item
    document.getElementById('btn-add-text-item')?.addEventListener('click', () => {
      const input = document.getElementById('input-custom-text');
      const textVal = input?.value.trim();
      if (!textVal) {
        showToast('Vui lòng nhập nội dung dòng chữ!');
        input?.focus();
        return;
      }
      addTextItem(textVal);
      input.value = '';
    });

    // Layers manager actions
    document.getElementById('btn-layer-up')?.addEventListener('click', () => moveSelectedLayer(1));
    document.getElementById('btn-layer-down')?.addEventListener('click', () => moveSelectedLayer(-1));
    document.getElementById('btn-clear-all-decor')?.addEventListener('click', () => {
      if (state.decorations.length === 0) return;
      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sticker và dòng chữ trên dải ảnh không?')) {
        state.decorations = [];
        state.selectedItemId = null;
        updateLayersList();
        renderCanvas();
        showToast('Đã xóa tất cả các lớp trang trí!');
      }
    });
  }

  function renderStickersTray(filter) {
    const grid = document.getElementById('stickers-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = state.stickers.filter(s => {
      if (!filter || filter === 'all') return true;
      return s.category === filter;
    });

    filtered.forEach(st => {
      const item = document.createElement('div');
      item.className = 'pb-sticker-item';
      item.dataset.id = st.id;
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Thêm sticker ${st.name}`);
      item.innerHTML = `
        <img class="pb-sticker-img" src="${st.file}" alt="${st.name}" loading="lazy">
        <span class="pb-sticker-name">${st.name}</span>
      `;
      item.addEventListener('click', () => {
        addStickerItem(st);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addStickerItem(st);
        }
      });
      grid.appendChild(item);
    });
  }

  function addStickerItem(stickerDef) {
    // Preload image
    const img = new Image();
    img.src = stickerDef.file;
    img.onload = () => {
      const frame = state.currentFrame;
      const newItem = {
        id: 'decor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'sticker',
        name: stickerDef.name,
        stickerId: stickerDef.id,
        img: img,
        x: frame.width / 2,
        y: frame.height / 2 + (Math.random() * 80 - 40),
        width: stickerDef.defaultWidth || 100,
        height: stickerDef.defaultHeight || 100,
        scale: 1.0,
        rotation: 0
      };

      state.decorations.push(newItem);
      state.selectedItemId = newItem.id;
      updateLayersList();
      renderCanvas();
      showToast(`Đã thêm sticker: ${stickerDef.name}`);
    };
  }

  function addTextItem(textContent) {
    const frame = state.currentFrame;
    const newItem = {
      id: 'decor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'text',
      name: `"${textContent.substring(0, 14)}..."`,
      text: textContent,
      font: state.selectedFont,
      size: state.selectedSize,
      color: state.selectedColor,
      x: frame.width / 2,
      y: frame.height / 2 + (Math.random() * 80 - 40),
      scale: 1.0,
      rotation: 0
    };

    state.decorations.push(newItem);
    state.selectedItemId = newItem.id;
    updateLayersList();
    renderCanvas();
    showToast('Đã thêm dòng chữ vào dải ảnh!');
  }

  function moveSelectedLayer(direction) {
    if (!state.selectedItemId) return;
    const idx = state.decorations.findIndex(d => d.id === state.selectedItemId);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= state.decorations.length) return;

    const item = state.decorations.splice(idx, 1)[0];
    state.decorations.splice(targetIdx, 0, item);
    updateLayersList();
    renderCanvas();
  }

  function deleteItem(itemId) {
    const idx = state.decorations.findIndex(d => d.id === itemId);
    if (idx !== -1) {
      state.decorations.splice(idx, 1);
      if (state.selectedItemId === itemId) {
        state.selectedItemId = null;
      }
      updateLayersList();
      renderCanvas();
      showToast('Đã xóa vật phẩm khỏi dải ảnh');
    }
  }

  function updateLayersList() {
    const countEl = document.getElementById('label-layers-count');
    if (countEl) {
      countEl.textContent = `Các lớp trang trí (${state.decorations.length})`;
    }

    const listEl = document.getElementById('layers-list');
    if (!listEl) return;

    if (state.decorations.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          Chưa có sticker hoặc văn bản nào được thêm. Hãy chọn thẻ "Sticker" hoặc "Thêm chữ" để bắt đầu trang trí!
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    // Display in reverse order (topmost layer on top of list)
    for (let i = state.decorations.length - 1; i >= 0; i--) {
      const item = state.decorations[i];
      const row = document.createElement('div');
      row.className = `pb-layer-item ${item.id === state.selectedItemId ? 'selected' : ''}`;
      row.innerHTML = `
        <div class="pb-layer-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${item.type === 'sticker' ? '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>' : '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>'}
          </svg>
          <span>${item.type === 'sticker' ? item.name : item.text}</span>
        </div>
        <div class="pb-layer-actions">
          <button type="button" class="pb-icon-btn btn-del-layer" title="Xóa lớp này" data-id="${item.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-del-layer')) return;
        state.selectedItemId = item.id;
        updateLayersList();
        renderCanvas();
      });

      row.querySelector('.btn-del-layer')?.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteItem(item.id);
      });

      listEl.appendChild(row);
    }
  }

  // -----------------------------------------------------------------
  // 10. POINTER / TOUCH GESTURES ON CANVAS
  // -----------------------------------------------------------------

  function setupCanvasInteractions() {
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
  }

  function getCanvasVirtualCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    // Convert CSS px to frame virtual coordinate space (1x scale)
    const frame = state.currentFrame;
    const virtX = (cssX / rect.width) * frame.width;
    const virtY = (cssY / rect.height) * frame.height;

    return { x: virtX, y: virtY };
  }

  function handlePointerDown(e) {
    const pt = getCanvasVirtualCoords(e);
    const frame = state.currentFrame;

    // Check if clicked on a handle of currently selected item
    if (state.selectedItemId) {
      const selected = state.decorations.find(d => d.id === state.selectedItemId);
      if (selected) {
        const bounds = getItemBounds(selected);

        // Delete button handle (top right corner)
        const delX = bounds.x + bounds.width / 2;
        const delY = bounds.y - bounds.height / 2;
        const rotDel = rotatePoint(delX, delY, selected.x, selected.y, selected.rotation);
        const distDel = Math.hypot(pt.x - rotDel.x, pt.y - rotDel.y);
        if (distDel <= 24) {
          deleteItem(selected.id);
          return;
        }

        // Rotate handle (top stick)
        const rotHandleX = bounds.x;
        const rotHandleY = bounds.y - bounds.height / 2 - 28;
        const rotHandle = rotatePoint(rotHandleX, rotHandleY, selected.x, selected.y, selected.rotation);
        const distRot = Math.hypot(pt.x - rotHandle.x, pt.y - rotHandle.y);
        if (distRot <= 20) {
          canvas.setPointerCapture(e.pointerId);
          dragInteraction.active = true;
          dragInteraction.mode = 'rotate';
          dragInteraction.targetId = selected.id;
          dragInteraction.startX = pt.x;
          dragInteraction.startY = pt.y;
          dragInteraction.itemStartRotation = selected.rotation;
          dragInteraction.initialAngle = Math.atan2(pt.y - selected.y, pt.x - selected.x);
          return;
        }

        // Scale handle (bottom right corner)
        const scHandleX = bounds.x + bounds.width / 2;
        const scHandleY = bounds.y + bounds.height / 2;
        const scHandle = rotatePoint(scHandleX, scHandleY, selected.x, selected.y, selected.rotation);
        const distSc = Math.hypot(pt.x - scHandle.x, pt.y - scHandle.y);
        if (distSc <= 20) {
          canvas.setPointerCapture(e.pointerId);
          dragInteraction.active = true;
          dragInteraction.mode = 'scale';
          dragInteraction.targetId = selected.id;
          dragInteraction.itemStartScale = selected.scale;
          dragInteraction.initialDist = Math.hypot(pt.x - selected.x, pt.y - selected.y);
          return;
        }
      }
    }

    // Hit test decorations from top to bottom
    let hitItem = null;
    for (let i = state.decorations.length - 1; i >= 0; i--) {
      const item = state.decorations[i];
      if (isPointInsideItem(pt.x, pt.y, item)) {
        hitItem = item;
        break;
      }
    }

    if (hitItem) {
      state.selectedItemId = hitItem.id;
      updateLayersList();
      renderCanvas();

      canvas.setPointerCapture(e.pointerId);
      dragInteraction.active = true;
      dragInteraction.mode = 'move';
      dragInteraction.targetId = hitItem.id;
      dragInteraction.startX = pt.x;
      dragInteraction.startY = pt.y;
      dragInteraction.itemStartX = hitItem.x;
      dragInteraction.itemStartY = hitItem.y;
    } else {
      // Clicked outside any item -> deselect
      if (state.selectedItemId) {
        state.selectedItemId = null;
        updateLayersList();
        renderCanvas();
      }
    }
  }

  function handlePointerMove(e) {
    if (!dragInteraction.active || !dragInteraction.targetId) return;
    const pt = getCanvasVirtualCoords(e);
    const item = state.decorations.find(d => d.id === dragInteraction.targetId);
    if (!item) return;

    if (dragInteraction.mode === 'move') {
      const dx = pt.x - dragInteraction.startX;
      const dy = pt.y - dragInteraction.startY;
      item.x = dragInteraction.itemStartX + dx;
      item.y = dragInteraction.itemStartY + dy;
      renderCanvas();
    } else if (dragInteraction.mode === 'rotate') {
      const currentAngle = Math.atan2(pt.y - item.y, pt.x - item.x);
      const angleDiff = currentAngle - dragInteraction.initialAngle;
      item.rotation = dragInteraction.itemStartRotation + angleDiff;
      renderCanvas();
    } else if (dragInteraction.mode === 'scale') {
      const currentDist = Math.hypot(pt.x - item.x, pt.y - item.y);
      if (dragInteraction.initialDist > 0) {
        const factor = currentDist / dragInteraction.initialDist;
        item.scale = Math.max(0.3, Math.min(3.5, dragInteraction.itemStartScale * factor));
        renderCanvas();
      }
    }
  }

  function handlePointerUp(e) {
    if (dragInteraction.active) {
      dragInteraction.active = false;
      dragInteraction.mode = null;
      dragInteraction.targetId = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }

  function getItemBounds(item) {
    let w, h;
    if (item.type === 'sticker') {
      w = item.width * item.scale;
      h = item.height * item.scale;
    } else {
      ctx.font = `${item.size * item.scale}px "${item.font}", sans-serif`;
      const metrics = ctx.measureText(item.text);
      w = Math.max(40, metrics.width + 16);
      h = Math.max(24, item.size * item.scale * 1.3);
    }
    return { x: item.x, y: item.y, width: w, height: h };
  }

  function isPointInsideItem(px, py, item) {
    // Un-rotate point around item center
    const unrot = rotatePoint(px, py, item.x, item.y, -item.rotation);
    const bounds = getItemBounds(item);

    const halfW = bounds.width / 2;
    const halfH = bounds.height / 2;

    return (
      unrot.x >= item.x - halfW &&
      unrot.x <= item.x + halfW &&
      unrot.y >= item.y - halfH &&
      unrot.y <= item.y + halfH
    );
  }

  function rotatePoint(px, py, cx, cy, angleRad) {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const nx = cos * (px - cx) - sin * (py - cy) + cx;
    const ny = sin * (px - cx) + cos * (py - cy) + cy;
    return { x: nx, y: ny };
  }

  // -----------------------------------------------------------------
  // 11. CANVAS RENDERING ENGINE (F12)
  // -----------------------------------------------------------------

  function renderCanvas(options = {}) {
    if (!canvas || !ctx) return;
    const frame = state.currentFrame;
    const isExport = !!options.isExport;
    const exportScale = options.exportScale || 2; // 2x DPI scale for razor-sharp HD

    const scale = isExport ? exportScale : 1.5; // display scale 1.5x for sharp preview

    canvas.width = frame.width * scale;
    canvas.height = frame.height * scale;

    // Apply zoom on CSS level
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.transformOrigin = 'center top';

    // 1. LAYER 1: BACKGROUND
    ctx.fillStyle = frame.bgColor || '#EDE0CF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. LAYER 2: 4 PHOTO SLOTS
    frame.slots.forEach((slotDef, slotIdx) => {
      const slotX = slotDef.x * scale;
      const slotY = slotDef.y * scale;
      const slotW = slotDef.width * scale;
      const slotH = slotDef.height * scale;

      ctx.save();
      ctx.beginPath();
      ctx.rect(slotX, slotY, slotW, slotH);
      ctx.clip();

      const slot = state.slots[slotIdx];
      if (slot && slot.image) {
        drawCroppedPhoto(ctx, slot.image, slotX, slotY, slotW, slotH, slot.rotation);
      } else {
        // Draw elegant placeholder
        ctx.fillStyle = frame.aspectRatio === '4:3' ? '#2d0407' : '#f5ede3';
        ctx.fillRect(slotX, slotY, slotW, slotH);

        // Placeholder text/icon
        ctx.fillStyle = frame.aspectRatio === '4:3' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
        ctx.font = `600 ${16 * scale}px "${frame.font || 'Be Vietnam Pro'}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Ô số ${slotIdx + 1}`, slotX + slotW / 2, slotY + slotH / 2);
      }

      ctx.restore();
    });

    // 3. LAYER 3: FRAME OVERLAY PNG (TRANSPARENT CUTOUTS)
    const overlayImg = state.overlayCache.get(frame.id);
    if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
      ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
    } else {
      // If overlay not cached yet, load it
      preloadOverlayImage(frame);
    }

    // 4. LAYER 4: TEXT & STICKERS
    state.decorations.forEach(item => {
      ctx.save();
      ctx.translate(item.x * scale, item.y * scale);
      ctx.rotate(item.rotation);

      if (item.type === 'sticker') {
        const sw = item.width * item.scale * scale;
        const sh = item.height * item.scale * scale;
        ctx.drawImage(item.img, -sw / 2, -sh / 2, sw, sh);
      } else if (item.type === 'text') {
        ctx.font = `${item.size * item.scale * scale}px "${item.font}", sans-serif`;
        ctx.fillStyle = item.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text, 0, 0);
      }

      ctx.restore();
    });

    // 5. LAYER 5: INTERACTIVE HANDLES (PREVIEW ONLY)
    if (!isExport && state.selectedItemId && state.currentStep === 3) {
      const selected = state.decorations.find(d => d.id === state.selectedItemId);
      if (selected) {
        drawSelectionHandles(ctx, selected, scale);
      }
    }
  }

  function drawCroppedPhoto(targetCtx, img, dx, dy, dw, dh, rotationDeg) {
    targetCtx.save();
    targetCtx.translate(dx + dw / 2, dy + dh / 2);
    if (rotationDeg) {
      targetCtx.rotate((rotationDeg * Math.PI) / 180);
    }

    // Determine target dimensions considering rotation
    const isRotated90 = (rotationDeg === 90 || rotationDeg === 270);
    const boxW = isRotated90 ? dh : dw;
    const boxH = isRotated90 ? dw : dh;

    // Aspect cover calculation
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const targetRatio = boxW / boxH;

    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) {
      // Image is wider than box -> crop sides
      sh = img.naturalHeight;
      sw = sh * targetRatio;
      sy = 0;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      // Image is taller than box -> crop top/bottom
      sw = img.naturalWidth;
      sh = sw / targetRatio;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }

    targetCtx.drawImage(img, sx, sy, sw, sh, -boxW / 2, -boxH / 2, boxW, boxH);
    targetCtx.restore();
  }

  function drawSelectionHandles(targetCtx, item, scale) {
    const bounds = getItemBounds(item);
    const halfW = (bounds.width / 2) * scale;
    const halfH = (bounds.height / 2) * scale;

    targetCtx.save();
    targetCtx.translate(item.x * scale, item.y * scale);
    targetCtx.rotate(item.rotation);

    // Bounding box
    targetCtx.strokeStyle = '#f59e0b';
    targetCtx.lineWidth = 1.8;
    targetCtx.setLineDash([6, 4]);
    targetCtx.strokeRect(-halfW, -halfH, halfW * 2, halfH * 2);
    targetCtx.setLineDash([]);

    // Rotate stick & handle at top
    targetCtx.beginPath();
    targetCtx.moveTo(0, -halfH);
    targetCtx.lineTo(0, -halfH - 24 * scale);
    targetCtx.strokeStyle = '#f59e0b';
    targetCtx.lineWidth = 1.5;
    targetCtx.stroke();

    targetCtx.beginPath();
    targetCtx.arc(0, -halfH - 24 * scale, 6 * scale, 0, Math.PI * 2);
    targetCtx.fillStyle = '#f59e0b';
    targetCtx.fill();
    targetCtx.strokeStyle = '#07090e';
    targetCtx.lineWidth = 1.5;
    targetCtx.stroke();

    // Scale handle at bottom right
    targetCtx.beginPath();
    targetCtx.arc(halfW, halfH, 6 * scale, 0, Math.PI * 2);
    targetCtx.fillStyle = '#f59e0b';
    targetCtx.fill();
    targetCtx.strokeStyle = '#07090e';
    targetCtx.lineWidth = 1.5;
    targetCtx.stroke();

    // Delete handle at top right
    targetCtx.beginPath();
    targetCtx.arc(halfW, -halfH, 8 * scale, 0, Math.PI * 2);
    targetCtx.fillStyle = '#ef4444';
    targetCtx.fill();
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.2;
    targetCtx.stroke();

    // X icon inside delete handle
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.5;
    targetCtx.beginPath();
    const dSize = 3.5 * scale;
    targetCtx.moveTo(halfW - dSize, -halfH - dSize);
    targetCtx.lineTo(halfW + dSize, -halfH + dSize);
    targetCtx.moveTo(halfW + dSize, -halfH - dSize);
    targetCtx.lineTo(halfW - dSize, -halfH + dSize);
    targetCtx.stroke();

    targetCtx.restore();
  }

  // -----------------------------------------------------------------
  // 12. ZOOM CONTROLS
  // -----------------------------------------------------------------

  function setupZoomControls() {
    const zoomDisplay = document.getElementById('zoom-level');
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomReset = document.getElementById('btn-zoom-reset');

    if (btnZoomIn && !btnZoomIn.getAttribute('aria-label')) {
      btnZoomIn.setAttribute('aria-label', 'Phóng to xem trước');
    }
    if (btnZoomOut && !btnZoomOut.getAttribute('aria-label')) {
      btnZoomOut.setAttribute('aria-label', 'Thu nhỏ xem trước');
    }
    if (btnZoomReset && !btnZoomReset.getAttribute('aria-label')) {
      btnZoomReset.setAttribute('aria-label', 'Xem vừa khít màn hình');
    }

    btnZoomIn?.addEventListener('click', () => {
      state.zoom = Math.min(2.0, state.zoom + 0.15);
      applyZoom(zoomDisplay);
    });

    btnZoomOut?.addEventListener('click', () => {
      state.zoom = Math.max(0.5, state.zoom - 0.15);
      applyZoom(zoomDisplay);
    });

    btnZoomReset?.addEventListener('click', () => {
      state.zoom = 1.0;
      applyZoom(zoomDisplay);
    });
  }

  function applyZoom(displayEl) {
    if (canvas) {
      canvas.style.transform = `scale(${state.zoom})`;
    }
    if (displayEl) {
      displayEl.textContent = `${Math.round(state.zoom * 100)}%`;
    }
  }

  // -----------------------------------------------------------------
  // 13. STEP 4: EXPORT ACTIONS (PNG, JPEG, CLIPBOARD, RESET)
  // -----------------------------------------------------------------

  function updateStep4Summary() {
    const frameNameEl = document.getElementById('summary-frame-name');
    const photosCountEl = document.getElementById('summary-photos-count');
    const decorCountEl = document.getElementById('summary-decor-count');

    if (frameNameEl) frameNameEl.textContent = state.currentFrame.name;

    const filledCount = state.slots.filter(s => s.image !== null).length;
    if (photosCountEl) photosCountEl.textContent = `${filledCount} / 4`;

    if (decorCountEl) decorCountEl.textContent = `${state.decorations.length}`;
  }

  function setupExportActions() {
    // Export PNG
    document.getElementById('btn-export-png')?.addEventListener('click', () => {
      exportImage('image/png', 'Ảnh Photobooth Kỷ Niệm Cô Duyên Anh.png');
    });

    // Export JPEG
    document.getElementById('btn-export-jpeg')?.addEventListener('click', () => {
      exportImage('image/jpeg', 'Ảnh Photobooth Kỷ Niệm Cô Duyên Anh.jpg', 0.92);
    });

    // Copy to Clipboard
    document.getElementById('btn-copy-clipboard')?.addEventListener('click', async () => {
      await copyImageToClipboard();
    });

    // Reset flow
    document.getElementById('btn-reset-booth')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn làm lại dải ảnh từ đầu không? Toàn bộ ảnh và trang trí sẽ được làm mới.')) {
        state.slots = [
          { image: null, rotation: 0 },
          { image: null, rotation: 0 },
          { image: null, rotation: 0 },
          { image: null, rotation: 0 }
        ];
        state.decorations = [];
        state.selectedItemId = null;
        updateSlotThumbnails();
        updateLayersList();
        goToStep(1);
        showToast('Đã làm mới photobooth!');
      }
    });
  }

  function generateExportBlob(mimeType = 'image/png', quality = 1.0) {
    return new Promise((resolve) => {
      const exportCanvas = document.createElement('canvas');
      const exportCtx = exportCanvas.getContext('2d');
      const frame = state.currentFrame;
      const exportScale = 2; // 2x DPI

      exportCanvas.width = frame.width * exportScale;
      exportCanvas.height = frame.height * exportScale;

      // 1. Layer 1: Background
      exportCtx.fillStyle = frame.bgColor || '#EDE0CF';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // 2. Layer 2: 4 Photo slots
      frame.slots.forEach((slotDef, slotIdx) => {
        const slotX = slotDef.x * exportScale;
        const slotY = slotDef.y * exportScale;
        const slotW = slotDef.width * exportScale;
        const slotH = slotDef.height * exportScale;

        exportCtx.save();
        exportCtx.beginPath();
        exportCtx.rect(slotX, slotY, slotW, slotH);
        exportCtx.clip();

        const slot = state.slots[slotIdx];
        if (slot && slot.image) {
          drawCroppedPhoto(exportCtx, slot.image, slotX, slotY, slotW, slotH, slot.rotation);
        } else {
          exportCtx.fillStyle = frame.aspectRatio === '4:3' ? '#2d0407' : '#f5ede3';
          exportCtx.fillRect(slotX, slotY, slotW, slotH);
        }

        exportCtx.restore();
      });

      // 3. Layer 3: Frame overlay PNG
      const overlayImg = state.overlayCache.get(frame.id);
      if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
        exportCtx.drawImage(overlayImg, 0, 0, exportCanvas.width, exportCanvas.height);
      }

      // 4. Layer 4: Text & Stickers (Clean, without handles)
      state.decorations.forEach(item => {
        exportCtx.save();
        exportCtx.translate(item.x * exportScale, item.y * exportScale);
        exportCtx.rotate(item.rotation);

        if (item.type === 'sticker') {
          const sw = item.width * item.scale * exportScale;
          const sh = item.height * item.scale * exportScale;
          exportCtx.drawImage(item.img, -sw / 2, -sh / 2, sw, sh);
        } else if (item.type === 'text') {
          exportCtx.font = `${item.size * item.scale * exportScale}px "${item.font}", sans-serif`;
          exportCtx.fillStyle = item.color;
          exportCtx.textAlign = 'center';
          exportCtx.textBaseline = 'middle';
          exportCtx.fillText(item.text, 0, 0);
        }

        exportCtx.restore();
      });

      exportCanvas.toBlob((blob) => {
        resolve(blob);
      }, mimeType, quality);
    });
  }

  async function exportImage(mimeType, filename, quality = 1.0) {
    showToast('Đang kết xuất dải ảnh độ nét cao...');
    const blob = await generateExportBlob(mimeType, quality);
    if (!blob) {
      showToast('Có lỗi xảy ra khi tạo tệp ảnh.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Đã tải về: ${filename}`);
  }

  async function copyImageToClipboard() {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('ClipboardItem API không được hỗ trợ trên trình duyệt này');
      }

      showToast('Đang sao chép ảnh vào bộ nhớ tạm...');
      const blob = await generateExportBlob('image/png', 1.0);
      if (!blob) throw new Error('Không thể tạo blob ảnh');

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      showToast('Đã sao chép ảnh vào Clipboard thành công!');
    } catch (err) {
      console.warn('Copy clipboard failed:', err);
      showToast('Trình duyệt không cho phép chép ảnh trực tiếp. Vui lòng bấm Tải ảnh PNG nhé!');
    }
  }

})();
