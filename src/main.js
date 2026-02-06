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

// --- PARTICLE TEXT ASSEMBLY ENGINE ---
const textCanvas = document.getElementById('text-canvas');
const textCtx = textCanvas.getContext('2d', { willReadFrequently: true });

let textParticles = [];
const textMouse = { x: null, y: null, radius: 150 };

// [NEW] Global scroll state
let scrollState = { progress: 0 };

ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "1000px top", // Extended range for smoother dispersion
  onUpdate: (self) => {
    // Normalize progress 0-1
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
    // Droplets vary more in size and are generally smaller but visible
    this.size = Math.random() * 1.5 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    // Nano droplet look: varying opacity for depth/shimmer
    this.alpha = Math.random() * 0.5 + 0.3;
    this.color = `rgba(255, 255, 255, ${this.alpha})`;

    // Easing: Fluid movement (less friction, smoother ease)
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.94; // More slippery/fluid
    this.ease = 0.03; // But slower to settle (liquid drift)

    // Random angle for omnidirectional dispersion (0 to 2PI)
    this.angle = Math.random() * Math.PI * 2;
  }

  draw() {
    textCtx.fillStyle = this.color;
    textCtx.beginPath();
    textCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    textCtx.closePath();
    textCtx.fill();
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
    let scrollForce = scrollState.progress * 150; // Stronger force for explosion

    // Move particles outward based on their random angle
    let targetXAdjusted = this.targetX + (Math.cos(this.angle) * scrollForce * this.density);
    let targetYAdjusted = this.targetY + (Math.sin(this.angle) * scrollForce * this.density);

    if (distance < maxDistance) {
      // Fluid dispersion: move away but maybe with some swirl (complex, keep simple for now)
      this.x -= directionX * 4;
      this.y -= directionY * 4;
      // Become more transparent when agitated (mist)
      this.color = `rgba(200, 220, 255, ${this.alpha * 0.5})`;
    } else {
      // Re-condense independently

      // If we are scrolling, fade out slightly to look like mist spreading
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

  textCtx.fillStyle = 'white';
  const fontSize = Math.min(window.innerWidth / 10, 100);
  textCtx.font = `700 ${fontSize}px Inter`;
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';

  const centerX = textCanvas.width / 2;
  const centerY = textCanvas.height / 2;

  const textLines = ["Building", "Digital", "Excellence"];
  const lineHeight = fontSize * 1.2;
  const totalHeight = textLines.length * lineHeight;
  const startY = centerY - (totalHeight / 2) + (lineHeight / 2);

  textLines.forEach((line, index) => {
    textCtx.fillText(line, centerX, startY + (index * lineHeight));
  });

  const textCoordinates = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);

  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  // Density for "Droplets" - keep it moderately high but not solid
  const step = 3;
  for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
    for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
      if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
        // Add random jitter to initial position for more natural feel
        if (Math.random() > 0.5) {
          textParticles.push(new TextParticle(x, y));
        }
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

// Initialize Text Animation
window.addEventListener('resize', initTextParticles);
setTimeout(() => {
  initTextParticles();
  animateTextParticles();
}, 500);


// --- OTHER ANIMATIONS ---

gsap.fromTo('.hero-subtitle',
  { opacity: 0, x: -50 },
  { opacity: 1, x: 0, duration: 1, delay: 2.5, ease: "power2.out" } // Delayed for dust to settle
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

// Staggered List Items
gsap.utils.toArray('.experience-item, .skill-tag, .education-item').forEach(item => {
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


// 3D Tilt for Project Cards
VanillaTilt.init(document.querySelectorAll(".project-card"), {
  max: 15,
  speed: 400,
  glare: true,
  "max-glare": 0.2,
  scale: 1.05
});

// Cursor Follower
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

// Hide old background canvas if present
const bgCanvas = document.getElementById('bg-canvas');
if (bgCanvas) bgCanvas.style.display = 'none';
