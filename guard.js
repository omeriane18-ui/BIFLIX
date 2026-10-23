// منع تضمين الموقع داخل إطار موقع آخر (clickjacking / سرقة الواجهة)
if(window.top!==window.self){
  try{window.top.location.href=window.self.location.href}
  catch(_){document.documentElement.innerHTML=''}
}
