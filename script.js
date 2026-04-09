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
const projectMap = document.querySelector("#project-map");
const projectVizDetail = document.querySelector("#project-viz-detail");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeFilter = "all";
let mapController = null;

function getFilteredProjects(filter = "all") {
  return filter === "all"
    ? projects
    : projects.filter((project) => project.category.includes(filter));
}

function renderProjects(filter = "all") {
  const filteredProjects = getFilteredProjects(filter);

  projectGrid.innerHTML = filteredProjects
    .map(
      (project) => `
        <article class="project-card" data-reveal style="--project-glow: ${project.glow};">
          <div class="project-card-header">
            <div class="project-index">
              <span class="project-signal">${project.id}</span>
              <span class="project-category">${project.category.join(" / ")}</span>
            </div>
            <span class="project-link-hint">Repository</span>
          </div>
          <div class="project-copy">
            <h3>${project.title}</h3>
            <p>${project.summary}</p>
          </div>
          <div class="project-footer">
            <div class="project-tags">
              ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
            </div>
            <div class="project-links">
              <a href="${project.repo}" target="_blank" rel="noreferrer">Open repository</a>
            </div>
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
      return `
        <div class="orbit-node" style="--project-glow: ${project.glow}; --node-delay: ${index * 0.06}s;">
          <span class="orbit-node-id">${project.id}</span>
          <strong>${project.title}</strong>
          <span>${project.tags.slice(0, 3).join(" / ")}</span>
        </div>
      `;
    })
    .join("");
}

function updateVizDetail(node) {
  if (!projectVizDetail) {
    return;
  }

  if (!node) {
    projectVizDetail.innerHTML = `
      <span class="panel-label">Focused node</span>
      <h3>Map ready</h3>
      <p>Choose a project or shared skill to inspect its connections.</p>
    `;
    return;
  }

  if (node.type === "project") {
    projectVizDetail.innerHTML = `
      <span class="panel-label">Project signal</span>
      <h3>${node.title}</h3>
      <p>${node.summary}</p>
      <div class="viz-meta">
        <span>${node.category.join(" / ")}</span>
        ${node.tags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="project-links">
        <a href="${node.repo}" target="_blank" rel="noreferrer">Open repository</a>
      </div>
    `;
    return;
  }

  projectVizDetail.innerHTML = `
    <span class="panel-label">Capability signal</span>
    <h3>${node.label}</h3>
    <p>${node.connections} linked project${node.connections === 1 ? "" : "s"} in the current filter view.</p>
    <div class="viz-meta">
      <span>Shared capability</span>
      <span>${node.family}</span>
    </div>
  `;
}

function renderProjectMap(filter = "all") {
  if (!projectMap || typeof d3 === "undefined") {
    return;
  }

  const filteredProjects = getFilteredProjects(filter);
  const tagCounts = new Map();

  filteredProjects.forEach((project) => {
    project.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const capabilityNodes = Array.from(tagCounts.entries()).map(([tag, count]) => ({
    id: `tag-${tag}`,
    type: "capability",
    label: tag,
    connections: count,
    family: count > 1 ? "Cross-project skill" : "Specialized skill",
    radius: 10 + Math.min(count * 2, 8)
  }));

  const projectNodes = filteredProjects.map((project) => ({
    ...project,
    type: "project",
    radius: 20 + project.tags.length
  }));

  const nodes = [...projectNodes, ...capabilityNodes];
  const links = [];

  filteredProjects.forEach((project) => {
    project.tags.forEach((tag) => {
      links.push({
        source: project.id,
        target: `tag-${tag}`
      });
    });
  });

  const width = projectMap.clientWidth || 760;
  const height = Math.max(window.innerWidth < 760 ? 420 : 540, projectMap.clientHeight || 0);
  projectMap.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const svg = d3.select(projectMap);
  svg.selectAll("*").remove();

  svg.append("defs")
    .append("filter")
    .attr("id", "viz-glow")
    .append("feGaussianBlur")
    .attr("stdDeviation", 3);

  svg.append("g")
    .selectAll("circle")
    .data(d3.range(24))
    .join("circle")
    .attr("cx", () => Math.random() * width)
    .attr("cy", () => Math.random() * height)
    .attr("r", () => Math.random() * 1.8 + 0.6)
    .attr("fill", "rgba(130,226,212,0.35)");

  const rootX = width / 2;
  const rootY = height / 2;

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((node) => node.id).distance((link) => {
      return typeof link.target === "object" && link.target.type === "capability" ? 90 : 120;
    }).strength(0.7))
    .force("charge", d3.forceManyBody().strength((node) => {
      return node.type === "project" ? -340 : -170;
    }))
    .force("center", d3.forceCenter(rootX, rootY))
    .force("collision", d3.forceCollide().radius((node) => node.radius + 18))
    .force("x", d3.forceX(rootX).strength(0.04))
    .force("y", d3.forceY(rootY).strength(0.04));

  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("class", "viz-link");

  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "viz-node")
    .style("cursor", "pointer");

  node.append("circle")
    .attr("r", (d) => d.radius)
    .attr("fill", (d) => d.type === "project" ? "rgba(12, 28, 42, 0.92)" : "rgba(17, 36, 52, 0.86)")
    .attr("stroke", (d) => d.type === "project" ? "#82e2d4" : "#ffbf8b")
    .attr("stroke-width", 1.5)
    .attr("filter", "url(#viz-glow)");

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", 4)
    .text((d) => {
      if (d.type === "project") {
        return d.id;
      }

      return d.label.length > 12 ? `${d.label.slice(0, 12)}.` : d.label;
    });

  function connectedTo(targetNode, linkDatum) {
    return linkDatum.source.id === targetNode.id || linkDatum.target.id === targetNode.id;
  }

  function setFocus(focusedNode) {
    node.classed("is-dimmed", (candidate) => {
      if (!focusedNode) {
        return false;
      }

      if (candidate.id === focusedNode.id) {
        return false;
      }

      return !links.some((linkDatum) => {
        const sourceId = typeof linkDatum.source === "object" ? linkDatum.source.id : linkDatum.source;
        const targetId = typeof linkDatum.target === "object" ? linkDatum.target.id : linkDatum.target;
        return (sourceId === focusedNode.id && targetId === candidate.id)
          || (targetId === focusedNode.id && sourceId === candidate.id);
      });
    });

    node.classed("is-active", (candidate) => focusedNode && candidate.id === focusedNode.id);

    link.classed("is-dimmed", (linkDatum) => {
      return focusedNode ? !connectedTo(focusedNode, linkDatum) : false;
    });

    updateVizDetail(focusedNode);
  }

  node
    .on("mouseenter", (_, datum) => setFocus(datum))
    .on("mouseleave", () => setFocus(null))
    .on("click", (_, datum) => setFocus(datum))
    .call(
      d3.drag()
        .on("start", (event, datum) => {
          if (!event.active) {
            simulation.alphaTarget(0.25).restart();
          }
          datum.fx = datum.x;
          datum.fy = datum.y;
        })
        .on("drag", (event, datum) => {
          datum.fx = event.x;
          datum.fy = event.y;
        })
        .on("end", (event, datum) => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }
          datum.fx = null;
          datum.fy = null;
        })
    );

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  mapController = {
    destroy() {
      simulation.stop();
    }
  };

  updateVizDetail(projectNodes[0] || null);
  setFocus(projectNodes[0] || null);
}

function updateProjectViews(filter) {
  activeFilter = filter;
  renderProjects(filter);

  if (mapController) {
    mapController.destroy();
  }

  renderProjectMap(filter);
}

function setupFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      updateProjectViews(button.dataset.filter);
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
    card.onpointermove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 9;
      const rotateX = ((y / rect.height) - 0.5) * -9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    };

    card.onpointerleave = () => {
      card.style.transform = "";
    };
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
      threshold: 0.1
    }
  );

  nodes.forEach((entry) => {
    const rect = entry.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    if (isAlreadyInView) {
      entry.classList.add("is-visible");
      return;
    }

    observer.observe(entry);
  });
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
  const particleCount = 28;

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
      context.fillStyle = "rgba(130, 226, 212, 0.55)";
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
        const other = particles[otherIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 140) {
          context.beginPath();
          context.strokeStyle = `rgba(130, 226, 212, ${0.09 - distance / 1800})`;
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

function setupProjectMapResize() {
  let timeoutId = null;

  window.addEventListener("resize", () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      if (mapController) {
        mapController.destroy();
      }
      renderProjectMap(activeFilter);
    }, 120);
  });
}

function setYear() {
  const yearNode = document.querySelector("#year");

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

updateProjectViews();
renderOrbitNodes();
setupFilters();
setupRoleRotation();
setupCursorGlow();
revealObserver();
setupCanvas();
setupProjectMapResize();
setYear();
