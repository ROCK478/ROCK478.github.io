(() => {
  const track = document.querySelector('#carousel-track');
  const slides = [...track.querySelectorAll('.achievement-slide')];
  const previous = document.querySelector('#previous-slide');
  const next = document.querySelector('#next-slide');
  const counter = document.querySelector('#current-slide');
  const picker = document.querySelector('#slide-picker');
  const dialog = document.querySelector('#document-dialog');
  const expanded = document.querySelector('#expanded-document');
  const zoomArea = document.querySelector('.document-zoom');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let frame = 0;
  let wheelLockedUntil = 0;
  let lastWheel = 0;
  let accumulatedWheel = 0;
  let zoom = 1;

  function update(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    counter.textContent = String(current + 1).padStart(2, '0');
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    picker.value = String(current + 1);
    picker.setAttribute('aria-valuetext', `${current + 1} из ${slides.length}: ${slides[current].querySelector('h3').textContent}`);
    slides.forEach((slide, i) => {
      slide.inert = i !== current;
      slide.setAttribute('aria-hidden', String(i !== current));
    });
  }

  function goTo(index, instant = false) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    update(target);
    track.scrollTo({left: target * track.clientWidth, behavior: instant || reduceMotion.matches ? 'instant' : 'smooth'});
  }

  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  picker.addEventListener('input', () => goTo(Number(picker.value) - 1, true));
  track.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      // A smooth transition may temporarily pass through another slide.
      if (Math.abs(track.scrollLeft - index * track.clientWidth) < 2) update(index);
    });
  }, {passive: true});
  track.addEventListener('keydown', event => {
    const actions = {ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: slides.length - 1};
    if (!(event.key in actions)) return;
    event.preventDefault();
    goTo(actions[event.key]);
  });
  track.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.7 || !event.deltaY) return;
    const direction = Math.sign(event.deltaY);
    // At either end, ordinary page scrolling continues to the next section.
    if ((current === 0 && direction < 0) || (current === slides.length - 1 && direction > 0)) return;
    event.preventDefault();
    const now = performance.now();
    if (now < wheelLockedUntil) return;
    if (now - lastWheel > 180 || Math.sign(accumulatedWheel) !== direction) accumulatedWheel = 0;
    lastWheel = now;
    accumulatedWheel += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientHeight : 1);
    if (Math.abs(accumulatedWheel) < 24) return;
    accumulatedWheel = 0;
    wheelLockedUntil = now + 650;
    goTo(current + direction);
  }, {passive: false});
  let gesture = null;
  let suppressClickUntil = 0;
  track.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    gesture = {x: event.clientX, y: event.clientY, left: track.scrollLeft, index: current};
  });
  track.addEventListener('pointerup', event => {
    if (!gesture) return;
    const start = gesture;
    gesture = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    suppressClickUntil = performance.now() + 350;
    // Touch devices already scroll natively; this also supports dragging with a mouse.
    if (Math.abs(track.scrollLeft - start.left) < 8) goTo(start.index + (dx < 0 ? 1 : -1));
  });
  track.addEventListener('pointercancel', () => {gesture = null;});
  track.addEventListener('click', event => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
  let oldWidth = track.clientWidth;
  new ResizeObserver(() => {
    if (track.clientWidth === oldWidth) return;
    oldWidth = track.clientWidth;
    goTo(current, true);
  }).observe(track);

  function setZoom(value) {
    zoom = Math.max(1, Math.min(3, value));
    expanded.style.width = `${zoom * 100}%`;
    document.querySelector('#zoom-out').disabled = zoom === 1;
    document.querySelector('#zoom-in').disabled = zoom === 3;
  }
  document.querySelectorAll('[data-document]').forEach(button => {
    button.addEventListener('click', () => {
      const slide = slides[Number(button.dataset.document)];
      const image = slide.querySelector('img');
      document.querySelector('#document-title').textContent = slide.querySelector('h3').textContent;
      expanded.src = image.src;
      expanded.alt = image.alt;
      setZoom(1);
      dialog.showModal();
      document.body.classList.add('document-open');
      zoomArea.scrollTo(0, 0);
      document.querySelector('#close-document').focus();
    });
  });
  document.querySelector('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.5));
  document.querySelector('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.5));
  document.querySelector('#close-document').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('document-open'));
  update(0);
})();
