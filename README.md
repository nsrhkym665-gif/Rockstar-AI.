# ROCK NEWS AR

نسخة Static/PWA كاملة قابلة للتشغيل مباشرة من خلال خادم ملفات ثابت.

## التشغيل
- افتح المشروع عبر أي Static Server.
- مثال Node: `npx serve .`
- أو استخدم VS Code Live Server.
- لا تعتمد على فتح `index.html` عبر `file://` إذا أردت PWA/Service Worker.

## البيانات
الأخبار الحالية محفوظة في `data/news.js` كمصدر محلي منظم، مع:
`title`, `description`, `game`, `date`, `source`, `sourceURL`, `official`.

تم تحديث البيانات أثناء إنشاء المشروع في 14 سبتمبر 2026، مع الاعتماد على صفحات Rockstar الرسمية المتاحة وقت الإنشاء.
الموقع لا يدّعي أن البيانات Live ولا يقوم بأي scraping أو تجاوز CORS.

## ما يعمل
- RTL عربي.
- بحث حقيقي داخل العنوان والوصف واللعبة والمصدر.
- فلاتر الألعاب والمفضلة.
- حفظ المفضلة عبر localStorage.
- نافذة قراءة.
- مشاركة الخبر ونسخ رابط داخلي.
- روابط المصادر الأصلية.
- قسم GTA VI بالمعلومات الرسمية.
- Responsive Mobile First.
- زر العودة للأعلى.
- Loading / Empty states.
- PWA manifest + service worker.
- تصميم أصلي بدون استخدام شعار Rockstar الرسمي.

## تحديث الأخبار لاحقًا
حدّث `data/news.js` فقط، أو اربط نفس البنية بواجهة Backend/Serverless موثوقة لاحقًا.
