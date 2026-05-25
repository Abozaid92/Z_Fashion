import { useState, useEffect } from "react";
import { getToken, messaging } from "@/lib/firebase";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { DOMAIN } from "@/lib/constants";

export const useFcmToken = () => {
  // console.log("fcm called -----------------");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");

  const { mutate: updateToken } = useMutation({
    mutationFn: async (token: string) => {
      return await axios.patch(`${DOMAIN}/api/users/update-fcm-token`, {
        token,
      });
    },
    onSuccess: () => console.log("Token saved to DB successfully! ✅"),
    onError: (err) => console.error("Failed to save token:", err),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handlePermission = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        messaging
      ) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission === "granted") {
          // console.log("permission generated");
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            setToken(currentToken);
            updateToken(currentToken);
          }
        } else if (permission === "denied") {
          // alert("لقد قمت بحظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح لتلقي التنبيهات.");
        }
      }
    } catch (error) {
      console.error("Error in FCM Hook:", error);
    } finally {
      setLoading(false);
    }
  };

  return { token, handlePermission, loading, permissionStatus };
};
