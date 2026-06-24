import { meetingsData } from './meetings_data.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initArchiveTimeline();
  initHashRouter();
  initModalCloseEvents();
});

// Mobile Navigation Menu Toggle
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

// Generate Archive Timeline dynamically from meetingsData
function initArchiveTimeline() {
  const archiveTimeline = document.getElementById('archiveTimeline');
  if (!archiveTimeline) return;

  archiveTimeline.innerHTML = '';

  meetingsData.forEach(meeting => {
    // Generate simple readable tag for display
    let tag = `第 ${meeting.num} 回`;
    if (meeting.num === 99) {
      tag = 'シンポジウム';
    }

    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-card glass">
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-tag">${tag}</span>
            <h3 class="timeline-title">${meeting.name.replace('SUB-PAGE Link', '').trim()}</h3>
          </div>
          <div class="timeline-details">
            <span><i class="fa-regular fa-calendar"></i> ${meeting.date}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${meeting.location}</span>
            ${meeting.participants ? `<span><i class="fa-solid fa-users"></i> ${meeting.participants}</span>` : ''}
          </div>
        </div>
        <div class="timeline-actions">
          <a href="${meeting.notionUrl}" target="_blank" class="btn btn-outline btn-sm notion-icon-link" aria-label="Notionで元のページを開く" title="Notionで元のページを開く">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <button class="btn btn-outline btn-sm view-details-btn" data-id="${meeting.id}">
            詳細を見る <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    // Add click handler to open details
    const btn = item.querySelector('.view-details-btn');
    btn.addEventListener('click', () => {
      openMeetingDetail(meeting.id);
    });

    archiveTimeline.appendChild(item);
  });
}

// Open modal and render meeting detail
function openMeetingDetail(meetingId, updateHash = true) {
  const meeting = meetingsData.find(m => m.id.replace(/-/g, '') === meetingId.replace(/-/g, ''));
  if (!meeting) return;

  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalContent = document.getElementById('modalContent');
  
  if (modalBackdrop && modalContent) {
    // Render dynamic HTML contents
    modalContent.innerHTML = meeting.html;
    
    // Add slide link behavior correction if any
    const links = modalContent.querySelectorAll('a');
    links.forEach(l => {
      if (l.textContent.includes('[file]') || l.textContent.includes('pdf')) {
        l.innerHTML = `<i class="fa-regular fa-file-pdf"></i> ${l.textContent.replace('[file]', '').trim()}`;
      }
    });

    // Show modal
    modalBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden'; // lock scroll

    // Update URL hash for sharing / routing
    if (updateHash) {
      window.location.hash = `/archive/${meeting.id}`;
    }
  }
}

// Close Modal
function closeModal() {
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop && modalBackdrop.classList.contains('show')) {
    modalBackdrop.classList.remove('show');
    document.body.style.overflow = ''; // unlock scroll
    
    // Clear hash route safely without jumping the page
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

// Setup close modal triggers
function initModalCloseEvents() {
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      // close if clicked outside window
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Escape key close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// Hash-based Routing for specific meetings
function initHashRouter() {
  const handleRouting = () => {
    const hash = window.location.hash;
    const match = hash.match(/^#\/archive\/([a-zA-Z0-9\-]+)$/);
    
    if (match && match[1]) {
      const meetingId = match[1];
      openMeetingDetail(meetingId, false);
    } else {
      closeModal();
    }
  };

  // Run on load and hashchange
  window.addEventListener('hashchange', handleRouting);
  handleRouting();
}
