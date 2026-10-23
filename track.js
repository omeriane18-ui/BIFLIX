// إحصائيات مجهولة الهوية لصاحب الموقع: لا أسماء ولا IP ولا إعلانات ولا طرف ثالث.
// تحترم إعداد "عدم التتبّع" (DNT / GPC) في متصفح الزائر.
import {app,db,ready} from './firebase.js';
import {doc,setDoc,deleteDoc,writeBatch,serverTimestamp,increment} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {initializeAuth,indexedDBLocalPersistence,browserLocalPersistence,signInAnonymously} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const LS={get:k=>{try{return localStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}}};
const off=navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
const day=()=>{const d=new Date();return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate()};
let uid=null,page='home',item='',booted=null;

function boot(){
  if(off)return Promise.resolve();
  return booted||(booted=(async()=>{
    await ready;
    const auth=initializeAuth(app,{persistence:[indexedDBLocalPersistence,browserLocalPersistence]});
    uid=(await signInAnonymously(auth)).user.uid;
    countVisit();
    beat();
    setInterval(beat,40000);
    document.addEventListener('visibilitychange',()=>{document.hidden?leave():beat()});
    addEventListener('pagehide',leave);
  })().catch(()=>{uid=null}));
}
// زائر فريد في اليوم (علامة create-only تمنع التكرار من الخادم نفسه)
async function countVisit(){
  const d=day();if(LS.get('bf_vd')===String(d))return;
  try{
    const b=writeBatch(db);
    b.set(doc(db,'seen',d+'_'+uid),{ts:serverTimestamp()});
    b.set(doc(db,'daily',String(d)),{v:increment(1)},{merge:true});
    await b.commit();LS.set('bf_vd',String(d));
  }catch(_){}
}
// "نشط الآن": نبضة كل 40 ثانية أثناء ظهور الصفحة
function beat(){
  if(!uid||document.hidden)return;
  setDoc(doc(db,'presence',uid),{ts:serverTimestamp(),p:page,i:item}).catch(()=>{});
}
function leave(){if(uid)deleteDoc(doc(db,'presence',uid)).catch(()=>{})}

export async function setPage(p,i=''){
  await boot();page=p;item=/^[A-Za-z0-9]{1,40}$/.test(i)?i:'';beat();
}
// بدء تشغيل: مرة واحدة لكل زائر لكل عنوان في اليوم
export async function watch(id){
  await boot();
  if(!uid||!/^[A-Za-z0-9]{1,40}$/.test(id||''))return;
  const d=day(),key='bf_w'+d+id;if(LS.get(key))return;
  try{
    const b=writeBatch(db);
    b.set(doc(db,'wv',d+'_'+uid+'_'+id),{ts:serverTimestamp(),i:id});
    b.set(doc(db,'dw',d+'_'+id),{d,i:id,w:increment(1)},{merge:true});
    await b.commit();LS.set(key,'1');
  }catch(_){}
}
