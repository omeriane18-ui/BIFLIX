import {fetchItems} from './firebase.js';
const $=i=>document.getElementById(i);
$('b').onclick=async()=>{
  $('m').textContent='جارٍ التحميل...';
  try{
    const d=await fetchItems();
    if(!d.length){$('m').textContent='لا يوجد محتوى لحفظه';return}
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));
    a.download='bflix-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
    $('m').textContent='تم حفظ '+d.length+' عنصر ✓ احتفظ بالملف في مكان آمن';
  }catch(e){$('m').textContent='تعذّر: '+e.message}
};
