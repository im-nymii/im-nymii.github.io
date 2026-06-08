(() => {
  const boot = document.getElementById('boot');
  const log = document.getElementById('boot-log');
  if (!boot || !log) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = sessionStorage.getItem('booted');

  if (seen || reduced) {
    boot.parentNode.removeChild(boot);
    return;
  }

  const lines = [
    ['dim',  '> init nymii.sys'],
    ['',     'POST .............................. <span class="ok">[ ok ]</span>'],
    ['',     'loading kernel modules ............ <span class="ok">[ ok ]</span>'],
    ['',     'mounting /dev/identity ............ <span class="ok">[ ok ]</span>'],
    ['',     'checking memory integrity ......... <span class="ok">[ ok ]</span>'],
    ['',     'bringing up loopback .............. <span class="ok">[ ok ]</span>'],
    ['',     'establishing uplink ............... <span class="ok">[ ok ]</span>'],
    ['',     'negotiating tls handshake ......... <span class="ok">[ ok ]</span>'],
    ['warn', 'scanning for trace... aborted ..... <span class="warn">[skip]</span>'],
    ['warn', 'decrypting profile ................ <span class="ok">[ ok ]</span>'],

    ['',     'loading projects .................. <span class="ok">[ ok ]</span>'],
    ['',     'loading memories .................. <span class="ok">[ ok ]</span>'],
    ['',     'mounting /home/nymii .............. <span class="ok">[ ok ]</span>'],
    ['',     'starting display server ........... <span class="ok">[ ok ]</span>'],
    ['',     'spawning interface ................ <span class="ok">[ ok ]</span>'],
    ['dim',  '> all systems nominal'],
    ['dim',  '> user authenticated: nymii'],
    ['dim',  '> welcome nymii.'],
  ];

  document.body.style.overflow = 'hidden';
  let html = '';
  let i = 0;

  const typeLine = () => {
    if (i >= lines.length) {
      log.innerHTML = html + '<span class="cur">_</span>';
      setTimeout(() => {
        boot.classList.add('boot-done');
        document.body.style.overflow = '';
        sessionStorage.setItem('booted', '1');
        setTimeout(() => boot.parentNode && boot.parentNode.removeChild(boot), 800);
      }, 420);
      return;
    }
    const [cls, text] = lines[i];
    html += `<span class="${cls}">${text}</span>\n`;
    log.innerHTML = html + '<span class="cur">_</span>';
    i += 1;
    setTimeout(typeLine, 75 + Math.random() * 110);
  };

  typeLine();
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
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  io.observe(el);
});

const name = document.querySelector('.name');
if (name) {
  setInterval(() => {
    if (Math.random() > 0.72) {
      const x = (Math.random() * 5 - 2.5).toFixed(1);
      const sk = (Math.random() * 1.6 - 0.8).toFixed(2);
      name.style.transform = `translate(${x}px,0) skewX(${sk}deg)`;
      name.style.filter = 'blur(0.4px)';
      setTimeout(() => {
        name.style.transform = 'translate(0,0)';
        name.style.filter = 'none';
      }, 90);
    }
  }, 2400);
}

const glitchTargets = document.querySelectorAll('.block-head h2, .chip, .logo');
if (glitchTargets.length) {
  setInterval(() => {
    const el = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
    const x = (Math.random() * 4 - 2).toFixed(1);
    el.style.transition = 'none';
    el.style.transform = `translate(${x}px,0)`;
    el.style.textShadow = '-1px 0 rgba(139,108,255,0.6), 1px 0 rgba(108,160,255,0.5)';
    setTimeout(() => {
      el.style.transform = '';
      el.style.textShadow = '';
    }, 70);
  }, 3600);
}

const tag = document.querySelector('.ascii-tag');
if (tag) {
  const base = tag.textContent.replace(/_$/, '');
  let on = true;
  setInterval(() => {
    tag.textContent = base + (on ? '_' : ' ');
    on = !on;
  }, 530);
}

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
        tagsEl.innerHTML = tags.map((t) => `<span></span>`).join('');
        tagsEl.querySelectorAll('span').forEach((s, i) => (s.textContent = tags[i]));
      }
    })
    .catch(() => {
      set('title', 'visit the blog');
      set('summary', 'latest posts, writeups & notes on nymii.dev');
      set('date', '');
    });
}
