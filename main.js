import {fetchItems} from './firebase.js';
const $=i=>document.getElementById(i);
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
let D=[],F='all',X=null,CUR=0,T=null;
let MY=LS.get('bf_my',[]),CW=LS.get('bf_cw',{});   // قائمتي + تابع المشاهدة (محفوظان في متصفحك فقط)
$('y').textContent=new Date().getFullYear();
const toast=t=>{const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',2200)};
addEventListener('scroll',()=>$('hd').classList.toggle('sc',scrollY>40),{passive:true});
// صورة معطوبة تُزال بدل أن تظهر أيقونة مكسورة (بدون معالجات inline بسبب CSP)
addEventListener('error',e=>{if(e.target&&e.target.tagName==='IMG')e.target.remove()},true);

// ===== المقدمة السينمائية (مرة واحدة لكل جلسة) =====
(()=>{
  const intro=$('intro');if(!intro)return;
  let seen=false;try{seen=sessionStorage.getItem('bf_i')}catch(_){}
  if(seen){intro.remove();return}
  try{sessionStorage.setItem('bf_i','1')}catch(_){}
  document.body.style.overflow='hidden';
  const end=()=>{if(!intro.isConnected)return;intro.classList.add('out');document.body.style.overflow='';setTimeout(()=>intro.remove(),700)};
  intro.onclick=end;
  setTimeout(end,matchMedia('(prefers-reduced-motion:reduce)').matches?900:4300);
})();

// ===== العرض =====
const safe=u=>{u=String(u||'').trim();return /^https:\/\//i.test(u)?u:''};
const card=x=>{const p=safe(x.poster);return `<div class="card" tabindex="0" data-id="${esc(x.id)}"><div class="poster">${p?`<img src="${esc(p)}" alt="${esc(x.title)}" loading="lazy" referrerpolicy="no-referrer">`:''}<span class="ph">${esc((x.title||'B')[0])}</span></div><div class="i"><b>${esc(x.title)}</b><small>${x.type==='series'?'مسلسل':'فيلم'}${x.year?' · '+esc(x.year):''}</small></div></div>`};
const row=(t,L)=>L.length?`<section class="rw"><h3>${esc(t)}</h3><button class="ar p" aria-label="السابق">›</button><div class="rs">${L.map(card).join('')}</div><button class="ar n" aria-label="التالي">‹</button></section>`:'';
const skel=()=>`<section class="rw"><h3 class="sk-h"></h3><div class="rs">${'<div class="card sk"><div class="poster"></div></div>'.repeat(10)}</div></section>`;
const byId=ids=>ids.map(i=>D.find(x=>x.id===i)).filter(Boolean);

function render(){
  const q=$('q').value.trim().toLowerCase();
  const base=D.filter(x=>F==='all'||F==='my'?true:x.type===F);
  if(q||F==='my'){
    $('hero').innerHTML='';$('rows').style.marginTop='90px';
    const src=F==='my'?byId(MY):base;
    const L=q?src.filter(x=>((x.title||'')+' '+(x.genre||'')).toLowerCase().includes(q)):src;
    $('rows').innerHTML=`<section class="rw"><h3>${F==='my'&&!q?'قائمتي':'نتائج البحث'}</h3>${L.length?`<div class="grid" style="padding:20px 0">${L.map(card).join('')}</div>`:`<div class="empty">${F==='my'&&!q?'قائمتك فارغة — افتح أي عنوان واضغط «أضف إلى قائمتي»':'لا توجد نتائج'}</div>`}</section>`;return;
  }
  $('rows').style.marginTop='';
  const f=base.find(x=>x.featured&&safe(x.poster))||base.find(x=>safe(x.poster))||base[0];
  const fp=f&&safe(f.poster);
  $('hero').innerHTML=f?`<div class="hero">${fp?`<div class="bg" style="background-image:url('${esc(fp)}')"></div><img class="pz" src="${esc(fp)}" alt="" referrerpolicy="no-referrer">`:''}<div class="in"><h1>${esc(f.title)}</h1><div class="meta">${esc([f.type==='series'?'مسلسل':'فيلم',f.year,f.genre].filter(Boolean).join(' · '))}</div><p>${esc(f.desc||'')}</p><button class="pri big" data-a="w" data-id="${esc(f.id)}">▶ شاهد الآن</button> <button class="big" data-a="i" data-id="${esc(f.id)}">معلومات</button></div></div>`:'';
  const g={};base.forEach(x=>(x.genre||'').split(/[،,]/).map(s=>s.trim()).filter(Boolean).forEach(k=>(g[k]=g[k]||[]).push(x)));
  const cw=Object.entries(CW).sort((a,b)=>b[1].ts-a[1].ts).map(e=>e[0]);
  $('rows').innerHTML=base.length
    ?row('تابع المشاهدة',byId(cw).filter(x=>F==='all'||x.type===F).slice(0,15))
     +row('قائمتي',byId(MY).filter(x=>F==='all'||x.type===F))
     +row('أحدث الإضافات',base)
     +(F==='all'?row('أفلام',base.filter(x=>x.type==='movie'))+row('مسلسلات',base.filter(x=>x.type==='series')):'')
     +Object.entries(g).filter(([,l])=>l.length>1).map(([k,l])=>row(k,l)).join('')
    :'<div class="empty" style="padding-top:120px">لا يوجد محتوى بعد</div>';
}
const onClick=e=>{
  const b=e.target.closest('[data-a]');if(b)return openM(b.dataset.id,b.dataset.a==='w');
  const ar=e.target.closest('.ar');if(ar){const s=ar.parentElement.querySelector('.rs');s.scrollBy({left:(ar.classList.contains('n')?-1:1)*s.clientWidth*.85,behavior:'smooth'});return}
  const c=e.target.closest('.card[data-id]');if(c)openM(c.dataset.id);
};
$('hero').onclick=$('rows').onclick=$('sim').onclick=onClick;
const onKey=e=>{if(e.key==='Enter'&&e.target.classList.contains('card'))openM(e.target.dataset.id)};
$('rows').onkeydown=$('sim').onkeydown=onKey;
$('q').oninput=render;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('nav button').forEach(c=>c.classList.remove('on'));b.classList.add('on');F=b.dataset.f;render()});

// ===== شاشة المعلومات ثم المشاهدة =====
const isS=x=>x.type==='series'&&x.eps&&x.eps.length;
function paintMy(){const on=MY.includes(X.id);$('mli').textContent=on?'✓':'＋';$('mlt').textContent=on?'في قائمتي':'أضف إلى قائمتي';$('ml').classList.toggle('on',on)}
function openM(id,watch){
  X=D.find(i=>i.id===id);if(!X)return;
  const p=safe(X.poster);
  $('bx').style.setProperty('--bgi',p?`url("${p.replace(/["\\\n()]/g,'')}")`:'none');
  $('dp').innerHTML=(p?`<img src="${esc(p)}" alt="${esc(X.title)}" referrerpolicy="no-referrer">`:'')+`<span class="ph">${esc((X.title||'B')[0])}</span>`;
  $('dt').textContent=X.title;
  $('dm').textContent=[X.type==='series'?'مسلسل':'فيلم',X.year,X.genre].filter(Boolean).join(' · ');
  $('dd').textContent=X.desc||'';
  const c=CW[X.id];
  $('go').textContent=isS(X)&&c&&c.ep>0?`▶ تابع من الحلقة ${c.ep+1}`:(c?'▶ أعد المشاهدة':'▶ شاهد الآن');
  paintMy();
  $('dv').style.display='';$('wv').style.display='none';
  // مشابه
  const gs=(X.genre||'').split(/[،,]/).map(s=>s.trim()).filter(Boolean);
  const sim=D.filter(x=>x.id!==X.id&&(x.genre||'').split(/[،,]/).some(k=>gs.includes(k.trim()))).slice(0,12);
  $('sim').innerHTML=sim.length?`<h3>قد يعجبك أيضًا</h3><div class="grid">${sim.map(card).join('')}</div>`:'';
  $('modal').classList.add('open');$('modal').scrollTop=0;document.body.style.overflow='hidden';
  try{history.replaceState(null,'','?v='+encodeURIComponent(id))}catch(_){}
  if(watch)$('go').click();
}
function play(i){
  CUR=i;const ep=$('ep');
  if(isS(X)){
    const e=X.eps[i];
    [...ep.children].forEach((c,k)=>c.classList.toggle('on',k===i));
    mountPlayer($('pl'),$('pb'),e.u,e.s,()=>i<X.eps.length-1&&play(i+1));
    if(i<X.eps.length-1){const n=document.createElement('button');n.className='pri';n.textContent='الحلقة التالية ◀';n.onclick=()=>play(i+1);$('pb').appendChild(n)}
  }else mountPlayer($('pl'),$('pb'),X.url,X.sub);
  if(T){T.setPage('watch',X.id);T.watch(X.id)}
  CW[X.id]={ep:i,ts:Date.now()};
  const keys=Object.keys(CW).sort((a,b)=>CW[b].ts-CW[a].ts).slice(0,40);
  CW=Object.fromEntries(keys.map(k=>[k,CW[k]]));LS.set('bf_cw',CW);
}
$('go').onclick=()=>{
  $('dv').style.display='none';$('wv').style.display='';$('sim').style.display='none';
  const ep=$('ep');ep.innerHTML='';
  if(isS(X)){
    X.eps.forEach((e,i)=>{const b=document.createElement('button');b.textContent=e.t||('الحلقة '+(i+1));b.onclick=()=>play(i);ep.appendChild(b)});
    const c=CW[X.id];play(c&&c.ep<X.eps.length?c.ep:0);
  }else play(0);
  $('modal').scrollTop=0;
};
$('bk').onclick=()=>{if(T)T.setPage('home');$('pl').innerHTML='';$('pb').innerHTML='';$('dv').style.display='';$('sim').style.display='';$('wv').style.display='none'};
function closeM(){
  if(T)T.setPage('home');
  $('modal').classList.remove('open');$('pl').innerHTML='';$('pb').innerHTML='';$('sim').style.display='';X=null;document.body.style.overflow='';
  try{history.replaceState(null,'',location.pathname)}catch(_){}
  render();
}
$('cl').onclick=closeM;
$('modal').onclick=e=>{if(e.target.id==='modal')closeM()};
addEventListener('keydown',e=>{if(e.key==='Escape'&&X)closeM()});
$('ml').onclick=()=>{
  MY=MY.includes(X.id)?MY.filter(i=>i!==X.id):[X.id,...MY];LS.set('bf_my',MY);paintMy();
  toast(MY.includes(X.id)?'أُضيف إلى قائمتك':'أُزيل من قائمتك');
};
$('sh').onclick=async()=>{
  const url=location.origin+location.pathname+'?v='+encodeURIComponent(X.id);
  try{if(navigator.share){await navigator.share({title:X.title,url});return}await navigator.clipboard.writeText(url);toast('تم نسخ الرابط')}
  catch(e){if(e.name!=='AbortError')toast(url)}
};

// ===== التحميل =====
$('rows').innerHTML=skel()+skel();
fetchItems().then(d=>{
  D=d;
  // نظّف القوائم من عناصر محذوفة
  MY=MY.filter(i=>D.some(x=>x.id===i));
  render();
  const v=new URLSearchParams(location.search).get('v');if(v)openM(v);
});
// إحصائيات مجهولة لصاحب الموقع (تُحمَّل بعد ظهور الصفحة، وفشلها لا يؤثر على شيء)
setTimeout(()=>import('./track.js').then(m=>{T=m;m.setPage('home')}).catch(()=>{}),1500);
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
