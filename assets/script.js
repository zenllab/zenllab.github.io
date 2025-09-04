document.addEventListener('DOMContentLoaded',()=>{const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();});


async function loadNewsPreview(){
  const mount = document.getElementById('news-preview');
  if(!mount) return;
  try{
    const res = await fetch('news.html', {cache:'no-store'});
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let items = [...doc.querySelectorAll('.news-list .news-item')];
    if(items.length === 0){
      items = [...doc.querySelectorAll('main li')];
    }
    const top = items.slice(0,5);
    if(top.length === 0){
      mount.innerHTML = '<li class="news-item"><span class="muted">No news yet.</span></li>';
      return;
    }
    mount.innerHTML = top.map(li => {
      const date = li.querySelector('time') ? li.querySelector('time').textContent.trim() : '';
      const a = li.querySelector('a') || null;
      const title = a ? a.textContent.trim() : (li.textContent || '').trim();
      const href = a ? a.getAttribute('href') : 'news.html';
      return `<li class="news-item"><div><time class="muted">${date}</time></div><a class="news-title" href="${href}">${title}</a></li>`;
    }).join('');
  }catch(e){
    mount.innerHTML = '<li class="news-item"><span class="muted">Failed to load news preview.</span></li>';
  }
}
document.addEventListener('DOMContentLoaded', loadNewsPreview);
