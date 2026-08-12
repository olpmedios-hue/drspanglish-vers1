if (window.lucide) lucide.createIcons();

const menuButton = document.querySelector('.menu-btn');
const navigation = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('menu-open', isOpen);
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

const track = document.querySelector('.test-track');
const testimonialViewport = document.querySelector('.test-viewport');
const originalCards = [...track.children];
const sliderReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentSlide = 0;
let autoplayTimer;

originalCards.forEach(card => {
  const clone = card.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);
});

function cardDistance() {
  return originalCards[0].getBoundingClientRect().width + 8;
}

function updateSlider(animate = true) {
  track.style.transition = animate ? 'transform .55s cubic-bezier(.2,.75,.2,1)' : 'none';
  track.style.transform = `translateX(-${currentSlide * cardDistance()}px)`;
}

function nextSlide() {
  currentSlide += 1;
  updateSlider();
}

function previousSlide() {
  if (currentSlide === 0) {
    currentSlide = originalCards.length;
    updateSlider(false);
    track.getBoundingClientRect();
  }
  currentSlide -= 1;
  updateSlider();
}

function stopAutoplay() {
  clearInterval(autoplayTimer);
}

function startAutoplay() {
  stopAutoplay();
  if (!sliderReducedMotion && !document.hidden) autoplayTimer = setInterval(nextSlide, 3800);
}

track.addEventListener('transitionend', event => {
  if (event.propertyName !== 'transform' || currentSlide !== originalCards.length) return;
  currentSlide = 0;
  updateSlider(false);
});

document.querySelector('.test-next').addEventListener('click', event => {
  event.stopPropagation();
  nextSlide();
  startAutoplay();
});

document.querySelector('.test-prev').addEventListener('click', event => {
  event.stopPropagation();
  previousSlide();
  startAutoplay();
});

testimonialViewport.addEventListener('click', () => {
  nextSlide();
  startAutoplay();
});
testimonialViewport.addEventListener('mouseenter', stopAutoplay);
testimonialViewport.addEventListener('mouseleave', startAutoplay);
testimonialViewport.addEventListener('focusin', stopAutoplay);
testimonialViewport.addEventListener('focusout', startAutoplay);
document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());
window.addEventListener('resize', () => updateSlider(false));
startAutoplay();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrambleCharacters = '0123456789#%+?';

function runScramble(element) {
  const target = element.dataset.scramble || element.textContent.trim();
  element.setAttribute('aria-label', target);
  if (reduceMotion) {
    element.textContent = target;
    return;
  }
  const started = performance.now();
  const duration = 720 + target.length * 65;
  const tick = now => {
    const progress = Math.min((now - started) / duration, 1);
    const resolved = Math.floor(progress * target.length);
    element.textContent = [...target].map((character, index) => {
      if (character === ',' || character === ' ') return character;
      if (index < resolved || progress === 1) return character;
      return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
    }).join('');
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const scrambleObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    runScramble(entry.target);
    scrambleObserver.unobserve(entry.target);
  });
}, { threshold: 0.55 });

document.querySelectorAll('[data-scramble]').forEach(item => scrambleObserver.observe(item));

const hero = document.querySelector('.hero');
const particleCanvas = document.querySelector('.hero-particles');

if (hero && particleCanvas && !reduceMotion) {
  const context = particleCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let particles = [];

  function resizeParticles() {
    const bounds = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    particleCanvas.width = Math.round(width * ratio);
    particleCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const total = Math.max(28, Math.min(58, Math.round(width / 24)));
    particles = Array.from({ length: total }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + .35,
      speedX: (Math.random() - .5) * .18,
      speedY: (Math.random() - .5) * .14,
      color: Math.random() > .48 ? '52, 213, 240' : '183, 79, 235'
    }));
  }

  function drawParticles() {
    context.clearRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      particle.x += particle.speedX + pointerX * .012;
      particle.y += particle.speedY + pointerY * .008;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${particle.color}, .62)`;
      context.fill();
      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
        const other = particles[otherIndex];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 92) continue;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(${particle.color}, ${(1 - distance / 92) * .11})`;
        context.lineWidth = .5;
        context.stroke();
      }
    });
    requestAnimationFrame(drawParticles);
  }

  hero.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - .5;
    pointerY = (event.clientY - bounds.top) / bounds.height - .5;
  });
  hero.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
  });
  window.addEventListener('resize', resizeParticles);
  resizeParticles();
  drawParticles();
}

const courseSearch = document.querySelector('#course-search');
const courseLevel = document.querySelector('#course-level');
const courseFilterButtons = [...document.querySelectorAll('[data-course-filter]')];
const courseCards = [...document.querySelectorAll('.course-card')];
const courseCount = document.querySelector('#course-count');
const courseGrid = document.querySelector('.course-grid');
const courseEmpty = document.querySelector('.course-empty');
const courseReset = document.querySelector('#course-reset');
const coursePagination = document.querySelector('.course-pagination');
const coursePageNumbers = document.querySelector('.page-numbers');
const coursePrev = document.querySelector('.page-prev');
const courseNext = document.querySelector('.page-next');
const coursesPerPage = 4;
let activeCourseFilter = 'todos';
let currentCoursePage = 1;

function normalizeCourseText(value) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterCourses() {
  if (!courseSearch || !courseLevel) return;
  const query = normalizeCourseText(courseSearch.value.trim());
  const selectedLevel = courseLevel.value;
  const matchingCards = courseCards.filter(card => {
    const searchableText = normalizeCourseText(`${card.dataset.title} ${card.textContent}`);
    const categories = card.dataset.category.split(' ');
    const matchesQuery = !query || searchableText.includes(query);
    const matchesCategory = activeCourseFilter === 'todos' || categories.includes(activeCourseFilter);
    const matchesLevel = selectedLevel === 'todos' || card.dataset.level === selectedLevel;
    return matchesQuery && matchesCategory && matchesLevel;
  });
  const pageCount = Math.ceil(matchingCards.length / coursesPerPage);
  currentCoursePage = Math.min(Math.max(currentCoursePage, 1), pageCount || 1);
  const pageStart = (currentCoursePage - 1) * coursesPerPage;
  const visibleCards = matchingCards.slice(pageStart, pageStart + coursesPerPage);

  courseCards.forEach(card => {
    const shouldShow = visibleCards.includes(card);
    card.hidden = !shouldShow;
    if (shouldShow) {
      card.classList.remove('filtering-in');
      requestAnimationFrame(() => card.classList.add('filtering-in'));
    }
  });

  const resultCount = matchingCards.length;
  courseCount.textContent = `${resultCount} ${resultCount === 1 ? 'programa disponible' : 'programas disponibles'}`;
  courseGrid.hidden = resultCount === 0;
  courseEmpty.hidden = resultCount !== 0;
  renderCoursePagination(pageCount);
}

function renderCoursePagination(pageCount) {
  if (!coursePagination || !coursePageNumbers) return;
  coursePagination.hidden = pageCount <= 1;
  coursePageNumbers.replaceChildren();
  for (let page = 1; page <= pageCount; page += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = page;
    button.classList.toggle('active', page === currentCoursePage);
    button.setAttribute('aria-label', `Ir a la página ${page}`);
    if (page === currentCoursePage) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => {
      currentCoursePage = page;
      filterCourses();
    });
    coursePageNumbers.append(button);
  }
  coursePrev.disabled = currentCoursePage === 1;
  courseNext.disabled = currentCoursePage === pageCount;
}

courseFilterButtons.forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    activeCourseFilter = button.dataset.courseFilter;
    courseFilterButtons.forEach(item => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    currentCoursePage = 1;
    filterCourses();
  });
});

courseSearch?.addEventListener('input', () => {
  currentCoursePage = 1;
  filterCourses();
});
courseLevel?.addEventListener('change', () => {
  currentCoursePage = 1;
  filterCourses();
});
coursePrev?.addEventListener('click', () => {
  if (currentCoursePage > 1) {
    currentCoursePage -= 1;
    filterCourses();
  }
});
courseNext?.addEventListener('click', () => {
  currentCoursePage += 1;
  filterCourses();
});
courseReset?.addEventListener('click', () => {
  courseSearch.value = '';
  courseLevel.value = 'todos';
  activeCourseFilter = 'todos';
  currentCoursePage = 1;
  courseFilterButtons.forEach(button => {
    const isActive = button.dataset.courseFilter === 'todos';
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  filterCourses();
  courseSearch.focus();
});

filterCourses();
