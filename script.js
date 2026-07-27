(() => {
  const field = document.querySelector('.confetti');
  if (!field) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const suits = ['✦', '◆', '♦', '♠', '♥', '♣'];
  const count = window.innerWidth < 720 ? 10 : 18;

  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.textContent = suits[Math.floor(Math.random() * suits.length)];
    s.style.left = `${Math.random() * 100}%`;
    s.style.fontSize = `${14 + Math.random() * 22}px`;
    const dur = 12 + Math.random() * 16;
    s.style.animationDuration = `${dur}s`;
    s.style.animationDelay = `${-Math.random() * dur}s`;
    s.style.opacity = (0.3 + Math.random() * 0.4).toFixed(2);
    field.appendChild(s);
  }
})();

const toggle = document.querySelector('.nav-toggle');
const drawer = document.getElementById('drawer');
if (toggle && drawer) {
  toggle.addEventListener('click', () => drawer.classList.toggle('open'));
  drawer.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => drawer.classList.remove('open'))
  );
}

const reveal = document.querySelectorAll('.block, .hero');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
reveal.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s cubic-bezier(.2,1.2,.3,1)';
  io.observe(el);
});

const postCard = document.getElementById('post-card');
if (postCard) {
  const FEED_URL = 'https://nymii.dev/blog/feed.xml';
  const set = (key, value) => {
    const el = postCard.querySelector(`[data-post="${key}"]`);
    if (el && value != null) el.textContent = value;
  };

  fetch(FEED_URL, { cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error(`feed ${r.status}`);
      return r.text();
    })
    .then((xml) => {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const entry = doc.querySelector('entry');
      if (!entry) throw new Error('no entry');

      const title = entry.querySelector('title')?.textContent?.trim();
      const link = entry.querySelector('link')?.getAttribute('href');
      const summary = entry.querySelector('summary')?.textContent?.trim();
      const published =
        entry.querySelector('published')?.textContent ||
        entry.querySelector('updated')?.textContent;
      const tags = Array.from(entry.querySelectorAll('category'))
        .map((c) => c.getAttribute('term'))
        .filter(Boolean)
        .slice(0, 4);

      if (title) set('title', title);
      if (link) postCard.href = link;
      if (summary) set('summary', summary);
      if (published) {
        set('date', new Date(published).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        }));
      }
      const tagsEl = postCard.querySelector('[data-post="tags"]');
      if (tagsEl && tags.length) {
        tagsEl.innerHTML = tags.map(() => `<span></span>`).join('');
        tagsEl.querySelectorAll('span').forEach((s, i) => (s.textContent = tags[i]));
      }
    })
    .catch(() => {
      set('title', 'visit the blog');
      set('summary', 'latest posts, writeups & notes on nymii.dev');
      set('date', '');
    });
}
