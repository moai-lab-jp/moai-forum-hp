import { meetingsData } from './meetings_data.js';
import { timelineHtml } from './archive_render.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initArchiveTimeline();
  initHashRouter();
  initModalCloseEvents();
  initRegistrationForm();
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

  // 一覧はビルド時にも index.html へ静的に埋め込まれる（検索エンジン向け）。
  // 「詳細を見る」は各回の静的ページへのリンクだが、ページ内ではモーダルで開く。
  archiveTimeline.innerHTML = timelineHtml(meetingsData);

  archiveTimeline.querySelectorAll('.timeline-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Ctrl/Cmd+クリック等は通常のリンクとして静的ページを開く
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      openMeetingDetail(card.dataset.id);
    });
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
    
    // Remove Notion direct link wrappers if any
    const notionLinkWrapper = modalContent.querySelector('.notion-link-wrapper');
    if (notionLinkWrapper) {
      notionLinkWrapper.remove();
    }
    
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

// Next Event Registration Form Interaction
function initRegistrationForm() {
  const form = document.getElementById('eventRegistrationForm');
  const successCard = document.getElementById('registrationSuccessMessage');
  const submitBtn = document.getElementById('regSubmitBtn');
  const resetBtn = document.getElementById('regResetBtn');

  if (!form || !successCard) return;

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const participation = formData.get('participation');
    const name = formData.get('name');
    const affiliation = formData.get('affiliation');
    const email = formData.get('email');
    const comment = formData.get('comment');

    const participationText = participation === 'with_social' 
      ? '研究部会 ＋ 懇親会参加（会費：約4,000円）' 
      : '研究部会のみ参加（無料）';

    // Button loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>送信中...</span>';
    }

    // Simulate asynchronous submission
    setTimeout(() => {
      // Populate confirmation summary
      const nameEl = document.getElementById('successNameDisplay');
      const affilEl = document.getElementById('successAffiliationDisplay');
      const typeEl = document.getElementById('successTypeDisplay');
      const emailEl = document.getElementById('successEmailDisplay');

      if (nameEl) nameEl.textContent = name;
      if (affilEl) affilEl.textContent = affiliation;
      if (typeEl) typeEl.textContent = participationText;
      if (emailEl) emailEl.textContent = email;

      // Switch views
      form.style.display = 'none';
      successCard.style.display = 'flex';

      // Scroll smoothly into view
      successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>参加を申し込む</span> <i class="fa-solid fa-paper-plane"></i>';
      }

      console.log('Registration submitted:', {
        participation,
        participationText,
        name,
        affiliation,
        email,
        comment,
        timestamp: new Date().toISOString()
      });
    }, 600);
  });

  // Re-open form to modify or submit another
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      successCard.style.display = 'none';
      form.style.display = 'flex';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}
