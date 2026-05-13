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

function getSimilarJobs(currentJob) {
  return jobs
    .filter((job) => job.id !== currentJob.id)
    .sort((left, right) => {
      const leftScore =
        (left.category === currentJob.category ? 2 : 0) +
        (left.type === currentJob.type ? 1 : 0);
      const rightScore =
        (right.category === currentJob.category ? 2 : 0) +
        (right.type === currentJob.type ? 1 : 0);
      return rightScore - leftScore;
    })
    .slice(0, 5);
}

function getSkillTags(job) {
  return job.requirements
    .map((item) => item.replace(/^(Memahami|Memiliki|Mampu|Menguasai|Paham|Kemampuan|Siap)\s+/i, ""))
    .slice(0, 8);
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

function getSimilarJobCardMarkup(job, active) {
  const experience = getExperienceLevel(job);
  const accent = getBrandColor(job.company);

  return `
    <a class="similar-job-card ${active ? "is-active" : ""}" href="job-detail.html?id=${job.id}">
      <div class="similar-job-top">
        <div class="similar-job-brand" style="--brand-color:${accent}">
          ${getCompanyInitials(job.company)}
        </div>
        <span class="similar-job-rate">${formatHourlyRate(job.salary)}</span>
      </div>
      <h3>${job.title}</h3>
      <p class="similar-job-company">${job.company}</p>
      <p class="similar-job-meta">${job.location}</p>
      <div class="job-tags">
        <span class="job-tag job-tag-green">${job.type}</span>
        <span class="job-tag job-tag-${getExperienceTone(experience)}">${experience}</span>
      </div>
      <p class="similar-job-time">${getRelativePostedTime(job.postedDate)}</p>
    </a>
  `;
}

function renderDetailPage(root, job) {
  const saved = isJobSaved(job.id);
  const similarJobs = getSimilarJobs(job);
  const experience = getExperienceLevel(job);
  const accent = getBrandColor(job.company);
  const skills = getSkillTags(job);

  document.title = `${job.title} - ${job.company}`;

  root.innerHTML = `
    <section class="detail-hero-band px-3 px-lg-4">
      <div class="detail-hero-shell px-0 pt-5 pt-lg-4 pb-4">
        <div class="detail-hero-header">
          <a class="detail-back-link" href="jobs.html">&lt; Back to jobs</a>
        </div>

        <div class="detail-hero-main">
          <div class="detail-title-row">
            <div class="detail-company-mark" style="--brand-color:${accent}">
              ${getCompanyInitials(job.company)}
            </div>
            <div class="detail-title-copy">
              <h1 class="detail-title">${job.title}</h1>
              <div class="detail-meta-row">
                <span>${getMetaIcon("company")}${job.company}</span>
                <span>${getMetaIcon("location")}${job.type === "Remote" ? "Remote" : job.location}</span>
                <span>${getMetaIcon("time")}Posted ${getRelativePostedTime(job.postedDate)}</span>
              </div>
              <div class="detail-kicker">
                <span class="job-tag job-tag-green">${job.type}</span>
                <span class="job-tag job-tag-${getExperienceTone(experience)}">${experience}</span>
                <span class="job-tag job-tag-purple">${job.type === "Remote" || job.type === "Hybrid" ? "Remote" : job.category}</span>
              </div>
            </div>
          </div>

          <div class="detail-hero-actions">
            <button class="detail-action-icon" type="button" aria-label="Share job">
              ${getShareIcon()}
            </button>
            <button id="saveJobButtonIcon" class="detail-action-icon ${saved ? "is-saved" : ""}" type="button" data-job-id="${job.id}" aria-label="Save job">
              ${getBookmarkIcon()}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-content-shell px-3 px-lg-4 mt-4 mt-lg-5">
    <section class="detail-layout pb-4 pb-lg-5">
      <aside class="detail-left-rail">
        <h2>Similar Positions</h2>
        <div class="similar-jobs-list">
          ${[job, ...similarJobs].map((item) => getSimilarJobCardMarkup(item, item.id === job.id)).join("")}
        </div>
      </aside>

      <div class="detail-main-column">
        <section class="detail-stat-strip">
          <article class="detail-stat-box">
            <span class="detail-stat-label">Hourly Rate</span>
            <p class="detail-stat-value">${formatHourlyRate(job.salary)}</p>
          </article>
          <article class="detail-stat-box">
            <span class="detail-stat-label">Job Type</span>
            <p class="detail-stat-value">${job.type}</p>
          </article>
          <article class="detail-stat-box">
            <span class="detail-stat-label">Experience</span>
            <p class="detail-stat-value">${experience}</p>
          </article>
          <article class="detail-stat-box">
            <span class="detail-stat-label">Location</span>
            <p class="detail-stat-value">${job.type === "Remote" ? "Remote" : job.location}</p>
          </article>
        </section>

        <article class="detail-content-card">
          <h2>About the Role</h2>
          <p class="section-copy">${job.description}</p>
          <p class="section-copy">
            You'll work closely with product, design, and delivery teams to shape experiences
            that feel thoughtful, usable, and ready to ship.
          </p>
        </article>

        <article class="detail-content-card">
          <h2>Responsibilities</h2>
          <ul class="detail-list detail-list-check">
            ${job.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}
          </ul>
        </article>

        <article class="detail-content-card">
          <h2>Required Skills</h2>
          <div class="skills-grid">
            ${skills.map((skill) => `<span class="skill-pill">${skill}</span>`).join("")}
          </div>
        </article>
      </div>

      <aside class="detail-right-rail">
        <section class="detail-side-card detail-cta-card">
          <button
            class="button detail-cta-button"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#applySuccessModal"
          >
            Apply Now
          </button>
          <button
            id="saveJobButton"
            class="button button-outline detail-save-button ${saved ? "is-saved" : ""}"
            type="button"
            data-job-id="${job.id}"
          >
            ${saved ? "Saved Job" : "Save Job"}
          </button>
          <p class="detail-side-note">Applications close in 12 days</p>
        </section>

        <section class="detail-side-card">
          <h2>About ${job.company}</h2>
          <div class="company-overview">
            <div class="detail-company-mark detail-company-mark-small" style="--brand-color:${accent}">
              ${getCompanyInitials(job.company)}
            </div>
            <div class="company-rating">
              <span class="company-stars">★★★★</span>
              <strong>4.2</strong>
              <span>(312)</span>
            </div>
          </div>
          <div class="company-meta-list">
            <p><span>Industry</span><strong>${job.category}</strong></p>
            <p><span>Company Size</span><strong>5,000 - 10,000</strong></p>
            <p><span>Website</span><strong>www.${job.company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com</strong></p>
          </div>
        </section>

        <section class="detail-side-card">
          <h2>Benefits</h2>
          <ul class="detail-list detail-list-bullets">
            ${job.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
          </ul>
        </section>

        <section class="detail-side-card detail-related-card">
          <strong>+${similarJobs.length + 19} similar jobs</strong>
          <p>from ${job.company} available</p>
          <a href="jobs.html?category=${encodeURIComponent(job.category)}">View all</a>
        </section>
      </aside>
    </section>
    </section>
  `;
}

function bindApplyModal(job) {
  const successText = document.getElementById("applySuccessText");
  const successLink = document.getElementById("applySuccessLink");

  if (!successText || !successLink) {
    return;
  }

  successText.textContent = `Lamaran untuk ${job.title} di ${job.company} berhasil dikirim. Tim rekrutmen akan menghubungi kamu jika profil sesuai.`;
  successLink.href = `jobs.html?category=${encodeURIComponent(job.category)}`;
}

function updateSaveButtons(root, saved) {
  const textButton = root.querySelector("#saveJobButton");
  const iconButton = root.querySelector("#saveJobButtonIcon");

  if (textButton) {
    textButton.classList.toggle("is-saved", saved);
    textButton.textContent = saved ? "Saved Job" : "Save Job";
  }

  if (iconButton) {
    iconButton.classList.toggle("is-saved", saved);
  }
}

function bindSaveButton(root) {
  const buttons = root.querySelectorAll("[data-job-id]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const jobId = Number.parseInt(button.dataset.jobId || "", 10);

      if (Number.isNaN(jobId)) {
        return;
      }

      const saved = toggleSavedJob(jobId);
      updateSaveButtons(root, saved);
    });
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
  bindApplyModal(job);
  bindSaveButton(root);
}

document.addEventListener("DOMContentLoaded", () => {
  initDetailPage();
});
