/**
 * NeuralStack Solutions — Main JavaScript
 * Vanilla ES6 | Zero Dead Code | Security-First (Zero eval / innerHTML injection)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFormValidation();
  initActiveNavSpy();
});

/**
 * Initializes mobile navigation drawer, hamburger button state, and outside-click handling.
 */
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (!navToggle || !primaryNav) return;

  function toggleMenu(forceClose = false) {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isExpanded;

    navToggle.setAttribute('aria-expanded', String(shouldOpen));
    navToggle.classList.toggle('is-active', shouldOpen);
    primaryNav.classList.toggle('is-open', shouldOpen);
  }

  navToggle.addEventListener('click', () => {
    toggleMenu();
  });

  // Close navigation when clicking any anchor link inside it
  const navLinks = primaryNav.querySelectorAll('.nav-link, .btn');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  // Close navigation when pressing Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      toggleMenu(true);
      navToggle.focus();
    }
  });

  // Close navigation when clicking outside header
  document.addEventListener('click', (event) => {
    const header = document.getElementById('top');
    if (header && !header.contains(event.target)) {
      toggleMenu(true);
    }
  });
}

/**
 * Initializes accessible client-side form validation and static submission handling.
 */
function initFormValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  const nameFeedback = document.getElementById('name-feedback');
  const emailFeedback = document.getElementById('email-feedback');
  const messageFeedback = document.getElementById('message-feedback');
  const formStatus = document.getElementById('form-status');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input, feedbackEl, condition, errorMessage) {
    if (!condition) {
      input.classList.add('is-invalid');
      feedbackEl.textContent = errorMessage;
      feedbackEl.classList.add('is-visible');
      return false;
    }
    input.classList.remove('is-invalid');
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('is-visible');
    return true;
  }

  // Real-time validation on input blur
  if (nameInput && nameFeedback) {
    nameInput.addEventListener('blur', () => {
      validateField(nameInput, nameFeedback, nameInput.value.trim().length >= 2, 'Please enter your full name.');
    });
  }

  if (emailInput && emailFeedback) {
    emailInput.addEventListener('blur', () => {
      validateField(emailInput, emailFeedback, emailRegex.test(emailInput.value.trim()), 'Please enter a valid email address.');
    });
  }

  if (messageInput && messageFeedback) {
    messageInput.addEventListener('blur', () => {
      validateField(messageInput, messageFeedback, messageInput.value.trim().length >= 10, 'Please enter a message with at least 10 characters.');
    });
  }

  // Form submission validation
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const isNameValid = validateField(
      nameInput,
      nameFeedback,
      nameInput.value.trim().length >= 2,
      'Please enter your full name.'
    );

    const isEmailValid = validateField(
      emailInput,
      emailFeedback,
      emailRegex.test(emailInput.value.trim()),
      'Please enter a valid work email address.'
    );

    const isMessageValid = validateField(
      messageInput,
      messageFeedback,
      messageInput.value.trim().length >= 10,
      'Please describe your project (minimum 10 characters).'
    );

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      // Focus first invalid element
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Process valid submission
    const formAction = form.getAttribute('action') || '';
    if (formAction.includes('[ADD_FORM_ID]')) {
      formStatus.className = 'form-status is-success';
      formStatus.textContent = 'Message validated successfully! (Connect Formspree ID or Netlify Forms to receive emails).';
      form.reset();
    } else {
      // Production form handler (FormSubmit / Formspree)
      const submitBtn = document.getElementById('submit-btn');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      fetch(formAction, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then((response) => {
          if (response.ok) {
            formStatus.className = 'form-status is-success';
            formStatus.textContent = 'Thank you! Your message has been sent directly to our team. We will respond within one business day.';
            form.reset();
          } else {
            throw new Error('Form submission failed.');
          }
        })
        .catch(() => {
          formStatus.className = 'form-status is-error';
          formStatus.textContent = 'Unable to send message directly right now. Please email us directly at kuldeeppoonia20298@gmail.com.';
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    }
  });
}

/**
 * Highlights active navigation link based on current scroll position using IntersectionObserver.
 */
function initActiveNavSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!('IntersectionObserver' in window) || sections.length === 0 || navLinks.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    }
  );

  sections.forEach((section) => observer.observe(section));
}
