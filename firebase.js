import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,collection,getDocs,getDoc,doc,setDoc,addDoc,deleteDoc,query,orderBy,limit,getCountFromServer} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app=initializeApp({
  apiKey:"AIzaSyAT3fFdOtfJ-Xx5RxbHqM71XnxOARiUPUM",
  authDomain:"biflix-f5d51.firebaseapp.com",
  projectId:"biflix-f5d51",
  storageBucket:"biflix-f5d51.firebasestorage.app",
  messagingSenderId:"611452269817",
  appId:"1:611452269817:web:f1cb0442db6921af5a5e28",
  measurementId:"G-ZJT2HE1R1V"
});
export {app};
export const db=getFirestore(app), auth=getAuth(app);
export const ADMIN='omeriane0@gmail.com';
export {doc,setDoc,deleteDoc,signInWithEmailAndPassword,signOut,onAuthStateChanged};

export async function fetchItems(){
  try{
    const s=await getDocs(query(collection(db,'items'),orderBy('ts','desc')));
    return s.docs.map(d=>({...d.data(),id:d.id}));
  }catch(e){
    console.error(e);
    try{return await (await fetch('data.json')).json()}catch(_){return[]}
  }
}

// تسجيل الدخول بجوجل (اختياري للزوار)
export const loginGoogle=()=>signInWithPopup(auth,new GoogleAuthProvider());

// الإعجابات: items/{id}/likes/{uid}
export async function likeInfo(id,uid){
  const n=(await getCountFromServer(collection(db,'items',id,'likes'))).data().count;
  const me=uid?(await getDoc(doc(db,'items',id,'likes',uid))).exists():false;
  return {n,me};
}
export const setLike=(id,uid,on)=>on?setDoc(doc(db,'items',id,'likes',uid),{ts:Date.now()}):deleteDoc(doc(db,'items',id,'likes',uid));

// التعليقات: items/{id}/comments/{auto}
export async function getComments(id){
  const s=await getDocs(query(collection(db,'items',id,'comments'),orderBy('ts','desc'),limit(50)));
  return s.docs.map(d=>({...d.data(),id:d.id}));
}
export const addComment=(id,u,text)=>addDoc(collection(db,'items',id,'comments'),{uid:u.uid,name:u.displayName||'مستخدم',photo:u.photoURL||'',text,ts:Date.now()});
export const delComment=(id,cid)=>deleteDoc(doc(db,'items',id,'comments',cid));
