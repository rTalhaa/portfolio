const projects = [
  {
    id: "P-01",
    title: "Islamabad Land Price HeatMap",
    category: ["data", "web"],
    summary:
      "An automated property intelligence platform combining web scraping, a FastAPI backend, and a MapLibre deck.gl heatmap dashboard for Islamabad land prices.",
    tags: ["Python", "FastAPI", "MapLibre", "deck.gl", "Web Scraping"],
    repo: "https://github.com/rTalhaa/Islamabad-Land-Price-HeatMap",
    glow: "rgba(111, 255, 233, 0.22)"
  },
  {
    id: "P-02",
    title: "City Climate and Air Quality Explorer",
    category: ["data", "web"],
    summary:
      "A polished public-data dashboard that compares cities across weather and AQI using cached ingestion, reusable transformations, Plotly visuals, and a Streamlit app layer.",
    tags: ["Python", "Streamlit", "Plotly", "Open-Meteo", "Pandas"],
    repo: "https://github.com/rTalhaa/city-climate-air-quality-explorer",
    glow: "rgba(186, 252, 105, 0.2)"
  },
  {
    id: "P-03",
    title: "Automated MLOps Pipeline",
    category: ["ml", "data"],
    summary:
      "An end-to-end MLOps workflow that uses Apache Airflow for orchestration and MLflow for experiment tracking, model evaluation, and registry flow.",
    tags: ["Python", "Airflow", "MLflow", "MLOps", "Experiment Tracking"],
    repo: "https://github.com/rTalhaa/Automated-MLOps-Pipeline-using-Apache-Airflow-and-MLflow-for-Experiment-Tracking",
    glow: "rgba(255, 159, 90, 0.18)"
  },
  {
    id: "P-04",
    title: "Spotify Clone and Music Recommender",
    category: ["web", "ml"],
    summary:
      "A front-end Spotify-inspired experience paired with a Spark ALS recommendation engine, blending interface work with recommendation system thinking.",
    tags: ["HTML", "CSS", "JavaScript", "Spark ALS", "Recommendation"],
    repo: "https://github.com/rTalhaa/Spotify-Clone-and-Music-Recommendation-System",
    glow: "rgba(111, 255, 233, 0.18)"
  },
  {
    id: "P-05",
    title: "Edge Detection and Image Classification",
    category: ["ml"],
    summary:
      "A machine learning and computer vision pair-up featuring HOG-plus-SVM classification work alongside image segmentation for transparent background generation.",
    tags: ["Python", "OpenCV", "SVM", "Image Segmentation", "Computer Vision"],
    repo: "https://github.com/rTalhaa/Edge-Detection-and-Image-Classification",
    glow: "rgba(255, 159, 90, 0.16)"
  },
  {
    id: "P-06",
    title: "PixelCNN on MNIST",
    category: ["ml"],
    summary:
      "A generative modeling project exploring autoregressive image synthesis with PixelCNN, focused on understanding learned distributions and sampled outputs.",
    tags: ["Python", "PixelCNN", "MNIST", "Generative AI", "Deep Learning"],
    repo: "https://github.com/rTalhaa/PixelCNN_on_MNIST",
    glow: "rgba(186, 252, 105, 0.15)"
  }
];

const orbitPhrases = [
  "Geospatial dashboards",
  "ML pipelines",
  "Interactive web apps",
  "Data storytelling",
  "Visual intelligence"
];

const projectGrid = document.querySelector("#project-grid");
const filterButtons = document.querySelectorAll(".filter-chip");
const orbitNodes = document.querySelector("#orbit-nodes");
const rotatingRole = document.querySelector("#rotating-role");
const cursorGlow = document.querySelector(".cursor-glow");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderProjects(filter = "all") {
  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category.includes(filter));

  projectGrid.innerHTML = filteredProjects
    .map(
      (project) => `
        <article class="project-card" data-tilt data-reveal style="--project-glow: ${project.glow};">
          <div class="project-top">
            <span class="project-signal">${project.id}</span>
            <span class="panel-label">${project.category.join(" / ")}</span>
          </div>
          <div class="project-copy">
            <h3>${project.title}</h3>
            <p>${project.summary}</p>
          </div>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
          </div>
          <div class="project-links">
            <a href="${project.repo}" target="_blank" rel="noreferrer">Open repository</a>
          </div>
        </article>
      `
    )
    .join("");

  enableTilt();
  revealObserver();
}

function renderOrbitNodes() {
  const orbitProjects = projects.slice(0, 5);

  orbitNodes.innerHTML = orbitProjects
    .map((project, index) => {
      const angle = `${index * 72}deg`;
      const radius = index % 2 === 0 ? "13rem" : "10rem";
      const delay = `${index * 0.8}s`;

      return `
        <div class="orbit-node" style="--angle: ${angle}; --radius: ${radius}; --delay: ${delay};">
          <strong>${project.title}</strong>
          <span>${project.tags.slice(0, 2).join(" + ")}</span>
        </div>
      `;
    })
    .join("");
}

function setupFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderProjects(button.dataset.filter);
    });
  });
}

function setupRoleRotation() {
  if (prefersReducedMotion || !rotatingRole) {
    return;
  }

  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % orbitPhrases.length;
    rotatingRole.textContent = orbitPhrases[index];
  }, 2400);
}

function setupCursorGlow() {
  if (prefersReducedMotion || !cursorGlow) {
    return;
  }

  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.transform = `translate3d(${event.clientX - 144}px, ${event.clientY - 144}px, 0)`;
  });

  window.addEventListener("pointerleave", () => {
    cursorGlow.style.opacity = "0";
  });
}

function enableTilt() {
  if (prefersReducedMotion) {
    return;
  }

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 9;
      const rotateX = ((y / rect.height) - 0.5) * -9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function revealObserver() {
  const nodes = document.querySelectorAll("[data-reveal]:not(.is-visible)");

  if (!nodes.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18
    }
  );

  nodes.forEach((node) => observer.observe(node));
}

function setupCanvas() {
  if (prefersReducedMotion) {
    return;
  }

  const canvas = document.querySelector("#particle-canvas");

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = 44;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles.length = 0;

    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 1.8 + 0.8
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -1;
      }

      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -1;
      }

      context.beginPath();
      context.fillStyle = "rgba(111, 255, 233, 0.7)";
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
        const other = particles[otherIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 140) {
          context.beginPath();
          context.strokeStyle = `rgba(111, 255, 233, ${0.12 - distance / 1400})`;
          context.lineWidth = 1;
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });

    window.requestAnimationFrame(draw);
  }

  resizeCanvas();
  createParticles();
  draw();

  window.addEventListener("resize", () => {
    resizeCanvas();
    createParticles();
  });
}

function setYear() {
  const yearNode = document.querySelector("#year");

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

renderProjects();
renderOrbitNodes();
setupFilters();
setupRoleRotation();
setupCursorGlow();
revealObserver();
setupCanvas();
setYear();
