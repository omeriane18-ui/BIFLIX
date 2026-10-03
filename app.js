const KEY='bflix_data';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadData(){
  try{const l=localStorage.getItem(KEY);if(l)return JSON.parse(l)}catch(e){}
  try{const r=await fetch('data.json?'+Date.now());return await r.json()}catch(e){return[]}
}
function saveLocal(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
// يحول أي رابط إلى مشغل فيديو مناسب
function playerHTML(url){
  url=(url||'').trim();
  if(!url)return'<div class="empty">لا يوجد رابط فيديو</div>';
  let m=url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  if(m&&/youtu/.test(url))return`<iframe src="https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  m=url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if(m)return`<iframe src="https://player.vimeo.com/video/${m[1]}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  if(/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url))return`<video src="${esc(url)}" controls autoplay playsinline></video>`;
  return`<iframe src="${esc(url)}" allow="autoplay; fullscreen; encrypted-media" allowfullscreen referrerpolicy="no-referrer"></iframe>`;
}
