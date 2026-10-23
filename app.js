// BFLIX — مشغّل الفيديو (آمن، بلا إعلانات)
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// يسمح فقط بروابط https (يمنع javascript: و data: وغيرها)
const safeUrl=u=>{u=String(u||'').trim();return /^https:\/\//i.test(u)?u:''};

// مكتبة HLS مستضافة داخل الموقع نفسه (لا نحمّل أي سكربت خارجي)
function loadHls(){
  return window.Hls?Promise.resolve():new Promise((ok,no)=>{
    const s=document.createElement('script');
    s.src='vendor/hls.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s);
  });
}

// يحوّل أي رابط (أو كود iframe) إلى مشغّل داخل الموقع
function mountPlayer(el,bar,url,sub,onEnd){
  url=(url||'').trim();
  const f=url.match(/<iframe[^>]+src=["']([^"']+)/i);
  if(f)url=f[1];
  if(url.startsWith('//'))url='https:'+url;
  url=url.replace(/^http:\/\//i,'https://');
  el.innerHTML='';bar.innerHTML='';
  if(!safeUrl(url)){el.innerHTML='<div class="empty">لا يوجد رابط فيديو صالح</div>';return}
  bar.innerHTML=`<a class="btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer">↗ لا يعمل؟ افتح الفيديو في نافذة جديدة</a>`;

  // sandbox: يمنع النوافذ المنبثقة والتحويل للصفحات الخارجية = يقطع إعلانات المشغّلات الخارجية
  const frame=src=>el.innerHTML=`<iframe src="${esc(src)}" sandbox="allow-scripts allow-same-origin allow-presentation" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  let m;

  // ملفات مباشرة
  if(/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)){
    el.innerHTML=`<video src="${esc(url)}" controls autoplay playsinline>${safeUrl(sub)?`<track kind="subtitles" srclang="ar" label="العربية" src="${esc(safeUrl(sub))}" default>`:''}</video>`;
    const v=el.firstChild;if(onEnd)v.onended=onEnd;return;
  }
  // بث HLS
  if(/\.m3u8(\?|#|$)/i.test(url)){
    const v=document.createElement('video');v.controls=true;v.autoplay=true;v.playsInline=true;el.appendChild(v);
    if(onEnd)v.onended=onEnd;
    if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=url}
    else loadHls().then(()=>{if(Hls.isSupported()){const h=new Hls();h.loadSource(url);h.attachMedia(v)}}).catch(()=>{el.innerHTML='<div class="empty">تعذر تحميل مشغّل البث</div>'});
    return;
  }
  // يوتيوب (نطاق youtube-nocookie: بلا تتبّع)
  const pl=(url.match(/[?&]list=([\w-]+)/)||[])[1],st=(url.match(/[?&](?:t|start)=(\d+)/)||[])[1];
  m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/i);
  if(m)return frame(`https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1&cc_load_policy=1&hl=ar&cc_lang_pref=ar${pl?'&list='+pl:''}${st?'&start='+st:''}`);
  if(pl&&/youtube\.com\/playlist/i.test(url))return frame(`https://www.youtube-nocookie.com/embed/videoseries?list=${pl}`);
  // فيميو
  if(m=url.match(/vimeo\.com\/(?:video\/)?(\d+)/i))return frame(`https://player.vimeo.com/video/${m[1]}?autoplay=1`);
  // ديلي موشن
  if(m=url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([\w]+)/i))return frame(`https://www.dailymotion.com/embed/video/${m[1]}?autoplay=1`);
  // جوجل درايف
  if(m=url.match(/drive\.google\.com\/file\/d\/([\w-]+)/i))return frame(`https://drive.google.com/file/d/${m[1]}/preview`);
  // فيسبوك
  if(/facebook\.com\/.+\/videos\/|fb\.watch|facebook\.com\/watch|facebook\.com\/reel/i.test(url))return frame(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`);
  // ستريمبل
  if(m=url.match(/streamable\.com\/(?:e\/)?(\w+)$/i))return frame(`https://streamable.com/e/${m[1]}?autoplay=1`);
  // أرشيف
  if(m=url.match(/archive\.org\/(?:details|embed)\/([^\/?#]+)/i))return frame(`https://archive.org/embed/${m[1]}`);
  // أي موقع آخر
  frame(url);
}
