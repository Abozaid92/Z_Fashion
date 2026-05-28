importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// 💡 تعديل 1: إجبار المتصفح على تفعيل الكود الجديد فوراً بدون انتظار
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

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

  // 💡 تعديل 2 (القراءة الدفاعية): مسك البيانات بأي شكل يبعته الـ SDK سواء مفرود أو جوه كائن
  console.log("Payload received:", payload);
  const notificationTitle =
    payload?.data?.title || payload?.title || "إشعار جديد";
  const notificationBody = payload?.data?.body || payload?.body || "";
  const notificationImage = payload?.data?.image || payload?.image || "";
  const notificationUrl = payload?.data?.url || payload?.url || "/";

  const notificationOptions = {
    body: notificationBody,
    icon: "/logo.png",
    badge: "/logo.png",
    image: notificationImage,
    data: {
      url: notificationUrl, // هيمشي مع الكود اللي تحت في الضغطة
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// 2. التعامل مع ضغطة المستخدم على الإشعار
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // استخراج الرابط بأمان من الـ data المرسلة
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
