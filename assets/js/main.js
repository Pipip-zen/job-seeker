function handleSearch(event) {
  event.preventDefault();
  const searchField = document.getElementById("mainSearch");
  const keyword = searchField ? searchField.value.trim() : "";
  window.location.href = `jobs.html?search=${encodeURIComponent(keyword)}`;
}

function buildNavbar(currentPage) {
  return `
    <header class="navbar">
      <div class="container navbar-inner">
        <a class="brand" href="index.html" aria-label="HireUp home">
          <span class="brand-mark">H</span>
          <span class="brand-copy">
            <small>Career Platform</small>
            <span>HireUp</span>
          </span>
        </a>
        <nav class="nav-links" aria-label="Main navigation">
          <a href="index.html" class="${currentPage === "index" ? "is-active" : ""}">Home</a>
          <a href="jobs.html" class="${currentPage === "jobs" ? "is-active" : ""}">Lowongan</a>
          <a href="job-detail.html" class="${currentPage === "detail" ? "is-active" : ""}">Detail</a>
        </nav>
      </div>
    </header>
  `;
}

function buildFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <p>&copy; ${year} HireUp. Cari kerja lebih cepat, lebih rapi.</p>
        <div class="footer-links">
          <a href="index.html">Beranda</a>
          <a href="jobs.html">Semua Lowongan</a>
          <a href="job-detail.html">Lihat Detail</a>
        </div>
      </div>
    </footer>
  `;
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
    .map(
      (job) => `
        <article class="job-card">
          <div class="job-card-header">
            <div>
              <span class="job-badge">${job.category}</span>
              <h3>${job.title}</h3>
            </div>
            <span class="job-badge">${job.type}</span>
          </div>
          <p class="section-copy">${job.company}</p>
          <div class="job-meta">
            <span>${job.location}</span>
            <span>${job.postedDate}</span>
          </div>
          <p class="job-salary">${job.salaryText}</p>
          <a class="button" href="job-detail.html?id=${job.id}">Lihat Detail</a>
        </article>
      `
    )
    .join("");
}

function decoratePage() {
  const body = document.body;
  const main = document.querySelector("main");

  if (!body || !main) {
    return;
  }

  const pageName = body.dataset.page || "";
  body.classList.add("site-shell");
  main.classList.add("site-main");

  body.insertAdjacentHTML("afterbegin", buildNavbar(pageName));
  body.insertAdjacentHTML("beforeend", buildFooter());
}

document.addEventListener("DOMContentLoaded", () => {
  decoratePage();
  renderFeaturedJobs();
});
