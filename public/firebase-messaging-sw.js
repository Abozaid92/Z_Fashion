importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// إعدادات فايربيز (تأكد إن القيم دي تطابق مشروعك)
firebase.initializeApp({
  apiKey: "AIza...",
  authDomain: "e-commerce-4c46f.firebaseapp.com",
  projectId: "e-commerce-4c46f",
  storageBucket: "e-commerce-4c46f.firebasestorage.app",
  messagingSenderId: "813815182360",
  appId: "1:813815182360:web:706af8ead25df49fb27f6d",
});

const messaging = firebase.messaging();

// 1. استقبال الإشعار وهو في الخلفية (Background)
messaging.onBackgroundMessage((payload) => {
  // console.log("Payload received:", payload);

  const notificationTitle = payload?.notification?.title || "إشعار جديد";

  const notificationOptions = {
    body: payload?.notification?.body || "",
    icon: "/logo.png",
    // 💡 التعديل هنا: بنجرب كل الاحتمالات لضمان ظهور الصورة
    image:
      payload?.notification?.image ||
      payload?.data?.image ||
      payload?.notification?.imageUrl,
    badge: "/logo.png",
    // 💡 التعديل هنا: لازم نمرر الـ data عشان كود الـ click_action يشتغل
    data: {
      url: payload?.data?.url || payload?.notification?.click_action || "/",
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
// 2. التعامل مع ضغطة المستخدم على الإشعار
self.addEventListener("notificationclick", function (event) {
  // إغلاق الإشعار من قائمة التنبيهات فور الضغط عليه
  event.notification.close();

  // استخراج الرابط من الـ data المرسلة من السيرفر
  // لو مبعتناش URL، هيفتح الصفحة الرئيسية للموقع
  const urlToOpen =
    event.notification.data && event.notification.data.url ?
      event.notification.data.url
    : "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        // التحقق لو الموقع مفتوح أصلاً في تابة، نوديه عليها ونعمل لها Focus
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // لو الموقع مش مفتوح، نفتح نافذة جديدة بالرابط والـ Params
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
