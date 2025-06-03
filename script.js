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


//skill section circle progress
document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll("#skills .progress-circle");
  circles.forEach(circle => {
    const percent = circle.dataset.percent;
    const progress = circle.querySelector(".progress");
    const offset = 175 - (175 * percent) / 100;
    progress.style.strokeDashoffset = offset;
  });

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800 });
  }
});



// prject section
const projects = [
  {
    name: 'Studentify',
    images: [
      "https://github.com/imrezaulkrm/bartadhara-devops/blob/main/image/bartadhara-admin.png?raw=true",
      "https://github.com/imrezaulkrm/bartadhara-devops/blob/main/image/bartadhara-singlepage.png?raw=true",
      "https://github.com/imrezaulkrm/bartadhara-devops/blob/main/image/bartadhara-diagram.png?raw=true"
    ],
    title: 'Student Information Management System (Studentify)',
    description: 'Studentify harnesses Angular 16, Spring Boot, and MySQL for robust CRUD functionalities in student data management. Microservices architecture with CI/CD pipelines.',
    tech: 'Angular 16, Spring Boot, MySQL, Jenkins, Docker, Kubernetes, ArgoCD',
    git: 'https://github.com/imrezaulkrm/Studentify.git'
  },
  {
    name: 'MediHelp',
    images: [
      'https://picsum.photos/id/1019/600/350',
      'https://picsum.photos/id/1020/600/350'
    ],
    title: 'MediHelp - Your Online Pharmacy',
    description: 'Trusted online pharmacy for quality healthcare. Features Docker-based deployment and Jenkins automation for CI/CD.',
    tech: 'Docker, Jenkins, GitHub, Node.js, Express',
    git: 'https://github.com/imrezaulkrm/MediHelp.git'
  },
  {
    name: 'Portfolio',
    images: [
      'https://picsum.photos/id/1021/600/350',
      'https://picsum.photos/id/1022/600/350',
      'https://picsum.photos/id/1023/600/350'
    ],
    title: 'Personal Portfolio Website',
    description: 'A portfolio website showcasing skills, projects, and experiences with smooth animations and responsive design.',
    tech: 'HTML, CSS, JavaScript, Canvas API',
    git: '#'
  }
];

// DOM refs
const navProjectList = document.querySelector('.project-list');
const leftProjectArrow = document.querySelector('.project-arrow.arrow-left');
const rightProjectArrow = document.querySelector('.project-arrow.arrow-right');

const slidesContainer = document.querySelector('.image-slider .slides');
const leftImageArrow = document.querySelector('.image-slider .image-arrow-left');
const rightImageArrow = document.querySelector('.image-slider .image-arrow-right');

const titleEl = document.getElementById('project-title');
const descEl = document.getElementById('project-description');
const techEl = document.getElementById('project-tech');
const gitEl = document.getElementById('project-git');

// State
let currentProjectIndex = 0;
let currentImageIndex = 0;
let autoSlideInterval;

// Initialize navigation bar projects
function renderNavProjects() {
  navProjectList.innerHTML = '';
  projects.forEach((p, idx) => {
    const div = document.createElement('div');
    div.textContent = p.name;
    div.setAttribute('role', 'listitem');
    div.dataset.index = idx;
    if (idx === currentProjectIndex) div.classList.add('active');
    div.addEventListener('click', () => {
      changeProject(idx);
    });
    navProjectList.appendChild(div);
  });
}

// Render images slider for current project
function renderSlides() {
  const imgs = projects[currentProjectIndex].images;
  slidesContainer.innerHTML = '';
  imgs.forEach((src) => {
    const slideDiv = document.createElement('div');
    slideDiv.classList.add('slide');
    const img = document.createElement('img');
    img.src = src;
    img.alt = projects[currentProjectIndex].name + ' Image';
    slideDiv.appendChild(img);
    slidesContainer.appendChild(slideDiv);
  });
  currentImageIndex = 0;
  updateSlidePosition();
}

// Update slider translate
function updateSlidePosition() {
  slidesContainer.style.transform = `translateX(-${currentImageIndex * 100}%)`;
}

// Update project info text
function updateProjectInfo() {
  const proj = projects[currentProjectIndex];
  titleEl.textContent = proj.title;
  descEl.textContent = proj.description;
  techEl.textContent = 'Tech: ' + proj.tech;
  gitEl.href = proj.git;
}

// Change project
function changeProject(idx) {
  if (idx < 0) idx = projects.length - 1;
  if (idx >= projects.length) idx = 0;

  const card = document.querySelector('.project-card');

  // Add animation class
  card.classList.add('transition-out');

  setTimeout(() => {
    currentProjectIndex = idx;

    // Update active nav highlight
    document.querySelectorAll('.project-list div').forEach((el) => el.classList.remove('active'));
    document.querySelector(`.project-list div[data-index="${idx}"]`).classList.add('active');

    // Update content
    renderSlides();
    updateProjectInfo();

    card.classList.remove('transition-out');
    card.classList.add('transition-in');

    setTimeout(() => {
      card.classList.remove('transition-in');
    }, 400); // match with CSS duration
  }, 300); // delay for out transition

  resetAutoSlide();
}

// Image slider navigation
leftImageArrow.addEventListener('click', () => {
  currentImageIndex = (currentImageIndex === 0)
    ? projects[currentProjectIndex].images.length - 1
    : currentImageIndex - 1;
  updateSlidePosition();
  resetAutoSlide();
});

rightImageArrow.addEventListener('click', () => {
  currentImageIndex = (currentImageIndex + 1) % projects[currentProjectIndex].images.length;
  updateSlidePosition();
  resetAutoSlide();
});

// Project navigator arrows
leftProjectArrow.addEventListener('click', () => {
  changeProject(currentProjectIndex - 1);
});

rightProjectArrow.addEventListener('click', () => {
  changeProject(currentProjectIndex + 1);
});

// Auto slide images every 4s
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % projects[currentProjectIndex].images.length;
    updateSlidePosition();
  }, 4000);
}

// Initialize
renderNavProjects();
changeProject(0);
