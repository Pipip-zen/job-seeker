const REFERENCE_DATE = new Date("2026-05-13T00:00:00");

function handleSearch(event) {
  event.preventDefault();
  const searchField = document.getElementById("mainSearch");
  const keyword = searchField ? searchField.value.trim() : "";
  window.location.href = `jobs.html?search=${encodeURIComponent(keyword)}`;
}

function getDefaultDetailLink() {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return "jobs.html";
  }

  const latestJob = [...jobs].sort(
    (left, right) => new Date(right.postedDate) - new Date(left.postedDate)
  )[0];

  return `job-detail.html?id=${latestJob.id}`;
}

function getCompanyInitials(company) {
  return (company || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getBrandColor(company) {
  const palette = [
    "#22c55e",
    "#ff5a5f",
    "#ef4444",
    "#8b5cf6",
    "#6366f1",
    "#111111",
    "#4f46e5",
    "#ff7a59",
    "#65d400",
    "#0f766e",
  ];

  const key = (company || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[key % palette.length];
}

function getRelativePostedTime(postedDate) {
  const diffInDays = Math.max(
    0,
    Math.round((REFERENCE_DATE - new Date(postedDate)) / (1000 * 60 * 60 * 24))
  );

  if (diffInDays === 0) {
    return "Today";
  }

  if (diffInDays === 1) {
    return "1 day ago";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const weeks = Math.max(1, Math.round(diffInDays / 7));
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

function getExperienceLevel(job) {
  const title = (job.title || "").toLowerCase();

  if (title.includes("senior") || title.includes("lead")) {
    return "Senior";
  }

  if (title.includes("manager") || title.includes("specialist") || title.includes("devops")) {
    return "Expert";
  }

  if (
    title.includes("intern") ||
    title.includes("support") ||
    title.includes("writer") ||
    title.includes("recruiter")
  ) {
    return "Entry Level";
  }

  return "Intermediate";
}

function getExperienceTone(level) {
  switch (level) {
    case "Senior":
      return "pink";
    case "Expert":
      return "orange";
    case "Entry Level":
      return "blue";
    case "Intermediate":
    default:
      return "lavender";
  }
}

function formatHourlyRate(salary) {
  const hourly = Math.max(18, Math.round(salary / 140000));
  return `$${hourly}/hr`;
}

function getBookmarkIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4.5h8a1.5 1.5 0 0 1 1.5 1.5v13.1l-5.5-3.4-5.5 3.4V6A1.5 1.5 0 0 1 8 4.5Z"></path>
    </svg>
  `;
}

function getShareIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.5 8.5 8.8 12l6.7 3.5"></path>
      <circle cx="18" cy="7" r="2.2"></circle>
      <circle cx="6" cy="12" r="2.2"></circle>
      <circle cx="18" cy="17" r="2.2"></circle>
    </svg>
  `;
}

function getMetaIcon(type) {
  const icons = {
    company:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5h16M6.5 19.5V6.5h6v13M12.5 19.5V10h5v9.5M9 9.5h1M9 12.5h1M9 15.5h1"></path></svg>',
    location:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s5-5.6 5-9a5 5 0 1 0-10 0c0 3.4 5 9 5 9Z"></path><circle cx="12" cy="11" r="1.8"></circle></svg>',
    time:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4.2l2.8 1.6"></path></svg>',
  };

  return icons[type] || "";
}

function getJobCardMarkup(job, options = {}) {
  const compact = options.compact ? " job-card-compact" : "";
  const experience = getExperienceLevel(job);
  const categoryTone = getExperienceTone(experience);
  const accent = getBrandColor(job.company);
  const relativeTime = getRelativePostedTime(job.postedDate);

  return `
    <article class="job-card${compact}">
      <div class="job-card-top">
        <div class="job-brand" style="--brand-color:${accent}">
          ${getCompanyInitials(job.company)}
        </div>
        <button class="job-icon-button" type="button" aria-label="Save job">
          ${getBookmarkIcon()}
        </button>
      </div>

      <div class="job-card-body">
        <h3>${job.title}</h3>
        <p class="job-company">${job.company}</p>
        <div class="job-tags">
          <span class="job-tag job-tag-green">${job.type}</span>
          <span class="job-tag job-tag-${categoryTone}">${experience}</span>
          <span class="job-tag job-tag-purple">${job.type === "Remote" || job.type === "Hybrid" ? "Remote" : job.category}</span>
        </div>
        <p class="job-description">${job.description}</p>
      </div>

      <div class="job-card-bottom">
        <p class="job-rate">${formatHourlyRate(job.salary)}</p>
        <p class="job-time">${relativeTime}</p>
      </div>

      <a class="job-card-link-stretch" href="job-detail.html?id=${job.id}" aria-label="View ${job.title} detail"></a>
    </article>
  `;
}

function buildNavbar(currentPage) {
  const detailLink = getDefaultDetailLink();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userName = localStorage.getItem("userName") || "User";

  let actionsHtml = "";

  if (isLoggedIn) {
    actionsHtml += `
      <a class="nav-link-button" href="#" id="logoutBtn">Logout</a>
      <a class="nav-avatar ${currentPage === "profile" ? "is-active" : ""}" href="profile.html" aria-label="Profile" title="Profile (${userName})">
        <span></span>
      </a>
    `;
  } else {
    actionsHtml += `
      <a class="nav-link-button" href="login.html?mode=login">Login</a>
      <a class="nav-register-button" href="login.html?mode=register">Register</a>
    `;
  }

  return `
    <header class="site-nav">
      <div class="site-shell-row nav-row">
        <a class="site-logo" href="index.html" aria-label="HireUp home">
          <span class="site-logo-mark">
            <span class="site-logo-briefcase" aria-hidden="true"></span>
          </span>
          <span class="site-logo-wordmark">Hire<span>Up</span></span>
        </a>

        <nav class="nav-menu" aria-label="Main navigation">
          <a href="jobs.html" class="${currentPage === "jobs" ? "is-active" : ""}">Find Jobs</a>
          <a href="companies.html" class="${currentPage === 'companies' ? 'is-active' : ''}">Companies</a>
          <a href="resources.html" class="${currentPage === 'resources' ? 'is-active' : ''}">Resources</a>
          <a href="more.html" class="${currentPage === 'more' ? 'is-active' : ''}">More</a>
        </nav>

        <div class="nav-actions">
          ${actionsHtml}
        </div>
      </div>
    </header>
  `;
}

function buildFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="site-shell-row footer-row">
        <a class="site-logo footer-logo" href="index.html" aria-label="HireUp home">
          <span class="site-logo-mark">
            <span class="site-logo-briefcase" aria-hidden="true"></span>
          </span>
          <span class="site-logo-wordmark">Hire<span>Up</span></span>
        </a>
        <p class="footer-copy">&copy; ${year} HireUp. All rights reserved.</p>
      </div>
    </footer>
  `;
}

function renderIndexStats() {
  const statsRoot = document.getElementById("indexStats");

  if (!statsRoot || !Array.isArray(jobs) || jobs.length === 0) {
    return;
  }

  const companyCount = new Set(jobs.map((job) => job.company)).size;
  const hiredThisMonth = jobs.filter((job) => new Date(job.postedDate).getMonth() === 4).length;

  const stats = [
    { value: "10,842+", label: "Jobs Listed" },
    { value: "2,300+", label: "Companies" },
    { value: `${(hiredThisMonth * 273).toLocaleString("en-US")}+`, label: "Hired This Month" },
    { value: `${80 + companyCount - 1}%`, label: "Success Rate" },
  ];

  statsRoot.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <span class="stat-value">${stat.value}</span>
          <span class="stat-label">${stat.label}</span>
        </article>
      `
    )
    .join("");
}

function renderFeaturedJobs() {
  const featuredRoot = document.getElementById("featuredJobs");

  if (!featuredRoot || !Array.isArray(jobs)) {
    return;
  }

  const featuredJobs = [...jobs]
    .sort((left, right) => new Date(right.postedDate) - new Date(left.postedDate))
    .slice(0, 3);

  featuredRoot.innerHTML = featuredJobs
    .map((job) => getJobCardMarkup(job, { compact: true }))
    .join("");
}

function decoratePage() {
  const body = document.body;
  const main = document.querySelector("main");

  if (!body || !main) {
    return;
  }

  const pageName = body.dataset.page || "";
  if (pageName === "login") {
    return;
  }

  body.classList.add("site-body");
  main.classList.add("site-main");

  body.insertAdjacentHTML("afterbegin", buildNavbar(pageName));
  body.insertAdjacentHTML("beforeend", buildFooter());
}

document.addEventListener("DOMContentLoaded", () => {
  decoratePage();
  renderIndexStats();
  renderFeaturedJobs();

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      window.location.reload();
    });
  }
});
