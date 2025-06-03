const projects = [
  {
    title: "Studentify",
    desc: "Studentify uses Angular 16, Spring Boot, and MySQL for CRUD operations. It supports containerization and CI/CD with Jenkins and ArgoCD.",
    image: "https://raw.githubusercontent.com/imrezaulkrm/Studentify/main/screenshots/studentify1.png"
  },
  {
    title: "MediHelp",
    desc: "MediHelp is an online pharmacy built with Docker, GitHub Webhook, Jenkins automation and CI/CD pipelines.",
    image: "https://raw.githubusercontent.com/imrezaulkrm/MediHelp/main/screenshots/medihelp1.png"
  },
  {
    title: "Portfolio Site",
    desc: "My developer portfolio showing DevOps pipelines, GitOps flow, and container-based deployment using Kubernetes.",
    image: "https://dummyimage.com/600x400/22c55e/fff&text=Portfolio"
  }
];

let currentIndex = 0;

const imageEl = document.getElementById("projectImage");
const titleEl = document.getElementById("projectTitle");
const descEl = document.getElementById("projectDesc");

function showProject(index) {
  const project = projects[index];
  imageEl.src = project.image;
  titleEl.textContent = project.title;
  descEl.textContent = project.desc;
}

document.getElementById("prevBtn").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + projects.length) % projects.length;
  showProject(currentIndex);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % projects.length;
  showProject(currentIndex);
});

window.onload = () => showProject(currentIndex);
