import { useState, useEffect } from "react";

export const useNotificationStatus = () => {
  const [status, setStatus] = useState<NotificationPermission | "loading">(
    "loading",
  );
  // console.log("this is status", status);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setStatus(Notification.permission);
    }
  }, []);

  return {
    status,
    isGranted: status === "granted",
    isDenied: status === "denied",
    isDefault: status === "default", // لسه مخدش قرار
  };
};
