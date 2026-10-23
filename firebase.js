// قراءة المحتوى فقط (الزوار لا يملكون أي صلاحية كتابة)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,collection,getDocs,query,orderBy} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const app=initializeApp({
  apiKey:"AIzaSyAT3fFdOtfJ-Xx5RxbHqM71XnxOARiUPUM",
  authDomain:"biflix-f5d51.firebaseapp.com",
  projectId:"biflix-f5d51",
  storageBucket:"biflix-f5d51.firebasestorage.app",
  messagingSenderId:"611452269817",
  appId:"1:611452269817:web:f1cb0442db6921af5a5e28"
});
export const db=getFirestore(app);

// Firebase App Check (اختياري): يرفض الطلبات القادمة من سكربتات وبوتات ليست من موقعك
const KEY=(window.BF||{}).APPCHECK_KEY||'';
export const ready=(async()=>{
  if(!KEY)return;
  try{
    const m=await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js");
    m.initializeAppCheck(app,{provider:new m.ReCaptchaV3Provider(KEY),isTokenAutoRefreshEnabled:true});
  }catch(e){console.error(e)}
})();

export async function fetchItems(){
  await ready;
  try{
    const s=await getDocs(query(collection(db,'items'),orderBy('ts','desc')));
    return s.docs.map(d=>({...d.data(),id:d.id}));
  }catch(e){
    console.error(e);
    try{return await (await fetch('data.json')).json()}catch(_){return[]}
  }
}
