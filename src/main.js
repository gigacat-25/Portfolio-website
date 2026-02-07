import './style.css'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VanillaTilt from 'vanilla-tilt';

gsap.registerPlugin(ScrollTrigger);

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuToggle.textContent = navLinks.classList.contains('active') ? 'Close' : 'Menu';
});

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.textContent = 'Menu';
  });
});

// Sticky Navigation & Scroll Spy
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('section');
const navLinksArr = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  // Sticky Nav Style
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Scroll Spy (Active Link)
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
      current = section.getAttribute('id');
    }
  });

  navLinksArr.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
});

// --- PARTICLE TEXT ASSEMBLY ENGINE ---
const textCanvas = document.getElementById('text-canvas');
const textCtx = textCanvas.getContext('2d', { willReadFrequently: true });

let textParticles = [];
const textMouse = { x: null, y: null, radius: 150 };

// Global scroll state
let scrollState = { progress: 0 };

ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    scrollState.progress = self.progress;
  }
});

window.addEventListener('mousemove', (e) => {
  textMouse.x = e.clientX;
  textMouse.y = e.clientY;
});

class TextParticle {
  constructor(x, y) {
    this.x = Math.random() * textCanvas.width;
    this.y = Math.random() * textCanvas.height;
    this.targetX = x;
    this.targetY = y;
    // Droplets vary more in size
    this.size = Math.random() * 1.5 + 0.5; // Back to standard size to avoid blobs
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    // Nano droplet look: varying opacity
    this.alpha = Math.random() * 0.5 + 0.3;
    this.color = `rgba(255, 255, 255, ${this.alpha})`;

    // Easing: Fluid movement
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.94;
    this.ease = 0.03;

    // Random angle for omnidirectional dispersion (0 to 2PI)
    this.angle = Math.random() * Math.PI * 2;
  }

  draw() {
    // Optimization: avoid string template creation every frame if possible, 
    // or at least round values.
    // Optimization: Use rect for small particles (faster than arc)
    textCtx.fillStyle = this.color;
    if (this.size < 1) {
      textCtx.fillRect(this.x, this.y, this.size * 2, this.size * 2);
    } else {
      textCtx.beginPath();
      textCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      textCtx.fill();
    }
  }

  update() {
    let dx = textMouse.x - this.x;
    let dy = textMouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = textMouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    // Scroll Dispersion Force (Omnidirectional)
    let scrollForce = scrollState.progress * 150;

    // Calculate where this particle "wants" to be based on scroll dispersion
    let targetXAdjusted = this.targetX + (Math.cos(this.angle) * scrollForce * this.density);
    let targetYAdjusted = this.targetY + (Math.sin(this.angle) * scrollForce * this.density);

    if (distance < maxDistance) {
      // Fluid repulsion
      this.x -= directionX * 4;
      this.y -= directionY * 4;
      this.color = `rgba(200, 220, 255, ${this.alpha * 0.5})`;
    } else {
      // Re-condense 
      if (scrollState.progress > 0.05) {
        // Fade based on scroll
        let fade = Math.max(0, 1 - scrollState.progress * 1.5);
        this.color = `rgba(255, 255, 255, ${this.alpha * fade})`;
      } else {
        this.color = `rgba(255, 255, 255, ${this.alpha})`;
      }

      // Non-elastic movement (Lerp) to prevent bouncing
      this.x += (targetXAdjusted - this.x) * 0.08;
      this.y += (targetYAdjusted - this.y) * 0.08;
    }
  }
}

function initTextParticles() {
  textParticles = [];
  textCanvas.width = window.innerWidth;
  textCanvas.height = window.innerHeight;

  const container = document.querySelector('.invisible-text');
  if (!container) return;

  const spans = container.querySelectorAll('span');

  // Clear context
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  spans.forEach(span => {
    const rect = span.getBoundingClientRect();
    const style = window.getComputedStyle(span);

    // Match CSS font
    const fontSize = parseFloat(style.fontSize);
    const fontFamily = style.fontFamily;
    const fontWeight = style.fontWeight;

    textCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    textCtx.fillStyle = 'white';
    textCtx.textBaseline = 'top';
    textCtx.textAlign = 'left';  // CSS is usually left-aligned in the flex col

    // Draw text at the exact DOM position
    // Note: rect.x and rect.y are relative to viewport, which matches fixed canvas
    textCtx.fillText(span.innerText, rect.left, rect.top);
  });

  // Convert pixels to particles
  const data = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height); // Clear after sampling

  // Responsive density: "More particles"
  // Gap 2 was too dense (blobs). Gap 3 is a better balance for mobile readability.
  const gap = window.innerWidth < 768 ? 3 : 4;

  for (let y = 0; y < textCanvas.height; y += gap) {
    for (let x = 0; x < textCanvas.width; x += gap) {
      if (data[(y * 4 * textCanvas.width) + (x * 4) + 3] > 128) {
        textParticles.push(new TextParticle(x, y));
      }
    }
  }
}

function animateTextParticles() {
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  for (let i = 0; i < textParticles.length; i++) {
    textParticles[i].draw();
    textParticles[i].update();
  }
  requestAnimationFrame(animateTextParticles);
}

// --- BACKGROUND PARTICLE SYSTEM ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
// Ensure it's visible (Step 326 added it, Step 355 hid it)
if (bgCanvas) bgCanvas.style.display = 'block';

let bgParticles = [];
// Optimization: Reduced background particle count
const bgParticleCount = 50;

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

class BgParticle {
  constructor() {
    this.x = Math.random() * bgCanvas.width;
    this.y = Math.random() * bgCanvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.alpha = Math.random() * 0.4 + 0.1;
    this.baseAlpha = this.alpha;
    this.density = Math.random() * 20 + 1;
    this.friction = 0.96;
    this.vx = 0;
    this.vy = 0;
  }

  draw() {
    bgCtx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    bgCtx.closePath();
    bgCtx.fill();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Mouse Interaction
    let dx = textMouse.x - this.x;
    let dy = textMouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = 200;
    let force = (maxDistance - distance) / maxDistance;

    if (distance < maxDistance) {
      this.vx -= forceDirectionX * force * 0.5;
      this.vy -= forceDirectionY * force * 0.5;
      this.alpha = Math.min(1, this.baseAlpha + 0.5);
    }

    // Scroll Drift
    if (scrollState.progress > 0) {
      this.vy += scrollState.progress * 0.2;
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = bgCanvas.width;
    if (this.x > bgCanvas.width) this.x = 0;
    if (this.y < 0) this.y = bgCanvas.height;
    if (this.y > bgCanvas.height) this.y = 0;
  }
}

function initBgParticles() {
  bgParticles = [];
  resizeBgCanvas();
  for (let i = 0; i < bgParticleCount; i++) {
    bgParticles.push(new BgParticle());
  }
}

function animateBgParticles() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgParticles.forEach(p => {
    p.draw();
    p.update();
  });
  requestAnimationFrame(animateBgParticles);
}

// Init All
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (window.innerWidth >= 768) {
      initTextParticles();
      // Resize might need restart of animation if it was stopped, 
      // but simpler to just ensuring they run if they exist.
      // Ideally we check if they are running. 
      // For now, re-init is safe as it clears arrays.
      // We need to ensure we don't start multiple loops.
      // The simplest way for this script:
      resizeBgCanvas();
      initBgParticles();
    } else {
      // Mobile: Clear text canvas, but RE-INIT background particles
      const tc = document.getElementById('text-canvas');
      if (tc) {
        const ctx = tc.getContext('2d');
        ctx.clearRect(0, 0, tc.width, tc.height);
      }
      textParticles = [];

      // Re-init BG to handle address bar resize
      resizeBgCanvas();
      initBgParticles();
    }
  }, 200);
});

// Typewriter Effect for Mobile
function playMobileTypewriter() {
  console.log('Typing...');
  const container = document.querySelector('.invisible-text');
  // Check width again to be safe
  if (!container || window.innerWidth >= 768) return;

  const spans = container.querySelectorAll('span');
  if (spans.length === 0) return;

  // Store original text
  const texts = Array.from(spans).map(s => s.innerText);

  // Clear text initially
  spans.forEach(s => {
    s.innerText = '';
    s.classList.remove('typing-cursor');
    // Ensure visibility
    s.style.opacity = '1';
  });

  let spanIndex = 0;
  let charIndex = 0;

  function type() {
    if (spanIndex >= spans.length) return; // Done

    const currentSpan = spans[spanIndex];
    const currentText = texts[spanIndex];

    // Add cursor to current span
    currentSpan.classList.add('typing-cursor');

    if (charIndex < currentText.length) {
      currentSpan.innerText += currentText.charAt(charIndex);
      charIndex++;
      // Faster typing: 40ms base + random variation
      setTimeout(type, 40 + Math.random() * 30);
    } else {
      // Line finished
      currentSpan.classList.remove('typing-cursor'); // Remove cursor from finished line
      spanIndex++;
      charIndex = 0;
      setTimeout(type, 400); // Pause between lines
    }
  }

  // Start typing quickly
  setTimeout(type, 200);
}

// Init Typewriter on Load if Mobile
if (window.innerWidth < 768) {
  // Use a small timeout to ensure DOM is ready and prevented flash of full text
  setTimeout(playMobileTypewriter, 100);
}

// Helper to animate numbers
document.documentElement.classList.remove('no-js');

function animateCounter(element, target, duration = 2000) {
  let startTimestamp = null;
  const start = 0;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (target - start) + start);
    element.innerText = current + "+";
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.innerText = target + "+";
    }
  };
  window.requestAnimationFrame(step);
}

// GitHub Stats Fetcher
async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/users/gigacat-25');
    if (!response.ok) throw new Error('GitHub API Failed');
    const data = await response.json();
    // Use real data
    const repoCount = data.public_repos;

    const statEl = document.getElementById('github-stat');
    if (statEl) {
      // Update attribute for reference
      statEl.setAttribute('data-target', repoCount);
      // Animate from 0 to real number
      animateCounter(statEl, repoCount);
    }
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    // On error, we silently fail and keep the hardcoded default (15+)
  }
}

// GitHub Contributions Fetcher
async function fetchGitHubContributions() {
  try {
    const response = await fetch('https://github-contributions-api.jogruber.de/v4/gigacat-25');
    if (!response.ok) throw new Error('GitHub Contrib API Failed');
    const data = await response.json();

    let total = 0;
    if (data.total) {
      // Sum up contributions from all years
      total = Object.values(data.total).reduce((acc, curr) => acc + curr, 0);
    }

    const statEl = document.getElementById('github-contrib-stat');
    if (statEl) {
      // Update attribute
      statEl.setAttribute('data-target', total);
      // Animate from 0 to real number
      animateCounter(statEl, total);
    }
  } catch (error) {
    console.error('Error fetching GitHub contribs:', error);
  }
}

// Wait for fonts to be ready so text measurements are correct
document.fonts.ready.then(() => {
  // Text particles only on desktop
  if (window.innerWidth >= 768) {
    initTextParticles();
    animateTextParticles();
  }

  // Background particles everywhere
  initBgParticles();
  animateBgParticles();

  // Fetch GitHub Stats
  fetchGitHubStats();
  fetchGitHubContributions();
});


// --- OTHER ANIMATIONS ---

gsap.fromTo('.hero-subtitle',
  { opacity: 0, x: -50 },
  { opacity: 1, x: 0, duration: 1, delay: 2.5, ease: "power2.out" }
);

gsap.fromTo('.cta-button',
  { scale: 0, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.5, delay: 3, ease: "back.out(1.7)" }
);

// Scroll Trigger Animations (Sections)
document.querySelectorAll('.section-container').forEach(section => {
  gsap.fromTo(section,
    { autoAlpha: 0, y: 50 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none reverse"
      }
    }
  );
});

// About Section Zoom Effect (Container)
gsap.to("#about", {
  scale: 1.05,
  y: -40,
  ease: "none",
  scrollTrigger: {
    trigger: "#about",
    start: "top bottom",
    end: "center center",
    scrub: true
  }
});

// Bokeh/Blur Effect on Text Elements
gsap.to("#about h2, #about p", {
  backdropFilter: "blur(5px)", // Blurs the particles BEHIND the text
  backgroundColor: "rgba(0,0,0,0.3)", // Darken background slightly for contrast
  padding: "10px", // Breathing room
  borderRadius: "8px",
  ease: "none",
  scrollTrigger: {
    trigger: "#about",
    start: "top bottom",
    end: "center center",
    scrub: true
  }
});

// Staggered List Items (Experience, Education, Skills)
// Note: Skills included here (Simple Stagger)
// Staggered List Items (Experience, Education)
gsap.utils.toArray('.experience-item, .education-item').forEach(item => {
  gsap.fromTo(item,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
      }
    }
  );
});

// Skills Animation: Tech Blur/Snap Reveal
gsap.fromTo(".skill-tag",
  {
    autoAlpha: 0,
    scale: 0.8,
    filter: "blur(10px)",
    y: 20
  },
  {
    autoAlpha: 1,
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    stagger: 0.05,
    duration: 0.4,
    ease: "back.out(1.7)", // "Snap" effect
    scrollTrigger: {
      trigger: ".skills-grid",
      start: "top 85%",
      end: "bottom 20%",
      toggleActions: "play reverse play reverse" // Disappear on leave, Reappear on return
    }
  }
);


// 3D Tilt
VanillaTilt.init(document.querySelectorAll(".project-card"), {
  max: 15,
  speed: 400,
  glare: true,
  "max-glare": 0.2,
  scale: 1.05
});

// Cursor
const cursor = document.getElementById('cursor-follower');

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// Stats Counter Animation
gsap.utils.toArray('.stat-number').forEach(stat => {
  const target = parseFloat(stat.getAttribute('data-target'));
  const isFloat = stat.getAttribute('data-target').includes('.');
  const suffix = stat.getAttribute('data-suffix') || "+";

  // Create an object to tween
  const counter = { val: 0 };

  gsap.to(counter, {
    val: target,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#stats",
      start: "top 80%",
    },
    onUpdate: () => {
      // Update text with formatted number
      if (isFloat) {
        stat.innerText = counter.val.toFixed(1) + suffix;
      } else {
        stat.innerText = Math.round(counter.val) + suffix;
      }
    }
  });
});


