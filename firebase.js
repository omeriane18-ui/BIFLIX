import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,collection,getDocs,doc,setDoc,deleteDoc,query,orderBy} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
