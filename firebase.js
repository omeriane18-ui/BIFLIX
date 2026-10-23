// قراءة المحتوى فقط (الزوار لا يملكون أي صلاحية كتابة)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,collection,getDocs,query,orderBy} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const app=initializeApp({
  apiKey:"AIzaSyBrjk3fup3gN9oKz1G25atW0o7Czb5StqY",
  authDomain:"bflix2-6116a.firebaseapp.com",
  projectId:"bflix2-6116a",
  storageBucket:"bflix2-6116a.firebasestorage.app",
  messagingSenderId:"1049191430009",
  appId:"1:1049191430009:web:10d638bd8d3ceb23bca1a8"
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
