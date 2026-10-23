import {app,db,fetchItems} from './firebase.js';
import {doc,setDoc,deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
  if(u){$('lg').style.display='none';$('ap').style.display='block';await refresh()}
  else{$('lg').style.display='';$('ap').style.display='none'}
});
async function refresh(){D=await fetchItems();list()}
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
