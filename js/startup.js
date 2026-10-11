// Show a useful message if app files are missing instead of an indefinite loader.
window.addEventListener('error', function (event) {
  const content = document.getElementById('content');
  if (!content || !content.querySelector('.loading')) return;
  document.body.classList.remove('td-loading', 'td-guest');
  document.getElementById('landing').hidden = true;
  const heading = document.createElement('h2');
  heading.textContent = 'The app could not start.';
  const message = document.createElement('p');
  message.textContent = 'Extract the entire TeacherDesk folder before opening index.html. Keep the js, css, and assets folders beside it. ' + (event.message || 'One of the application files could not load.');
  content.className = 'workspace';
  content.replaceChildren(heading, message);
}, true);

// Home dashboard horizontal lanes: wheel/trackpad, touch swipe, and mouse drag.
// Uses event delegation because the app re-renders its cards after edits.
(() => {
  const laneFor = el => el?.closest?.('.home-board .websites-scroll, .home-board .quick-grid');
  let dragging = null;
  let suppressNextClick = false;
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
    const lane = laneFor(event.target);
    if (!lane || lane.scrollWidth <= lane.clientWidth) return;
    dragging = { lane, x: event.clientX, scrollLeft: lane.scrollLeft, moved: false };
  });
  document.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - dragging.x;
    if (!dragging.moved && Math.abs(distance) < 7) return;
    dragging.moved = true;
    dragging.lane.scrollLeft = dragging.scrollLeft - distance;
    event.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', () => {
    if (dragging?.moved) suppressNextClick = true;
    dragging = null;
  });
  document.addEventListener('pointercancel', () => { dragging = null; });
  document.addEventListener('dragstart', event => {
    if (dragging && laneFor(event.target)) event.preventDefault();
  });
  document.addEventListener('click', event => {
    if (!suppressNextClick) return;
    suppressNextClick = false;
    if (laneFor(event.target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('wheel', event => {
    const lane = laneFor(event.target);
    if (!lane || lane.scrollWidth <= lane.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const change = event.deltaY;
    const remaining = lane.scrollWidth - lane.clientWidth;
    if ((change > 0 && lane.scrollLeft < remaining - 1) || (change < 0 && lane.scrollLeft > 1)) {
      lane.scrollLeft += change;
      event.preventDefault();
    }
  }, { passive: false });
})();

// Protect the Teacher Desk app window from links to other websites.
// Opening an external resource should never replace the Teacher Desk page.
document.addEventListener('click', event => {
  const anchor = event.target.closest?.('a[href]');
  if (!anchor || event.defaultPrevented) return;
  try {
    const destination = new URL(anchor.href, document.baseURI);
    const appBase = new URL('./', document.baseURI);
    const insideTeacherDesk = destination.origin === appBase.origin &&
      destination.pathname.startsWith(appBase.pathname);
    if ((destination.protocol === 'https:' || destination.protocol === 'http:') && !insideTeacherDesk) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
  } catch { /* Leave invalid or unsupported links to the browser. */ }
}, true);
