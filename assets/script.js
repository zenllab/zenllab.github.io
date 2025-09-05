document.addEventListener('DOMContentLoaded',()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
});

async function loadNewsPreview(){
  const mount = document.getElementById('news-preview');
  if(!mount) return;
  try{
    const res = await fetch('news.html', {cache:'no-store'});
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Prefer structured list; fallback to any <main> li
    let items = [...doc.querySelectorAll('.news-list .news-item')];
    if(items.length === 0){ items = [...doc.querySelectorAll('main li')]; }
    const top = items.slice(0,5);
    if(top.length === 0){
      mount.innerHTML = '<li class="news-item"><span class="muted">No news yet.</span></li>';
      return;
    }
    mount.innerHTML = top.map(li => {
      const date = li.querySelector('time') ? li.querySelector('time').textContent.trim() : '';
      const a = li.querySelector('a');
      const text = (a ? a.textContent : li.textContent || '').trim();
      // If original has a link, keep it. Otherwise render plain text (no link).
      if(a){
        const href = a.getAttribute('href') || 'news.html';
        return `<li class="news-item"><div><time class="muted">${date}</time></div><a class="news-title" href="${href}">${text}</a></li>`;
      }else{
        return `<li class="news-item"><div><time class="muted">${date}</time></div><span class="news-title">${text}</span></li>`;
      }
    }).join('');
  }catch(e){
    mount.innerHTML = '<li class="news-item"><span class="muted">Failed to load news preview.</span></li>';
  }
}


// 할 일 목록을 서버로 보내는 부분을 남겨두고, Dropbox 업로드는 서버 측에서 처리
async function uploadReportToServer() {
  const reportContent = document.getElementById('report-content').innerHTML; // 리포트 내용 가져오기

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: reportContent }) // 서버로 리포트 내용 전달
    });

    const data = await response.json();
    if (data.success) {
      alert('Report uploaded successfully!');
    } else {
      alert('Failed to upload report: ' + data.error);
    }
  } catch (error) {
    console.error('Error uploading report:', error);
  }
}

// 업로드 버튼에 이벤트 리스너 추가
document.getElementById('uploadBtn').addEventListener('click', uploadReportToServer);
