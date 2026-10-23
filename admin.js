import {app,db,fetchItems} from './firebase.js';
import {doc,setDoc,deleteDoc,collection,getDocs,query,where,orderBy,limit,documentId,Timestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {initializeAuth,browserSessionPersistence,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const ADMIN='omeriane0@gmail.com';
// الجلسة تنتهي بإغلاق التبويب؛ بدون نوافذ منبثقة أو إطارات خارجية
const auth=initializeAuth(app,{persistence:browserSessionPersistence});
const $=i=>document.getElementById(i);
let D=[],E=null;
async function login(){
  $('er').textContent='';
  try{await signInWithEmailAndPassword(auth,$('em').value.trim(),$('pw').value)}
  catch(e){$('er').textContent='البريد أو كلمة المرور غير صحيحة'}
}
$('go').onclick=login;$('pw').onkeydown=e=>{if(e.key==='Enter')login()};
$('lo').onclick=()=>signOut(auth);
onAuthStateChanged(auth,async u=>{
  if(u&&u.email!==ADMIN){await signOut(auth);$('er').textContent='هذا الحساب ليس حساب صاحب الموقع';return}
  if(u){$('lg').style.display='none';$('ap').style.display='block';await refresh();show('st')}
  else{clearInterval(TM);$('lg').style.display='';$('ap').style.display='none'}
});
async function refresh(){D=await fetchItems();list();loadStats()}
$('ty').onchange=()=>{const s=$('ty').value==='series';$('u1').style.display=s?'none':'block';$('u2').style.display=s?'block':'none'};
function clear(){E=null;['t','yr','gn','po','ds','vu','sb','es'].forEach(i=>$(i).value='');$('ft').checked=false;$('ty').value='movie';$('ty').onchange();$('fh').textContent='إضافة جديد'}
$('cn').onclick=clear;
function list(){
  $('cnt').textContent=D.length;
  $('ls').innerHTML=D.map(x=>`<div class="row"><span>${esc(x.title)} ${x.featured?'⭐':''} <small style="color:var(--mu)">· ${x.type==='series'?'مسلسل':'فيلم'}</small></span><button data-a="e" data-id="${esc(x.id)}">تعديل</button><button class="del" data-a="d" data-id="${esc(x.id)}">حذف</button></div>`).join('')||'<div class="empty">لا يوجد محتوى بعد</div>';
}
$('ls').onclick=async e=>{
  const b=e.target.closest('[data-a]');if(!b)return;const id=b.dataset.id;
  if(b.dataset.a==='e')return edit(id);
  if(!confirm('حذف نهائياً؟'))return;
  try{await deleteDoc(doc(db,'items',id));await refresh()}catch(err){alert('تعذر الحذف: '+err.message)}
};
$('sv').onclick=async()=>{
  const t=$('t').value.trim();if(!t)return alert('اكتب العنوان');
  const ty=$('ty').value;
  const eps=$('es').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split('|').map(s=>s.trim());return p.length<2?{t:'',u:p[0]}:{t:p[0],u:p[1],s:p[2]||''}});
  if(ty==='movie'&&!$('vu').value.trim())return alert('ضع رابط الفيديو');
  if(ty==='series'&&!eps.length)return alert('أضف حلقة واحدة على الأقل');
  const urls=[$('po').value.trim(),ty==='movie'?$('vu').value.trim():'',...eps.map(e=>e.u)].filter(Boolean);
  if(urls.some(u=>!/^(https:\/\/|\/\/|<iframe)/i.test(u)))return alert('كل الروابط يجب أن تبدأ بـ https://');
  const id=E||('i'+Date.now());
  const old=D.find(x=>x.id===id);
  const o={title:t,type:ty,year:$('yr').value.trim(),genre:$('gn').value.trim(),poster:$('po').value.trim(),desc:$('ds').value.trim(),url:ty==='movie'?$('vu').value.trim():'',sub:ty==='movie'?$('sb').value.trim():'',eps:ty==='series'?eps:[],featured:$('ft').checked,ts:old?.ts||Date.now()};
  try{
    await setDoc(doc(db,'items',id),o);
    if(o.featured)for(const x of D.filter(x=>x.featured&&x.id!==id))await setDoc(doc(db,'items',x.id),{featured:false},{merge:true});
    clear();await refresh();
  }catch(e){alert('تعذر الحفظ: '+e.message)}
};
function edit(id){
  const x=D.find(i=>i.id===id);if(!x)return;E=id;
  $('t').value=x.title;$('ty').value=x.type;$('yr').value=x.year||'';$('gn').value=x.genre||'';$('po').value=x.poster||'';$('ds').value=x.desc||'';$('vu').value=x.url||'';$('sb').value=x.sub||'';$('ft').checked=!!x.featured;
  $('es').value=(x.eps||[]).map(e=>e.t+' | '+e.u+(e.s?' | '+e.s:'')).join('\n');$('ty').onchange();$('fh').textContent='تعديل: '+x.title;scrollTo(0,0);
}

// ===================== الإحصائيات =====================
let RANGE=30,TM=null;
const dnum=off=>{const d=new Date(Date.now()+off*864e5);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate()};
const dlabel=n=>{const s=String(n);return s.slice(4,6)+'/'+s.slice(6)};
const nf=n=>Number(n||0).toLocaleString('ar-EG-u-nu-latn');
const title=id=>(D.find(x=>x.id===id)||{}).title||id;
function show(tab){
  const st=tab==='st';
  $('sec-st').style.display=st?'':'none';$('sec-ct').style.display=st?'none':'';
  $('tb-st').classList.toggle('on',st);$('tb-ct').classList.toggle('on',!st);
  clearInterval(TM);if(st){loadStats();TM=setInterval(loadStats,30000)}
}
$('tb-st').onclick=()=>show('st');$('tb-ct').onclick=()=>show('ct');
$('rf').onclick=loadStats;
$('r7').onclick=()=>{RANGE=7;$('r7').classList.add('on');$('r30').classList.remove('on');drawChart()};
$('r30').onclick=()=>{RANGE=30;$('r30').classList.add('on');$('r7').classList.remove('on');drawChart()};
let SER=[];
async function loadStats(){
  try{
    const cut=Timestamp.fromMillis(Date.now()-120000);
    const [pres,daily,dw]=await Promise.all([
      getDocs(query(collection(db,'presence'),where('ts','>',cut),limit(500))),
      getDocs(query(collection(db,'daily'),orderBy(documentId(),'desc'),limit(30))),
      getDocs(query(collection(db,'dw'),where('d','>=',dnum(-29))))
    ]);
    const now=pres.docs.map(d=>d.data());
    $('k-now').textContent=nf(now.length)+(now.length>=500?'+':'');
    $('k-watch').textContent=nf(now.filter(x=>x.p==='watch').length);
    // نشطون الآن
    const byI={};now.filter(x=>x.p==='watch'&&x.i).forEach(x=>byI[x.i]=(byI[x.i]||0)+1);
    const browsing=now.filter(x=>x.p!=='watch').length;
    $('nowlist').innerHTML=(browsing?`<div class="row"><span>يتصفحون الصفحة الرئيسية</span><b>${nf(browsing)}</b></div>`:'')
      +Object.entries(byI).sort((a,b)=>b[1]-a[1]).map(([i,n])=>`<div class="row"><span>▶ ${esc(title(i))}</span><b>${nf(n)}</b></div>`).join('')
      ||'<div class="empty">لا أحد الآن</div>';
    // الأيام
    const V={},W={},I={};
    daily.docs.forEach(d=>V[d.id]=d.data().v||0);
    dw.docs.forEach(d=>{const x=d.data();W[x.d]=(W[x.d]||0)+(x.w||0);I[x.i]=(I[x.i]||0)+(x.w||0)});
    SER=[];for(let k=29;k>=0;k--){const n=dnum(-k);SER.push({n,v:V[n]||0,w:W[n]||0})}
    const sum=(a,f)=>a.reduce((t,x)=>t+f(x),0);
    $('k-today').textContent=nf(SER[29].v);
    $('k-7').textContent=nf(sum(SER.slice(23),x=>x.v));
    $('k-30').textContent=nf(sum(SER,x=>x.v));
    $('k-w30').textContent=nf(sum(SER,x=>x.w));
    drawChart();
    const top=Object.entries(I).sort((a,b)=>b[1]-a[1]).slice(0,10),mx=top[0]?top[0][1]:1;
    $('top').innerHTML=top.map(([i,n],k)=>`<div class="bl"><span>${k+1}. ${esc(title(i))}</span><div class="bb"><i style="width:${Math.max(4,n/mx*100)}%"></i></div><b>${nf(n)}</b></div>`).join('')||'<div class="empty">لا توجد بيانات بعد</div>';
    const mv=D.filter(x=>x.type==='movie').length,sr=D.filter(x=>x.type==='series'),ep=sum(sr,x=>(x.eps||[]).length);
    $('cstat').innerHTML=[['إجمالي العناوين',D.length],['أفلام',mv],['مسلسلات',sr.length],['حلقات',ep]].map(([l,n])=>`<div><b>${nf(n)}</b><span>${l}</span></div>`).join('');
    $('stn').classList.remove('warn');
  }catch(e){
    console.error(e);
    $('stn').classList.add('warn');
    $('stn').textContent='تعذّر قراءة الإحصائيات: '+(e.code==='permission-denied'?'انشر ملف firestore.rules المحدَّث في Firebase Console أولًا.':e.message);
  }
}
function drawChart(){
  const S=SER.slice(30-RANGE),W=720,H=220,pl=34,pb=24,pt=10,iw=W-pl-8,ih=H-pb-pt;
  const mx=Math.max(4,...S.map(x=>Math.max(x.v,x.w))),step=iw/S.length,bw=Math.min(26,step*.55);
  const y=v=>pt+ih-(v/mx)*ih;
  let g='';
  for(let k=0;k<=4;k++){const v=Math.round(mx*k/4),yy=y(v);g+=`<line x1="${pl}" x2="${W-8}" y1="${yy}" y2="${yy}" class="gl"/><text x="${pl-6}" y="${yy+4}" class="ax" text-anchor="end">${v}</text>`}
  S.forEach((x,k)=>{
    const cx=pl+step*k+step/2;
    g+=`<rect x="${cx-bw/2}" y="${y(x.v)}" width="${bw}" height="${pt+ih-y(x.v)}" rx="3" fill="var(--ac)"><title>${dlabel(x.n)} — زوّار: ${x.v} · تشغيلات: ${x.w}</title></rect>`;
    if(k%Math.ceil(S.length/10)===0)g+=`<text x="${cx}" y="${H-6}" class="ax" text-anchor="middle">${dlabel(x.n)}</text>`;
  });
  const pts=S.map((x,k)=>`${pl+step*k+step/2},${y(x.w)}`).join(' ');
  g+=`<polyline points="${pts}" fill="none" stroke="#5aa9ff" stroke-width="2.5" stroke-linejoin="round"/>`+S.map((x,k)=>`<circle cx="${pl+step*k+step/2}" cy="${y(x.w)}" r="3.5" fill="#5aa9ff"/>`).join('');
  $('chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="رسم الزوار والتشغيلات">${g}</svg>`;
}

// ===================== نسخ احتياطي / استيراد =====================
$('bkp').onclick=()=>{
  const l=document.createElement('a');
  l.href=URL.createObjectURL(new Blob([JSON.stringify(D,null,2)],{type:'application/json'}));
  l.download='bflix-backup-'+new Date().toISOString().slice(0,10)+'.json';l.click();
};
$('imp').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  try{
    const arr=JSON.parse(await f.text());
    if(!Array.isArray(arr))throw new Error('الملف ليس نسخة احتياطية صحيحة');
    if(!confirm('سيتم استيراد '+arr.length+' عنصر (العناصر المتطابقة تُستبدل). متابعة؟'))return;
    let n=0;
    for(const x of arr){
      if(!x||!x.id||!x.title)continue;
      const o={title:String(x.title),type:x.type==='series'?'series':'movie',year:x.year||'',genre:x.genre||'',poster:x.poster||'',desc:x.desc||'',url:x.url||'',sub:x.sub||'',eps:Array.isArray(x.eps)?x.eps:[],featured:!!x.featured,ts:x.ts||Date.now()};
      await setDoc(doc(db,'items',String(x.id).replace(/[^A-Za-z0-9]/g,'')||('i'+Date.now()+n)),o);n++;
    }
    alert('تم استيراد '+n+' عنصر ✓');await refresh();
  }catch(err){alert('تعذّر الاستيراد: '+err.message)}
};
