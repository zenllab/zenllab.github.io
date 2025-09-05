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
document.addEventListener('DOMContentLoaded', loadNewsPreview);
const CLIENT_ID = anz9af0qp611lp0;  // Dropbox App Key
const ACCESS_TOKEN = sl.u.AF9hUs1vpWzkUdBciuTHEmneIvCX91PCnmDI8TRen8C_8787m7V6BsgHW3K8wnPCeyntFrbvHg4ZY8uZ0zYZ15XhZ_44s18NWsqv9xXn4fjdbPUBEWyvfevvpJwqLBotZxLB_eYPTVxcRBLsvgVCIXmF2Q4is1qK40Du39-Vsh8txyQXbE99KOnqUNexKq6M-m-e5KOhm-OGEKSkaZ4MR_ubxbQx3Rxo1gvcCBAlmAX0l2nrkZ5rU39P2jPr0kPkKBrYpkNjGLaM7Kry1Ee_YWsqRL7f1i0dTNvQ8pq09wbbHQDSyxVspqxBOlF1ea4Hhdnxhn7imxGCMt7qxKWBg6RUlDy4RNiUyZUF4l1gFjf1wc9gGkrRnkhcGDX8BZ45Ahd3MPBiB0X0Tgv5IinD6nXC_PQuxT7JzeNydrJFFGLtCptJ25efD2Jc7C5Wjlzv1O6pGieSWOmje83xSgeaYoXeW7qqECbH3H1aRcVGD2xuabPbxnGiTsJVMbxMD-Zem5JhCcS4aOJjX8M7Q_52wvMDBZb93uXFMNpYanZJS2JjmV4y1-YpPG0rHJqimis7JVmSlvrI--Sw7v8eHmURSXl4kGUGnuhe-7TVRIMTC0MFZjaB2Wvk0HUBXguaFZhEYj3fecoSlq14XTo8lpkdgzPdYnh-5SzT7Xinqh2dDF9ZvErvq2ODkZgEWLFTZKKtpJURBtMkIwfZ0sr22HIs4OIxen1vma4vDIxARs118gdVDHo-Rm3rSnxMmhc_0zEyvnGaAl-tvHhaK2nQ-lYPKXbr6tfbmJ-GuURega04D14FrlZSozhMXrj0F8J9LPqkBVpRSCmry4GUa2JLKo9HaG2dYAnOJven5vLmD7TfmZoNYlmE5SPalrp2wfvYdX0mToDWEosbYY_e99l436FzoVLGGoerNcAi968FzFiJQ11yliZIoE2lN7JNoDf6FDgWUptwDjoMXsjmXe6euDIkOauN_iZQGcPYNCDLgibDd9F-iGkEZFvQ7jtdZZlvzQ04H5cKphdMSYMOHKEKY3q67m8VlFr6ni-mnjSWXd7OoIdlJUtKcPIlqxQSgbTXS30MZwx_MmfUIrCOiFlPpQbdkWIK06BRBgT_DAEDT2596-YpGPMJLTJUXA9X4FNAXy6QqM_I1prTV72u5xRgYTLbmxM6JUOIlmWtLsuV61i5_R-UVgC5kojlJQ2DOmdG21e7UQxI8aO_grKnkP4o_l1246uT4s--t5X9OxuKXJH45_8vS__9FRLwpCTZm46AEv3uxjeH6P7Xt6h6aKJfD60A2nBCgkNwdxx1mi1Zi21GSINzUw;  // Dropbox Access Token

const dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });

// 로그인 후, 인증된 사용자의 정보 처리 (로그인 후 리디렉션 처리)
if (!localStorage.getItem('access_token')) {
  // 인증되지 않은 사용자일 경우 로그인 페이지로 리디렉션
  window.location.href = '/index.html';
}
