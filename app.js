/* ═══════════════════════════════════════════════════
   HOTELLINIA — JAVASCRIPT INTERACTIONS
   ═══════════════════════════════════════════════════ */

'use strict';

// ─── FULL-SCREEN ONBOARDING PRE-LOADER ───────────────
(function initHotelliniaPreloader() {
  const preloader = document.getElementById('hotelliniaPreloader');
  if (!preloader) {
    document.body.classList.remove('preloader-locked');
    return;
  }

  const alreadySeen = sessionStorage.getItem('hotellinia_preloader_seen');

  // Skip entirely if already seen in current session
  if (alreadySeen === 'true') {
    preloader.classList.add('is-hidden');
    document.body.classList.remove('preloader-locked');
    return;
  }

  // Lock scrolling while preloader sequence plays (with short timeout)
  document.body.classList.add('preloader-locked');

  let isDismissed = false;

  const dismissPreloader = () => {
    if (isDismissed) return;
    isDismissed = true;
    document.body.classList.remove('preloader-locked');
    preloader.classList.add('is-exiting');

    setTimeout(() => {
      preloader.classList.add('is-hidden');
      try {
        sessionStorage.setItem('hotellinia_preloader_seen', 'true');
      } catch (e) {}
    }, 350);
  };

  // Ultra-snappy sequence: 0.9s on mobile, 1.4s on desktop
  const isMobile = window.innerWidth <= 768;
  const timer = setTimeout(dismissPreloader, isMobile ? 900 : 1400);

  // Unconditional fail-safe unlock so scrolling is NEVER locked
  setTimeout(() => {
    document.body.classList.remove('preloader-locked');
  }, isMobile ? 1100 : 1600);

  // Skip button handler
  const skipBtn = document.getElementById('preloaderSkip');
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      dismissPreloader();
    });
  }

  // Fast-exit on screen click or touch
  preloader.addEventListener('click', () => {
    clearTimeout(timer);
    dismissPreloader();
  });
  preloader.addEventListener('touchstart', () => {
    clearTimeout(timer);
    dismissPreloader();
  }, { passive: true });

  // Fast-exit on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !isDismissed) {
      clearTimeout(timer);
      dismissPreloader();
    }
  });
})();

// ─── CURSOR GLOW (Hardware Accelerated & Desktop Only) ─
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let glowTicking = false;
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!glowTicking) {
      requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        glowTicking = false;
      });
      glowTicking = true;
    }
  }, { passive: true });
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

// ─── NAVBAR SCROLL (Throttled with rAF) ───────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}


// ─── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu) mobileMenu.classList.remove('is-open');
    }
  });
});

// ─── SCROLL REVEAL OBSERVER ─────────────────────────
(function initScrollReveal() {
  const isMobile = window.innerWidth <= 768;
  const revealElements = document.querySelectorAll(
    '.bento-card, .wf-node, .stat-item, .integrations-bar, .section-header, .hotel-partner-card'
  );

  if (!isMobile && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '100px 0px 100px 0px' });

    revealElements.forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });

    // Safety fallback: ensure nothing stays hidden after 1.2s
    setTimeout(() => {
      revealElements.forEach(el => el.classList.add('visible'));
    }, 1200);
  } else {
    // On mobile: immediately reveal everything so sections NEVER disappear
    revealElements.forEach(el => {
      el.classList.add('visible');
    });
  }
})();

// ─── HERO IMAGE FALLBACK ────────────────────────────
const heroImg = document.getElementById('hero-dashboard-img');
if (heroImg) {
  // Try to load the generated image
  heroImg.src = 'hero_dashboard.jpg';
  heroImg.onerror = () => {
    // Fallback: render a canvas-based dashboard mockup
    renderHeroCanvas(heroImg);
  };
}

function renderHeroCanvas(imgEl) {
  const canvas = document.createElement('canvas');
  canvas.width  = 900;
  canvas.height = 560;
  canvas.style.cssText = imgEl.style.cssText;
  canvas.className = imgEl.className;
  imgEl.parentNode.replaceChild(canvas, imgEl);

  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 900, 560);
  bgGrad.addColorStop(0, '#050D1F');
  bgGrad.addColorStop(1, '#080D1A');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, 900, 560, 24);
  ctx.fill();

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 900; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 560); ctx.stroke(); }
  for (let y = 0; y < 560; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke(); }

  // Top navigation bar
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  roundRect(ctx, 20, 20, 860, 44, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.arc(44, 42, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,200,150,0.9)';
  ctx.beginPath(); ctx.arc(62, 42, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,191,255,0.9)';
  ctx.beginPath(); ctx.arc(80, 42, 6, 0, Math.PI * 2); ctx.fill();

  // Sidebar
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  roundRect(ctx, 20, 74, 140, 466, 10);
  ctx.fill();
  drawSidebarItems(ctx);

  // Main content area — Room Rack
  drawRoomRack(ctx);

  // Metric cards
  drawMetricCard(ctx, 600, 90,  160, 80, 'Gəlir', '$18,450', '↑ 28%', '#00C896');
  drawMetricCard(ctx, 770, 90,  110, 80, 'Doluluq', '87%',   '↑ 12%', '#00BFFF');
  drawMetricCard(ctx, 600, 186, 280, 80, 'RevPAR', '$142',   '↑ 19%', '#8B5CF6');

  // Channel manager mini widget
  drawChannelWidget(ctx, 600, 280, 280, 240);

  // Animate canvas slightly
  animateCanvas(canvas, ctx);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSidebarItems(ctx) {
  const items = ['⌂', '📅', '🛏', '💰', '📊', '⚙'];
  items.forEach((icon, i) => {
    const y = 100 + i * 58;
    if (i === 0) {
      ctx.fillStyle = 'rgba(0,200,150,0.12)';
      roundRect(ctx, 28, y - 14, 124, 36, 8);
      ctx.fill();
    }
    ctx.fillStyle = i === 0 ? '#00C896' : 'rgba(255,255,255,0.25)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(icon, 90, y + 8);
  });
}

function drawRoomRack(ctx) {
  const colors = ['#00C896','#00C896','#EF4444','#00C896','#FFC800','#00BFFF','#00C896','#EF4444'];
  const rooms  = ['101','102','103','104','105','106','107','108'];
  const x0 = 175, y0 = 80, cellW = 48, cellH = 36, cols = 9;

  // Header row - dates
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, x0, y0, cols * cellW + cellW, cellH, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '10px Inter, Arial';
  ctx.textAlign = 'center';
  for (let d = 0; d < cols; d++) {
    ctx.fillText(`${18 + d}`, x0 + cellW + d * cellW + cellW / 2, y0 + cellH / 2 + 4);
  }

  rooms.forEach((room, ri) => {
    const y = y0 + (ri + 1) * cellH;
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    roundRect(ctx, x0, y, cellW, cellH, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(room, x0 + cellW / 2, y + cellH / 2 + 4);

    for (let c = 0; c < cols; c++) {
      const cx = x0 + cellW + c * cellW;
      const occupied = Math.random() > 0.38;
      if (occupied) {
        const span = Math.min(Math.floor(Math.random() * 3) + 1, cols - c);
        ctx.fillStyle = colors[ri] + '33';
        roundRect(ctx, cx + 2, y + 4, cellW * span - 4, cellH - 8, 4);
        ctx.fill();
        ctx.strokeStyle = colors[ri] + '88';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });
}

function drawMetricCard(ctx, x, y, w, h, label, value, change, color) {
  ctx.fillStyle = 'rgba(10,16,32,0.85)';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = color + '22';
  roundRect(ctx, x + 12, y + 12, 28, 28, 8);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = 'bold 15px Inter, Arial';
  ctx.textAlign = 'left';
  ctx.fillText('●', x + 20, y + 31);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '10px Inter, Arial';
  ctx.fillText(label, x + 48, y + 26);

  ctx.fillStyle = '#F0F4FF';
  ctx.font = 'bold 20px Inter, Arial';
  ctx.fillText(value, x + 12, y + 58);

  ctx.fillStyle = color;
  ctx.font = 'bold 11px Inter, Arial';
  ctx.textAlign = 'right';
  ctx.fillText(change, x + w - 12, y + 26);
}

function drawChannelWidget(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(10,16,32,0.85)';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = 'bold 11px Inter, Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Kanal Sinxronizasiyası', x + 16, y + 28);

  const channels = [
    { name: 'Booking.com', pct: 0.78, color: '#003580' },
    { name: 'Expedia',     pct: 0.55, color: '#FFD700' },
    { name: 'Airbnb',      pct: 0.62, color: '#FF5A5F' },
    { name: 'Agoda',       pct: 0.44, color: '#00C896' },
  ];

  channels.forEach((ch, i) => {
    const ry = y + 50 + i * 46;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText(ch.name, x + 16, ry + 12);

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, x + 16, ry + 18, w - 32, 8, 4);
    ctx.fill();

    ctx.fillStyle = ch.color;
    roundRect(ctx, x + 16, ry + 18, (w - 32) * ch.pct, 8, 4);
    ctx.fill();
  });
}

function animateCanvas(canvas, ctx) {
  // Static elegant box shadow - avoids continuous style recalculation
  canvas.style.boxShadow = '0 0 32px rgba(0,102,255,0.15)';
}

// ─── BENTO CARDS — HOVER PARALLAX (Desktop fine pointer only) ──
if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      card.style.perspective = '800px';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.perspective = '';
    });
  });
}

// ─── CTA FORM SUBMISSION ────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const emailInput  = document.getElementById('ctaEmail');
  const form        = document.getElementById('ctaForm');
  const successMsg  = document.getElementById('ctaSuccess');

  if (!emailInput.value || !emailInput.validity.valid) {
    emailInput.style.borderColor = 'rgba(239,68,68,0.5)';
    emailInput.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.1)';
    setTimeout(() => {
      emailInput.style.borderColor = '';
      emailInput.style.boxShadow   = '';
    }, 2500);
    return;
  }

  form.style.display = 'none';
  successMsg.style.display = 'flex';

  // Confetti-like particles
  spawnSuccessParticles();
}

function spawnSuccessParticles() {
  const colors = ['#00C896', '#00BFFF', '#8B5CF6', '#FF8A00'];
  const cta = document.getElementById('cta');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      border-radius: 50%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${30 + Math.random() * 40}%;
      top: 50%;
      pointer-events: none;
      z-index: 10;
      animation: particleFly ${0.6 + Math.random() * 0.8}s ease-out forwards;
      transform: translate(${(Math.random() - 0.5) * 200}px, ${-(50 + Math.random() * 100)}px);
      opacity: 0;
    `;
    cta.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// Inject particle animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes particleFly {
    0%   { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(
        ${(Math.random() - 0.5) * 200}px,
        ${-(60 + Math.random() * 120)}px
      ) scale(0.3); }
  }
  .nav-links.mobile-open {
    display: flex !important;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(5, 8, 16, 0.96);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 0 0 16px 16px;
    padding: 16px;
    gap: 4px;
    z-index: 99;
  }
  .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-hamburger.open span:nth-child(2) { opacity: 0; }
  .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
`;
document.head.appendChild(styleSheet);



// ─── COUNTING NUMBER ANIMATION ──────────────────────
function animateCount(el, target, suffix, duration = 1800) {
  const isDecimal = target.toString().includes('.');
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isDecimal
      ? (eased * target).toFixed(1)
      : Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = [
        { el: entry.target.querySelectorAll('.stat-num')[0], val: 500, suffix: '+' },
        { el: entry.target.querySelectorAll('.stat-num')[1], val: 98, suffix: '%' },
        { el: entry.target.querySelectorAll('.stat-num')[2], val: 40, suffix: '%' },
      ];
      nums.forEach(({ el, val, suffix }) => {
        if (el) {
          const plusEl = el.querySelector('.stat-plus');
          const suffixChar = plusEl ? plusEl.textContent : suffix;
          animateCount(el, val, suffixChar);
          if (plusEl) el.appendChild(plusEl);
        }
      });
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsRow = document.querySelector('.hero-stats');
if (statsRow) statObserver.observe(statsRow);

// ─── MARQUEE PAUSE ON HOVER ──────────────────────────
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeTrack) {
  marqueeTrack.parentElement.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.parentElement.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

console.log('%cHotellinia', 'color:#00C896;font-size:24px;font-weight:bold;');
console.log('%cNext-gen Hotel Management System', 'color:#8B9BBE;font-size:14px;');

// ─── BENTO COUNTER (otaq sayı) ───────────────────────
const counterRooms = document.getElementById('counter-rooms');
if (counterRooms) {
  const bentoCo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(counterRooms, 500, '');
        bentoCo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bentoCo.observe(counterRooms);
}

// ─── BENTO POS & WORKFLOW ANIMATIONS (Intersection Observed) ──
let posInterval = null;
let wfInterval = null;
let currentWfStep = 0;

function setWorkflowStep(stepIndex) {
  const nodes = document.querySelectorAll('.workflow-diagram .wf-node');
  const arrow1 = document.getElementById('wf-a1');
  const arrow2 = document.getElementById('wf-a2');
  const trackerText = document.getElementById('wfTrackerText');
  if (!nodes.length) return;

  currentWfStep = stepIndex % nodes.length;

  nodes.forEach((node, i) => {
    node.classList.remove('active', 'completed');
    if (i === currentWfStep) {
      node.classList.add('active');
    } else if (i < currentWfStep) {
      node.classList.add('completed');
    }
  });

  // Arrows state
  if (arrow1) arrow1.classList.toggle('active', currentWfStep === 1);
  if (arrow2) arrow2.classList.toggle('active', currentWfStep === 3);

  // Update status text
  if (trackerText) {
    const activeKey = `bento.wf_status_${currentWfStep + 1}`;
    trackerText.setAttribute('data-i18n', activeKey);
    const currentLang = localStorage.getItem('hotellinia_lang') || 'az';
    if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][activeKey]) {
      trackerText.textContent = translations[currentLang][activeKey];
    }
  }
}

function startBentoTimers() {
  // POS Order rotation
  const items = document.querySelectorAll('.pos-order-item');
  if (items.length && !posInterval) {
    let pIdx = 0;
    posInterval = setInterval(() => {
      items.forEach(i => i.classList.remove('pos-new'));
      items[pIdx % items.length].classList.add('pos-new');
      pIdx++;
    }, 3000);
  }

  // Interactive automated workflow progression
  const wfDiagram = document.getElementById('workflowDiagram');
  if (wfDiagram && !wfInterval) {
    if (!wfDiagram.dataset.bound) {
      wfDiagram.querySelectorAll('.wf-node').forEach((node, idx) => {
        node.addEventListener('click', () => {
          setWorkflowStep(idx);
        });
        node.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setWorkflowStep(idx);
          }
        });
      });
      wfDiagram.dataset.bound = 'true';
    }

    setWorkflowStep(currentWfStep);
    wfInterval = setInterval(() => {
      setWorkflowStep(currentWfStep + 1);
    }, 2400);
  }
}

function stopBentoTimers() {
  if (posInterval) { clearInterval(posInterval); posInterval = null; }
  if (wfInterval)  { clearInterval(wfInterval);  wfInterval = null; }
}

const featuresSec = document.getElementById('features');
if (featuresSec && 'IntersectionObserver' in window) {
  const featObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startBentoTimers();
      } else {
        stopBentoTimers();
      }
    });
  }, { threshold: 0.05 });
  featObs.observe(featuresSec);
} else {
  startBentoTimers();
}





// ─── MOBILE MENU ─────────────────────────────────────
;(function () {
  var hamburger = document.getElementById('hamburgerBtn');
  var menu      = document.getElementById('mobileMenu');
  var closeBtn  = document.getElementById('mobCloseBtn');
  if (!hamburger || !menu) return;

  function openMenu() {
    // Force display:flex then add is-open class
    menu.classList.add('is-open');
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  menu.querySelectorAll('.mob-link, .mob-actions .btn').forEach(function(el) {
    el.addEventListener('click', function() {
      setTimeout(closeMenu, 50);
    });
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) closeMenu();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

// ─── BILINGUAL TRANSLATION ENGINE & COOL DROPDOWN (AZ / RU) ─────────
let currentLang = 'az';
try {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam === 'ru' || langParam === 'az') {
    currentLang = langParam;
  } else {
    currentLang = localStorage.getItem('hotellinia_lang') || 'az';
  }
} catch (e) {
  currentLang = 'az';
}

function applyLanguage(lang) {
  if (typeof HOTELLINIA_TRANSLATIONS === 'undefined') {
    return;
  }
  const dict = HOTELLINIA_TRANSLATIONS[lang];
  if (!dict) return;

  currentLang = lang;
  try {
    localStorage.setItem('hotellinia_lang', lang);
  } catch (e) {}
  document.documentElement.lang = lang;

  // 1. Update text / innerHTML across all pages
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // 2. Update input placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // 3. Update Dynamic SEO Meta Title and Descriptions
  if (dict["meta.title"]) {
    document.title = dict["meta.title"];
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict["meta.description"]) {
    metaDesc.setAttribute('content', dict["meta.description"]);
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && dict["meta.og_title"]) {
    ogTitle.setAttribute('content', dict["meta.og_title"]);
  }
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && dict["meta.og_desc"]) {
    ogDesc.setAttribute('content', dict["meta.og_desc"]);
  }
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', lang === 'ru' ? 'ru_RU' : 'az_AZ');
  }

  // 4. Update image & icon alt attributes for accessibility & SEO
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    if (dict[key] !== undefined) {
      el.setAttribute('alt', dict[key]);
    }
  });

  // 5. Update Dropdown trigger flag & code
  const flagEl = document.getElementById('langActiveFlag');
  const codeEl = document.getElementById('langActiveCode');
  if (flagEl) flagEl.textContent = lang === 'ru' ? '🇷🇺' : '🇦🇿';
  if (codeEl) codeEl.textContent = lang === 'ru' ? 'RU' : 'AZ';

  // 6. Update dropdown menu items active state
  document.querySelectorAll('.lang-dropdown-item').forEach((item) => {
    const itemLang = item.getAttribute('data-lang');
    if (itemLang === lang) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 7. Update mobile language switcher buttons
  document.querySelectorAll('.mob-lang-btn').forEach((btn) => {
    const btnLang = btn.getAttribute('data-lang');
    if (btnLang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function initLanguage() {
  applyLanguage(currentLang);

  // Setup dropdown toggle & outside click
  const dropdown = document.getElementById('langDropdown');
  const dropdownBtn = document.getElementById('langDropdownBtn');

  if (dropdown && dropdownBtn) {
    dropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('is-open');
      dropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownBtn.focus();
      }
    });
  }

  // Handle click on dropdown options
  document.querySelectorAll('.lang-dropdown-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = item.getAttribute('data-lang');
      if (targetLang) {
        applyLanguage(targetLang);
      }
      if (dropdown && dropdownBtn) {
        dropdown.classList.remove('is-open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Handle click on mobile buttons
  document.querySelectorAll('.mob-lang-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        applyLanguage(targetLang);
      }
    });
  });
}

// Execute immediately and on DOM readiness
if (typeof HOTELLINIA_TRANSLATIONS !== 'undefined') {
  applyLanguage(currentLang);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguage);
} else {
  initLanguage();
}


