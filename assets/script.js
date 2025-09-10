document.addEventListener('DOMContentLoaded',()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
});

async function loadNewsPreview() {
  const mount = document.getElementById('news-preview');
  if (!mount) return;

  try {
    const res = await fetch('news.html', { cache: 'no-store' });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Prefer structured list; fallback to any <main> li
    let items = [...doc.querySelectorAll('.news-list .news-item')];
    if (items.length === 0) {
      items = [...doc.querySelectorAll('main li')];
    }

    const top = items.slice(0, 5);

    if (top.length === 0) {
      mount.innerHTML = '<li class="news-item"><span class="muted">No news yet.</span></li>';
      return;
    }

    // 여기서 figcaption 제거
    top.forEach(li => {
      li.querySelectorAll('figcaption').forEach(fc => fc.remove());
      li.querySelectorAll('figure').forEach(fg => fg.remove());
      li.querySelectorAll('img').forEach(img => img.remove());
    });

    mount.innerHTML = top
      .map(li => {
        const date = li.querySelector('time') ? li.querySelector('time').textContent.trim() : '';
        const a = li.querySelector('a');
        const text = (a ? a.textContent : li.textContent || '').trim();

        // If original has a link, keep it. Otherwise render plain text (no link).
        if (a) {
          const href = a.getAttribute('href') || 'news.html';
          return `<li class="news-item">
                    <div><time class="muted">${date}</time></div>
                    <a class="news-title" href="${href}">${text}</a>
                  </li>`;
        } else {
          return `<li class="news-item">
                    <div><time class="muted">${date}</time></div>
                    <span class="news-title">${text}</span>
                  </li>`;
        }
      })
      .join('');
  } catch (e) {
    mount.innerHTML = '<li class="news-item"><span class="muted">Failed to load news preview.</span></li>';
  }
}

document.addEventListener('DOMContentLoaded', loadNewsPreview);
