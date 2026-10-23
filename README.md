# BFLIX

موقع أفلام ومسلسلات ثابت (GitHub Pages) + Firebase Firestore للمحتوى. **بدون إعلانات، بدون تتبّع، بدون حسابات زوّار.**

## الأمان
- **CSP صارمة** في كل صفحة: لا سكربت إلا من الموقع نفسه وgstatic (Firebase) — أي سكربت إعلانات أو حقن يُحظر.
- **iframe بـ sandbox** بدون popups ولا تحويل للصفحة الأم: يمنع النوافذ المنبثقة والتحويلات الإعلانية من المشغّلات الخارجية.
- روابط الفيديو/الصور تُقبل **https فقط**. مكتبة HLS مستضافة محليًا (`vendor/`).
- **Firestore rules**: الزوّار قراءة فقط؛ الكتابة والحذف لصاحب الموقع فقط مع التحقق من شكل البيانات؛ كل ما عداه مرفوض.
- حماية من التضمين داخل مواقع أخرى (`guard.js`)، وتم حذف Google Analytics وتسجيل الدخول والتعليقات.
- لوحة التحكم `admin.html`: جلسة تنتهي بإغلاق التبويب، وغير مفهرسة، ولا رابط لها في الواجهة.

## خطوات لازمة بعد الرفع
1. **الصق `firestore.rules`** في Firebase Console ← Firestore ← Rules ← Publish.
2. **(منع الزيارات الوهمية)** فعّل Firebase App Check: Console ← App Check ← Web ← reCAPTCHA v3 ← انسخ الـ site key إلى `config.js` (`APPCHECK_KEY`) ثم فعّل Enforce على Firestore.
3. فعّل **التحقق بخطوتين** على حساب GitHub وحساب Firebase للأدمن، واستخدم كلمة مرور طويلة.
4. في GitHub: Settings ← Branches ← Branch protection على `main` (يمنع التعديل غير المصرّح به).
5. في Firebase ← Authentication ← Settings ← **عطّل إنشاء حسابات جديدة** (User actions) كي لا يستطيع أحد التسجيل.
