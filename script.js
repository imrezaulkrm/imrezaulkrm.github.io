const canvas = document.getElementById("cosmos");
const ctx = canvas.getContext("2d");
let stars = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      speed: Math.random() * 0.5 + 0.2,
    });
  }
}
createStars(200);

function animate() {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#78ff96";
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animate);
}
animate();







const navDots = document.querySelectorAll('.nav-dot');
const sections = [...navDots].map(dot => document.querySelector(dot.dataset.target));
let currentIndex = 0;

const upArrowBtn = document.querySelector('.nav-arrow:first-of-type');
const downArrowBtn = document.querySelector('.nav-arrow:last-of-type');

function activateNavDot(index) {
  navDots.forEach(dot => dot.classList.remove('active'));
  if (navDots[index]) navDots[index].classList.add('active');
}

function updateArrowVisibility() {
  if (upArrowBtn) {
    upArrowBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
  }
  if (downArrowBtn) {
    downArrowBtn.style.display = currentIndex === sections.length - 1 ? 'none' : 'flex';
  }
}

function scrollToSection(index) {
  if (index >= 0 && index < sections.length) {
    currentIndex = index;
    sections[index].scrollIntoView({ behavior: 'smooth' });
    activateNavDot(index);
    updateArrowVisibility();
  }
}

// Nav dots click
navDots.forEach((dot, index) => {
  dot.addEventListener('click', () => scrollToSection(index));
});

// Arrow buttons
if (upArrowBtn) {
  upArrowBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1);
    }
  });
}

if (downArrowBtn) {
  downArrowBtn.addEventListener('click', () => {
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1);
    }
  });
}

// On scroll update index & arrow
function onScroll() {
  const scrollMiddle = window.innerHeight / 2;
  let closestIndex = 0;
  let smallestDiff = Infinity;

  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    const diff = Math.abs(rect.top - scrollMiddle);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = i;
    }
  });

  currentIndex = closestIndex;
  activateNavDot(currentIndex);
  updateArrowVisibility();
}

window.addEventListener('scroll', onScroll);
onScroll(); // initialize
