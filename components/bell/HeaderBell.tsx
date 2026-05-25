import { useTranslations } from "next-intl";
import useUpdateAllIsReadInNotification, {
  typeMutaion,
} from "@/hooks/useReadAllNotification";
import { useNotificationStatus } from "@/hooks/custom/notificationObserve";
import { useFcmToken } from "@/hooks/custom/useFcmToken";
import { Bell, BellOff } from "lucide-react";

const HeaderBell = ({ session }: { session: string }) => {
  const t = useTranslations("Notifications" as any);
  const { mutate } = useUpdateAllIsReadInNotification();
  const { isGranted, isDenied } = useNotificationStatus();
  const { handlePermission, loading } = useFcmToken();

  const handleReadAll = () => {
    const data: typeMutaion = { userId: session };
    mutate(data);
  };

  return (
    <div className="flex flex-col border-b border-gray-100 bg-emerald-50/30">
      <div className="px-4 py-3 flex justify-between items-center">
        <h2 className="text-sm font-bold text-emerald-950">{t("title")}</h2>

        <div className="flex items-center gap-2">
          {/* Notification Icon Logic */}
          {isGranted ?
            <Bell size={13} className="text-emerald-500 shrink-0" />
          : <button
              onClick={handlePermission}
              disabled={loading}
              title={
                isDenied ?
                  t("notifications_blocked")
                : t("enable_notifications")
              }
              className={`cursor-pointer transition-colors ${
                isDenied ? "text-red-400" : (
                  "text-slate-400 hover:text-emerald-600"
                )
              }`}
            >
              <BellOff size={13} />
            </button>
          }

          <button
            onClick={() => handleReadAll()}
            className="cursor-pointer text-[10px] text-emerald-600 font-bold hover:text-emerald-800 transition-colors"
          >
            {t("mark_all_read")}
          </button>
        </div>
      </div>

      {/* Warning Message if Denied */}
      {isDenied && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-red-500 font-medium leading-tight">
            {t("notifications_disabled_warning")}
          </p>
        </div>
      )}
    </div>
  );
};

export default HeaderBell;
