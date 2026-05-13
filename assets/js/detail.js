const SAVED_JOBS_KEY = "hireup-saved-jobs";

function getSavedJobIds() {
  try {
    const rawValue = window.localStorage.getItem(SAVED_JOBS_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function setSavedJobIds(savedIds) {
  window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedIds));
}

function isJobSaved(jobId) {
  return getSavedJobIds().includes(jobId);
}

function toggleSavedJob(jobId) {
  const savedIds = getSavedJobIds();
  const nextSavedIds = savedIds.includes(jobId)
    ? savedIds.filter((savedId) => savedId !== jobId)
    : [...savedIds, jobId];

  setSavedJobIds(nextSavedIds);
  return nextSavedIds.includes(jobId);
}

function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number.parseInt(params.get("id") || "", 10);
}

function findJobById(jobId) {
  if (!Array.isArray(jobs) || Number.isNaN(jobId)) {
    return null;
  }

  return jobs.find((job) => job.id === jobId) || null;
}

function renderErrorState(root) {
  document.title = "Pekerjaan tidak ditemukan";
  root.innerHTML = `
    <section class="detail-error">
      <p class="hero-kicker jobs-kicker">Error State</p>
      <h1>Pekerjaan tidak ditemukan</h1>
      <p>
        Lowongan yang kamu cari mungkin sudah dihapus atau URL yang dibuka tidak valid.
      </p>
      <a class="button" href="jobs.html">Kembali ke daftar lowongan</a>
    </section>
  `;
}

function renderDetailPage(root, job) {
  const saved = isJobSaved(job.id);
  document.title = `${job.title} - ${job.company}`;

  root.innerHTML = `
    <section class="detail-hero">
      <article class="detail-hero-card">
        <div class="detail-kicker">
          <span class="job-badge">${job.category}</span>
          <span class="job-badge">${job.type}</span>
        </div>
        <h1 class="detail-title">${job.title}</h1>
        <p class="detail-company">${job.company} · ${job.location}</p>
        <p class="section-copy">${job.description}</p>
        <div class="detail-actions">
          <button
            id="saveJobButton"
            class="button button-save ${saved ? "is-saved" : ""}"
            type="button"
            data-job-id="${job.id}"
          >
            ${saved ? "Tersimpan" : "Save Job"}
          </button>
          <a class="button button-outline" href="jobs.html">Kembali ke Lowongan</a>
        </div>
      </article>

      <aside class="detail-side-card">
        <div class="detail-stat">
          <span class="detail-stat-label">Gaji</span>
          <p class="detail-stat-value">${job.salaryText}</p>
        </div>
        <div class="detail-stat">
          <span class="detail-stat-label">Tipe kerja</span>
          <p class="detail-stat-value">${job.type}</p>
        </div>
        <div class="detail-stat">
          <span class="detail-stat-label">Lokasi</span>
          <p class="detail-stat-value">${job.location}</p>
        </div>
        <div class="detail-stat">
          <span class="detail-stat-label">Diposting</span>
          <p class="detail-stat-value">${job.postedDate}</p>
        </div>
      </aside>
    </section>

    <section class="detail-grid">
      <div class="detail-main">
        <article class="detail-section">
          <h2>Tentang Peran</h2>
          <p class="section-copy">${job.description}</p>
        </article>

        <article class="detail-section">
          <h2>Requirement</h2>
          <ul class="detail-list">
            ${job.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}
          </ul>
        </article>
      </div>

      <aside class="detail-main">
        <article class="detail-section">
          <h2>Benefit</h2>
          <ul class="detail-list">
            ${job.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
          </ul>
        </article>

        <article class="detail-section">
          <h2>Aksi Cepat</h2>
          <p class="section-copy">
            Simpan lowongan ini agar mudah kamu temukan lagi saat membandingkan beberapa opsi.
          </p>
          <a class="button job-card-link" href="jobs.html?category=${encodeURIComponent(job.category)}">
            Lihat lowongan serupa
          </a>
        </article>
      </aside>
    </section>
  `;
}

function bindSaveButton(root) {
  const saveButton = root.querySelector("#saveJobButton");

  if (!saveButton) {
    return;
  }

  saveButton.addEventListener("click", () => {
    const jobId = Number.parseInt(saveButton.dataset.jobId || "", 10);

    if (Number.isNaN(jobId)) {
      return;
    }

    const saved = toggleSavedJob(jobId);
    saveButton.classList.toggle("is-saved", saved);
    saveButton.textContent = saved ? "Tersimpan" : "Save Job";
  });
}

function initDetailPage() {
  if (document.body.dataset.page !== "detail") {
    return;
  }

  const root = document.getElementById("jobDetailRoot");

  if (!root) {
    return;
  }

  const jobId = getJobIdFromUrl();
  const job = findJobById(jobId);

  if (!job) {
    renderErrorState(root);
    return;
  }

  renderDetailPage(root, job);
  bindSaveButton(root);
}

document.addEventListener("DOMContentLoaded", () => {
  initDetailPage();
});
