const JOBS_PER_PAGE = 9;

const jobsState = {
  search: "",
  category: "",
  location: "",
  type: "",
  sort: "newest",
  page: 1,
  experience: "",
  salaryMin: 0,
  salaryMax: 0,
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
    typeOptions: document.getElementById("typeFilterOptions"),
    experienceOptions: document.getElementById("experienceFilterOptions"),
    salaryMinInput: document.getElementById("salaryMinInput"),
    salaryMaxInput: document.getElementById("salaryMaxInput"),
    salaryMinLabel: document.getElementById("salaryMinLabel"),
    salaryMaxLabel: document.getElementById("salaryMaxLabel"),
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

function getExperienceOptions() {
  const counts = jobs.reduce((map, job) => {
    const level = getExperienceLevel(job);
    map[level] = (map[level] || 0) + 1;
    return map;
  }, {});

  return ["Entry Level", "Intermediate", "Senior", "Expert"].map((level) => ({
    label: level,
    count: counts[level] || 0,
  }));
}

function getSalaryBounds() {
  const salaries = jobs.map((job) => job.salary);
  return {
    min: Math.floor(Math.min(...salaries) / 1000000),
    max: Math.ceil(Math.max(...salaries) / 1000000),
  };
}

function formatSalaryTick(value) {
  return `$${value}k`;
}

function readParams(bounds) {
  const params = new URLSearchParams(window.location.search);

  jobsState.search = params.get("search") || "";
  jobsState.category = params.get("category") || "";
  jobsState.location = params.get("location") || "";
  jobsState.type = params.get("type") || "";
  jobsState.sort = params.get("sort") || "newest";
  jobsState.experience = params.get("experience") || "";
  jobsState.salaryMin = Number.parseInt(params.get("salaryMin") || `${bounds.min}`, 10) || bounds.min;
  jobsState.salaryMax = Number.parseInt(params.get("salaryMax") || `${bounds.max}`, 10) || bounds.max;
  jobsState.page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
}

function writeParams(bounds) {
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

  if (jobsState.experience) {
    params.set("experience", jobsState.experience);
  }

  if (jobsState.salaryMin !== bounds.min) {
    params.set("salaryMin", String(jobsState.salaryMin));
  }

  if (jobsState.salaryMax !== bounds.max) {
    params.set("salaryMax", String(jobsState.salaryMax));
  }

  if (jobsState.page > 1) {
    params.set("page", String(jobsState.page));
  }

  const query = params.toString();
  window.history.replaceState({}, "", query ? `jobs.html?${query}` : "jobs.html");
}

function syncControls(elements) {
  elements.search.value = jobsState.search;
  elements.category.value = jobsState.category;
  elements.location.value = jobsState.location;
  elements.type.value = jobsState.type;
  elements.sort.value = jobsState.sort;
  elements.salaryMinInput.value = jobsState.salaryMin;
  elements.salaryMaxInput.value = jobsState.salaryMax;
}

function renderTypeOptions(elements) {
  const types = uniqueValues("type");

  elements.typeOptions.innerHTML = types
    .map(
      (type) => `
        <label class="filter-option">
          <input type="checkbox" value="${type}" data-filter-type="type" ${
            jobsState.type === type ? "checked" : ""
          }>
          <span class="filter-option-box"></span>
          <span class="filter-option-label">${type}</span>
        </label>
      `
    )
    .join("");
}

function renderExperienceOptions(elements) {
  elements.experienceOptions.innerHTML = getExperienceOptions()
    .map(
      (option) => `
        <label class="filter-option filter-option-counted">
          <input type="checkbox" value="${option.label}" data-filter-type="experience" ${
            jobsState.experience === option.label ? "checked" : ""
          }>
          <span class="filter-option-box"></span>
          <span class="filter-option-label">${option.label}</span>
          <span class="filter-option-count">${option.count}</span>
        </label>
      `
    )
    .join("");
}

function renderSalaryLabels(elements) {
  elements.salaryMinLabel.textContent = formatSalaryTick(jobsState.salaryMin);
  elements.salaryMaxLabel.textContent = formatSalaryTick(jobsState.salaryMax);
}

function normalizeSalaryRange(bounds) {
  jobsState.salaryMin = Math.max(bounds.min, Math.min(jobsState.salaryMin, jobsState.salaryMax));
  jobsState.salaryMax = Math.min(bounds.max, Math.max(jobsState.salaryMax, jobsState.salaryMin));
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
    const matchesExperience =
      !jobsState.experience || getExperienceLevel(job) === jobsState.experience;
    const salaryInMillions = Math.round(job.salary / 1000000);
    const matchesSalary =
      salaryInMillions >= jobsState.salaryMin && salaryInMillions <= jobsState.salaryMax;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesType &&
      matchesExperience &&
      matchesSalary
    );
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

function formatActiveFilters(bounds) {
  const chips = [];

  if (jobsState.search) {
    chips.push(`Keyword: ${jobsState.search}`);
  }

  if (jobsState.type) {
    chips.push(`Type: ${jobsState.type}`);
  }

  if (jobsState.experience) {
    chips.push(`Experience: ${jobsState.experience}`);
  }

  if (jobsState.category) {
    chips.push(`Category: ${jobsState.category}`);
  }

  if (jobsState.location) {
    chips.push(`Location: ${jobsState.location}`);
  }

  if (jobsState.salaryMin !== bounds.min || jobsState.salaryMax !== bounds.max) {
    chips.push(`Salary: ${formatSalaryTick(jobsState.salaryMin)} - ${formatSalaryTick(jobsState.salaryMax)}`);
  }

  return chips;
}

function renderActiveFilters(elements, bounds) {
  const chips = formatActiveFilters(bounds);
  elements.activeFilters.innerHTML = chips
    .map((chip) => `<span class="filter-chip">${chip}</span>`)
    .join("");
  elements.activeFilters.hidden = chips.length === 0;
}

function renderPagination(elements, totalPages) {
  if (totalPages <= 1) {
    elements.pagination.innerHTML = "";
    return;
  }

  const buttons = [];
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

  elements.pagination.innerHTML = buttons.join("");
}

function renderJobs(bounds) {
  const elements = getJobsElements();
  const filteredJobs = filterJobs();
  const sortedJobs = sortJobs(filteredJobs);
  const { pageItems, totalPages } = paginateJobs(sortedJobs);

  elements.heading.textContent = `${filteredJobs.length} jobs found`;
  elements.count.textContent =
    filteredJobs.length === 0
      ? "No matching roles with the current filters"
      : "Showing results based on your filters";

  renderActiveFilters(elements, bounds);
  renderSalaryLabels(elements);
  renderPagination(elements, totalPages);
  renderTypeOptions(elements);
  renderExperienceOptions(elements);

  if (pageItems.length === 0) {
    elements.container.innerHTML = "";
    elements.emptyState.hidden = false;
    writeParams(bounds);
    return;
  }

  elements.emptyState.hidden = true;
  elements.container.innerHTML = pageItems.map((job) => getJobCardMarkup(job)).join("");
  writeParams(bounds);
}

function resetFilters(elements, bounds) {
  jobsState.search = "";
  jobsState.category = "";
  jobsState.location = "";
  jobsState.type = "";
  jobsState.sort = "newest";
  jobsState.page = 1;
  jobsState.experience = "";
  jobsState.salaryMin = bounds.min;
  jobsState.salaryMax = bounds.max;
  syncControls(elements);
  renderJobs(bounds);
}

function bindCheckboxFilters(elements, bounds) {
  elements.form.addEventListener("change", (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    if (input.dataset.filterType === "type") {
      jobsState.type = input.checked ? input.value : "";
      elements.type.value = jobsState.type;
      jobsState.page = 1;
      renderJobs(bounds);
      return;
    }

    if (input.dataset.filterType === "experience") {
      jobsState.experience = input.checked ? input.value : "";
      jobsState.page = 1;
      renderJobs(bounds);
      return;
    }
  });
}

function bindJobsEvents(elements, bounds) {
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    jobsState.search = elements.search.value.trim();
    jobsState.page = 1;
    renderJobs(bounds);
  });

  elements.search.addEventListener("search", () => {
    jobsState.search = elements.search.value.trim();
    jobsState.page = 1;
    renderJobs(bounds);
  });

  elements.sort.addEventListener("change", () => {
    jobsState.sort = elements.sort.value;
    jobsState.page = 1;
    renderJobs(bounds);
  });

  [elements.salaryMinInput, elements.salaryMaxInput].forEach((input) => {
    input.addEventListener("change", () => {
      jobsState.salaryMin = Number.parseInt(elements.salaryMinInput.value || `${bounds.min}`, 10);
      jobsState.salaryMax = Number.parseInt(elements.salaryMaxInput.value || `${bounds.max}`, 10);
      normalizeSalaryRange(bounds);
      jobsState.page = 1;
      renderJobs(bounds);
    });
  });

  elements.clear.addEventListener("click", () => {
    resetFilters(elements, bounds);
  });

  elements.pagination.addEventListener("click", (event) => {
    const target = event.target.closest("[data-page]");

    if (!target) {
      return;
    }

    jobsState.page = Math.max(1, Number.parseInt(target.dataset.page || "1", 10) || 1);
    renderJobs(bounds);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  bindCheckboxFilters(elements, bounds);
}

function initJobsPage() {
  if (!Array.isArray(jobs) || document.body.dataset.page !== "jobs") {
    return;
  }

  const elements = getJobsElements();
  const bounds = getSalaryBounds();

  fillSelectOptions(elements.category, uniqueValues("category"), "Semua kategori");
  fillSelectOptions(elements.location, uniqueValues("location"), "Semua lokasi");
  fillSelectOptions(elements.type, uniqueValues("type"), "Semua tipe");

  readParams(bounds);
  normalizeSalaryRange(bounds);
  syncControls(elements);
  bindJobsEvents(elements, bounds);
  renderJobs(bounds);
}

document.addEventListener("DOMContentLoaded", () => {
  initJobsPage();
});
