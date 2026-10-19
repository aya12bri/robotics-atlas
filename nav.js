// nav.js — one navigation bar, one footer and one "back to top" button for every page.
// Add this single line inside <head> of each page:   <script src="nav.js" defer></script>
// To add a new robot to the whole site, add one line to ROBOTS below. Nothing else.
(function () {
  const ROBOTS = [
    ['arm.html', '3-DOF arm', 'R-R-R'],
    ['gantry.html', 'Cartesian gantry', 'P-P-P'],
    ['scara.html', 'SCARA', 'R-R-P-R'],
    ['articulated.html', '6-axis industrial robot', '6 × R'],
    ['cobot.html', 'Collaborative robot (UR5)', '6 × R'],
    ['delta.html', 'Delta robot', 'parallel'],
    ['mobile.html', 'Mobile robot', 'differential drive'],
    ['wheels.html', 'Wheels and mobile bases', 'reference']
  ];
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const link = (href, text, cls) => `<a href="${href}"${cls ? ` class="${cls}"` : ''}${here === href ? ' aria-current="page"' : ''}>${text}</a>`;

  // little icon: a two-link arm
  const ICON = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><circle cx="8" cy="25" r="3.2" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
    '<path d="M8 25 L14 11 L26 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="14" cy="11" r="2.6" fill="#0f1720" stroke="currentColor" stroke-width="2.2"/></svg>';

  const head = document.head;
  if (!head.querySelector('link[rel~=icon]')) {
    const ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0f1720"/>' +
      '<path d="M8 25 L14 11 L26 8" fill="none" stroke="#ff9f43" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="25" r="3.2" fill="none" stroke="#ff9f43" stroke-width="2.4"/></svg>');
    head.appendChild(ic);
  }

  // ---------- navigation bar ----------
  const nav = document.createElement('header');
  nav.className = 'site-nav';
  nav.innerHTML =
    `<a class="brand" href="index.html">${ICON}<span>Robotics Atlas</span></a>` +
    '<button class="nav-toggle" type="button" aria-label="Open the menu" aria-expanded="false">☰</button>' +
    '<nav class="nav-links" aria-label="Main">' +
    link('index.html', 'Home') + link('learn.html', 'Learn') +
    '<div class="dd"><button class="dd-btn" type="button" aria-haspopup="true" aria-expanded="false">Robots ▾</button><div class="dd-menu">' +
    ROBOTS.map(([h, n, k]) => link(h, `${n} <small>${k}</small>`)).join('') + '</div></div>' +
    '</nav>';
  document.body.insertBefore(nav, document.body.firstChild);

  const toggle = nav.querySelector('.nav-toggle'), links = nav.querySelector('.nav-links');
  const ddBtn = nav.querySelector('.dd-btn'), dd = nav.querySelector('.dd');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  ddBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dd.classList.toggle('open');
    ddBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', () => { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { dd.classList.remove('open'); links.classList.remove('open'); } });

  // ---------- footer: previous / next robot ----------
  const foot = document.createElement('footer');
  foot.className = 'site-foot';
  const i = ROBOTS.findIndex((r) => r[0] === here);
  let pager = '';
  if (i >= 0) {
    const prev = ROBOTS[(i + ROBOTS.length - 1) % ROBOTS.length], next = ROBOTS[(i + 1) % ROBOTS.length];
    pager = `<div class="pager"><a href="${prev[0]}">← ${prev[1]}</a><a href="${next[0]}">${next[1]} →</a></div>`;
  }
  foot.innerHTML = pager +
    '<p>Robotics Atlas · a learning project about robots, their kinematics and their uses · 3D with <a href="https://threejs.org">three.js</a></p>' +
    '<p><a href="index.html">Home</a> · <a href="learn.html">Learn the basics</a> · <a href="wheels.html">Wheels</a></p>';
  document.body.appendChild(foot);

  // ---------- back to top ----------
  const top = document.createElement('button');
  top.className = 'to-top';
  top.type = 'button';
  top.setAttribute('aria-label', 'Back to top');
  top.textContent = '↑';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(top);
  const onScroll = () => top.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();