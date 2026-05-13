const JOBS_PER_PAGE = 6;

const jobsState = {
  search: "",
  category: "",
  location: "",
  type: "",
  sort: "newest",
  page: 1,
};

function getJobsElements() {
  return {
    form: document.getElementById("filtersForm"),
    search: document.getElementById("jobsSearch"),
    category: document.getElementById("categoryFilter"),
    location: document.getElementById("locationFilter"),
    type: document.getElementById("typeFilter"),
    sort: document.getElementById("sortSelect"),
    clear: document.getElementById("clearFilters"),
    container: document.getElementById("jobsContainer"),
    count: document.getElementById("resultsCount"),
    heading: document.getElementById("resultsHeading"),
    activeFilters: document.getElementById("activeFilters"),
    emptyState: document.getElementById("emptyState"),
    pagination: document.getElementById("pagination"),
  };
}

function uniqueValues(key) {
  return [...new Set(jobs.map((job) => job[key]))].sort((left, right) =>
    left.localeCompare(right, "id")
  );
}

function fillSelectOptions(select, values, label) {
  if (!select) {
    return;
  }

  select.innerHTML =
    `<option value="">${label}</option>` +
    values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function readParams() {
  const params = new URLSearchParams(window.location.search);

  jobsState.search = params.get("search") || "";
  jobsState.category = params.get("category") || "";
  jobsState.location = params.get("location") || "";
  jobsState.type = params.get("type") || "";
  jobsState.sort = params.get("sort") || "newest";
  jobsState.page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
}

function writeParams() {
  const params = new URLSearchParams();

  if (jobsState.search) {
    params.set("search", jobsState.search);
  }

  if (jobsState.category) {
    params.set("category", jobsState.category);
  }

  if (jobsState.location) {
    params.set("location", jobsState.location);
  }

  if (jobsState.type) {
    params.set("type", jobsState.type);
  }

  if (jobsState.sort !== "newest") {
    params.set("sort", jobsState.sort);
  }

  if (jobsState.page > 1) {
    params.set("page", String(jobsState.page));
  }

  const query = params.toString();
  const nextUrl = query ? `jobs.html?${query}` : "jobs.html";
  window.history.replaceState({}, "", nextUrl);
}

function syncControls(elements) {
  if (!elements.form) {
    return;
  }

  elements.search.value = jobsState.search;
  elements.category.value = jobsState.category;
  elements.location.value = jobsState.location;
  elements.type.value = jobsState.type;
  elements.sort.value = jobsState.sort;
}

function filterJobs() {
  const searchTerm = jobsState.search.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      [
        job.title,
        job.company,
        job.location,
        job.category,
        job.type,
        job.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);

    const matchesCategory = !jobsState.category || job.category === jobsState.category;
    const matchesLocation = !jobsState.location || job.location === jobsState.location;
    const matchesType = !jobsState.type || job.type === jobsState.type;

    return matchesSearch && matchesCategory && matchesLocation && matchesType;
  });
}

function sortJobs(items) {
  const sortedJobs = [...items];

  switch (jobsState.sort) {
    case "salary_desc":
      sortedJobs.sort((left, right) => right.salary - left.salary);
      break;
    case "salary_asc":
      sortedJobs.sort((left, right) => left.salary - right.salary);
      break;
    case "title_asc":
      sortedJobs.sort((left, right) => left.title.localeCompare(right.title, "id"));
      break;
    case "newest":
    default:
      sortedJobs.sort((left, right) => new Date(right.postedDate) - new Date(left.postedDate));
      break;
  }

  return sortedJobs;
}

function paginateJobs(items) {
  const totalPages = Math.max(1, Math.ceil(items.length / JOBS_PER_PAGE));
  jobsState.page = Math.min(jobsState.page, totalPages);
  const startIndex = (jobsState.page - 1) * JOBS_PER_PAGE;

  return {
    pageItems: items.slice(startIndex, startIndex + JOBS_PER_PAGE),
    totalPages,
  };
}

function formatActiveFilters() {
  const chips = [];

  if (jobsState.search) {
    chips.push(`Cari: ${jobsState.search}`);
  }

  if (jobsState.category) {
    chips.push(`Kategori: ${jobsState.category}`);
  }

  if (jobsState.location) {
    chips.push(`Lokasi: ${jobsState.location}`);
  }

  if (jobsState.type) {
    chips.push(`Tipe: ${jobsState.type}`);
  }

  return chips;
}

function renderActiveFilters(elements) {
  const chips = formatActiveFilters();
  elements.activeFilters.innerHTML = chips
    .map((chip) => `<span class="filter-chip">${chip}</span>`)
    .join("");
}

function renderPagination(elements, totalPages) {
  if (totalPages <= 1) {
    elements.pagination.innerHTML = "";
    return;
  }

  const buttons = [];

  buttons.push(`
    <button class="pagination-button" type="button" data-page="${jobsState.page - 1}" ${
      jobsState.page === 1 ? "disabled" : ""
    }>
      Prev
    </button>
  `);

  for (let page = 1; page <= totalPages; page += 1) {
    buttons.push(`
      <button
        class="pagination-button ${page === jobsState.page ? "is-active" : ""}"
        type="button"
        data-page="${page}"
      >
        ${page}
      </button>
    `);
  }

  buttons.push(`
    <button class="pagination-button" type="button" data-page="${jobsState.page + 1}" ${
      jobsState.page === totalPages ? "disabled" : ""
    }>
      Next
    </button>
  `);

  elements.pagination.innerHTML = buttons.join("");
}

function renderJobs() {
  const elements = getJobsElements();
  const filteredJobs = filterJobs();
  const sortedJobs = sortJobs(filteredJobs);
  const { pageItems, totalPages } = paginateJobs(sortedJobs);

  elements.count.textContent = `${filteredJobs.length} lowongan ditemukan`;
  elements.heading.textContent = jobsState.search
    ? `Hasil untuk "${jobsState.search}"`
    : "Semua lowongan";

  renderActiveFilters(elements);
  renderPagination(elements, totalPages);

  if (pageItems.length === 0) {
    elements.container.innerHTML = "";
    elements.emptyState.hidden = false;
    writeParams();
    return;
  }

  elements.emptyState.hidden = true;
  elements.container.innerHTML = pageItems
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
          <p class="section-copy">${job.description}</p>
          <p class="job-salary">${job.salaryText}</p>
          <a class="button job-card-link" href="job-detail.html?id=${job.id}">Lihat Detail</a>
        </article>
      `
    )
    .join("");

  writeParams();
}

function applyFormValues(elements) {
  jobsState.search = elements.search.value.trim();
  jobsState.category = elements.category.value;
  jobsState.location = elements.location.value;
  jobsState.type = elements.type.value;
  jobsState.page = 1;
}

function resetFilters(elements) {
  jobsState.search = "";
  jobsState.category = "";
  jobsState.location = "";
  jobsState.type = "";
  jobsState.sort = "newest";
  jobsState.page = 1;
  syncControls(elements);
  renderJobs();
}

function bindJobsEvents(elements) {
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFormValues(elements);
    renderJobs();
  });

  elements.sort.addEventListener("change", () => {
    jobsState.sort = elements.sort.value;
    jobsState.page = 1;
    renderJobs();
  });

  [elements.category, elements.location, elements.type].forEach((control) => {
    control.addEventListener("change", () => {
      applyFormValues(elements);
      renderJobs();
    });
  });

  elements.search.addEventListener("search", () => {
    applyFormValues(elements);
    renderJobs();
  });

  elements.clear.addEventListener("click", () => {
    resetFilters(elements);
  });

  elements.pagination.addEventListener("click", (event) => {
    const target = event.target.closest("[data-page]");

    if (!target) {
      return;
    }

    jobsState.page = Math.max(1, Number.parseInt(target.dataset.page || "1", 10) || 1);
    renderJobs();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initJobsPage() {
  if (!Array.isArray(jobs) || document.body.dataset.page !== "jobs") {
    return;
  }

  const elements = getJobsElements();

  fillSelectOptions(elements.category, uniqueValues("category"), "Semua kategori");
  fillSelectOptions(elements.location, uniqueValues("location"), "Semua lokasi");
  fillSelectOptions(elements.type, uniqueValues("type"), "Semua tipe");

  readParams();
  syncControls(elements);
  bindJobsEvents(elements);
  renderJobs();
}

document.addEventListener("DOMContentLoaded", () => {
  initJobsPage();
});
