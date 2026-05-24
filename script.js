const projects = [
  {
    title: "SkinSync RAG Chatbot",
    category: ["ai", "web"],
    lane: "RAG product",
    summary: "AI skin analysis and skincare recommendation project built around retrieval, chat, and practical health-adjacent UX.",
    tags: ["Python", "RAG", "FAISS", "FastAPI"],
    repo: "https://github.com/rTalhaa/SkinSync-RAG-Chatbot",
    accent: "#ff665c",
    icon: "RAG",
    featured: true
  },
  {
    title: "Tox21 Molecular Toxicity MLOps",
    category: ["ai", "ops"],
    lane: "MLOps platform",
    summary: "A molecular toxicity modeling platform with deployment-oriented workflows for classification, tracking, and delivery.",
    tags: ["PyTorch", "MLOps", "Docker", "MLflow"],
    repo: "https://github.com/rTalhaa/Tox21-Molecular-Toxicity-MLOps-Platform",
    accent: "#22d3ee",
    icon: "TX",
    featured: true
  },
  {
    title: "FineTuning DeepSpeed vs LoRA",
    category: ["ai"],
    lane: "LLM research",
    summary: "Benchmark-style fine-tuning work comparing full-scale DeepSpeed workflows against lighter LoRA adapter methods.",
    tags: ["LLM", "DeepSpeed", "LoRA", "Transformers"],
    repo: "https://github.com/rTalhaa/FineTuning-DeepSpeed-vs-LoRA-Adapters",
    accent: "#9beb3f",
    icon: "LLM",
    featured: true
  },
  {
    title: "Islamabad Land Price HeatMap",
    category: ["data", "web"],
    lane: "Geospatial dashboard",
    summary: "Automated Islamabad land price heatmap and spatial visualization project for property intelligence.",
    tags: ["Python", "GeoPandas", "Maps", "Scraping"],
    repo: "https://github.com/rTalhaa/Islamabad-Land-Price-HeatMap",
    accent: "#ffb020",
    icon: "MAP",
    featured: true
  },
  {
    title: "Swing Automated Trading",
    category: ["data", "ops"],
    lane: "Market automation",
    summary: "Automated swing trading project for strategy experimentation, backtesting, and market signal workflows.",
    tags: ["Python", "Backtesting", "Risk", "Automation"],
    repo: "https://github.com/rTalhaa/SwingautomateddTrading",
    accent: "#9a6cff",
    icon: "TRD"
  },
  {
    title: "Smart Right Click Extension v2",
    category: ["web", "ai"],
    lane: "Browser tool",
    summary: "Improved productivity browser extension for quick actions, capture flows, and AI-assisted summaries.",
    tags: ["JavaScript", "Chrome API", "UX", "AI"],
    repo: "https://github.com/rTalhaa/smart-right-click-browser-extension-v2",
    accent: "#2f8cff",
    icon: "EXT"
  },
  {
    title: "Car Price Tracker PK",
    category: ["data", "web"],
    lane: "Market tracker",
    summary: "Pakistan car price tracking project that combines listings, scraping, trends, and analytics-oriented presentation.",
    tags: ["TypeScript", "Scraping", "Analytics", "Cars"],
    repo: "https://github.com/rTalhaa/car-price-tracker-pk",
    accent: "#ff665c",
    icon: "CAR"
  },
  {
    title: "Climate and AQI Explorer",
    category: ["data", "web"],
    lane: "Public data app",
    summary: "Interactive city climate and air quality explorer built for comparison, visualization, and clean public data storytelling.",
    tags: ["Python", "Streamlit", "Plotly", "API"],
    repo: "https://github.com/rTalhaa/city-climate-air-quality-explorer",
    accent: "#22d3ee",
    icon: "AQI"
  },
  {
    title: "Spotify Recommendation System",
    category: ["ai", "web"],
    lane: "Recommendation UI",
    summary: "Spotify-style clone with music recommendation functionality, blending interface practice with recommender systems.",
    tags: ["Python", "JavaScript", "Recommender", "Music"],
    repo: "https://github.com/rTalhaa/Spotify-Clone-and-Music-Recommendation-System",
    accent: "#9beb3f",
    icon: "SP"
  },
  {
    title: "Computer Vision Suite",
    category: ["ai"],
    lane: "Vision experiments",
    summary: "Image classification, edge detection, segmentation, and classical vision experiments across model families.",
    tags: ["OpenCV", "SVM", "HOG", "CNN"],
    repo: "https://github.com/rTalhaa/Edge-Detection-and-Image-Classification",
    accent: "#ffb020",
    icon: "CV"
  },
  {
    title: "PixelCNN on MNIST",
    category: ["ai"],
    lane: "Generative modeling",
    summary: "Autoregressive image modeling experiments with PixelCNN, MNIST, and sampled output analysis.",
    tags: ["PyTorch", "PixelCNN", "MNIST", "Generative"],
    repo: "https://github.com/rTalhaa/PixelCNN_on_MNIST",
    accent: "#9a6cff",
    icon: "PX"
  },
  {
    title: "DSA-ViT Research",
    category: ["ai"],
    lane: "Research notebook",
    summary: "Dual-Scale Adaptive Vision Transformer research project for CIFAR-10 image classification.",
    tags: ["ViT", "Attention", "PyTorch", "Research"],
    repo: "https://github.com/rTalhaa/DSA-ViT-Dual-Scale-Adaptive-Vision-Transformer-Research",
    accent: "#2f8cff",
    icon: "ViT"
  }
];

const projectGrid = document.querySelector("#project-grid");
const featuredStrip = document.querySelector("#featured-strip");
const projectShowcase = document.querySelector("#project-showcase");
const filters = document.querySelectorAll(".filter");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeShowcaseIndex = 0;
let currentShowcaseProjects = projects;
let showcaseTimer = null;

function projectCard(project) {
  return `
    <article class="project-card" data-reveal style="--accent: ${project.accent};">
      <div class="project-card-header">
        <div>
          <div class="project-icon">${project.icon}</div>
          <span class="project-kicker">${project.lane}</span>
        </div>
        <span class="project-kicker">${project.category.join(" / ")}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.summary}</p>
      <div class="project-tags">
        ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="project-card-footer">
        <a href="${project.repo}" target="_blank" rel="noreferrer">Open repo</a>
        <small>GitHub</small>
      </div>
    </article>
  `;
}

function featureCard(project) {
  return `
    <article class="feature-card" data-reveal style="--accent: ${project.accent};">
      <span class="project-kicker">${project.lane}</span>
      <h3>${project.title}</h3>
      <p>${project.summary}</p>
    </article>
  `;
}

function renderProjects(filter = "all") {
  const visibleProjects = filter === "all"
    ? projects
    : projects.filter((project) => project.category.includes(filter));

  currentShowcaseProjects = visibleProjects;
  activeShowcaseIndex = 0;
  projectGrid.innerHTML = visibleProjects.map(projectCard).join("");
  renderProjectShowcase();
  renderFeatured(filter);
  document.querySelector("#project-count").textContent = projects.length;
  revealItems();
}

function renderFeatured(filter = "all") {
  const featuredProjects = projects.filter((project) => {
    return project.featured && (filter === "all" || project.category.includes(filter));
  });

  featuredStrip.innerHTML = featuredProjects.map(featureCard).join("");
  featuredStrip.hidden = featuredProjects.length === 0;
}

function setupFilters() {
  filters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      filters.forEach((button) => button.classList.remove("is-active"));
      filterButton.classList.add("is-active");
      renderProjects(filterButton.dataset.filter);
    });
  });
}

function renderProjectShowcase() {
  if (!projectShowcase || !currentShowcaseProjects.length) {
    return;
  }

  const activeProject = currentShowcaseProjects[activeShowcaseIndex % currentShowcaseProjects.length];
  const orbitProjects = currentShowcaseProjects.slice(0, 8);
  const angleStep = 360 / orbitProjects.length;

  projectShowcase.style.setProperty("--accent", activeProject.accent);
  projectShowcase.innerHTML = `
    <div class="showcase-copy">
      <span class="project-kicker">Animated project showcase</span>
      <h3>${activeProject.title}</h3>
      <p>${activeProject.summary}</p>
      <div class="project-tags">
        ${activeProject.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="showcase-actions">
        <a class="button primary" href="${activeProject.repo}" target="_blank" rel="noreferrer">Open selected repo</a>
        <button class="button secondary" type="button" data-next-project>Next project</button>
      </div>
    </div>
    <div class="orbit-stage" aria-label="Animated project selector">
      <div class="orbit-core">
        <span>${activeProject.icon}</span>
        <strong>${activeProject.lane}</strong>
      </div>
      <div class="orbit-ring">
        ${orbitProjects.map((project, index) => `
          <button
            class="orbit-project ${project.title === activeProject.title ? "is-active" : ""}"
            type="button"
            style="--angle: ${index * angleStep}deg; --node-accent: ${project.accent};"
            data-showcase-index="${index}"
            aria-label="Show ${project.title}"
          >
            <span>${project.icon}</span>
          </button>
        `).join("")}
      </div>
      <div class="orbit-trail" aria-hidden="true">
        ${activeProject.tags.slice(0, 4).map((tag, index) => `<span style="--delay: ${index * 0.2}s">${tag}</span>`).join("")}
      </div>
    </div>
  `;

  projectShowcase.querySelectorAll("[data-showcase-index]").forEach((button) => {
    button.addEventListener("click", () => {
      activeShowcaseIndex = Number(button.dataset.showcaseIndex);
      renderProjectShowcase();
      restartShowcaseTimer();
    });
  });

  projectShowcase.querySelector("[data-next-project]")?.addEventListener("click", () => {
    advanceShowcase();
    restartShowcaseTimer();
  });
}

function advanceShowcase() {
  if (!currentShowcaseProjects.length) {
    return;
  }

  activeShowcaseIndex = (activeShowcaseIndex + 1) % Math.min(currentShowcaseProjects.length, 8);
  renderProjectShowcase();
}

function restartShowcaseTimer() {
  window.clearInterval(showcaseTimer);

  if (prefersReducedMotion) {
    return;
  }

  showcaseTimer = window.setInterval(advanceShowcase, 4200);
}

function setupShowcasePause() {
  if (!projectShowcase || prefersReducedMotion) {
    return;
  }

  projectShowcase.addEventListener("mouseenter", () => window.clearInterval(showcaseTimer));
  projectShowcase.addEventListener("mouseleave", restartShowcaseTimer);
}

function revealItems() {
  const revealNodes = document.querySelectorAll("[data-reveal]:not(.is-visible)");

  if (!revealNodes.length) {
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
    { threshold: 0.12 }
  );

  revealNodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      node.classList.add("is-visible");
      return;
    }
    observer.observe(node);
  });
}

function setupCanvas() {
  if (prefersReducedMotion) {
    return;
  }

  const canvas = document.querySelector("#system-canvas");
  const context = canvas.getContext("2d");
  const points = [];
  const colors = ["#ff665c", "#22d3ee", "#9beb3f", "#ffb020", "#9a6cff", "#2f8cff"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    points.length = 0;
    for (let index = 0; index < 48; index += 1) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        color: colors[index % colors.length]
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
      if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

      context.fillStyle = point.color;
      context.globalAlpha = 0.65;
      context.fillRect(point.x, point.y, 2, 2);

      for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
        const other = points[otherIndex];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 118) {
          context.strokeStyle = point.color;
          context.globalAlpha = 0.06;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });

    context.globalAlpha = 1;
    window.requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

function setYear() {
  const year = document.querySelector("#year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

renderProjects();
setupFilters();
setupShowcasePause();
restartShowcaseTimer();
revealItems();
setupCanvas();
setYear();
