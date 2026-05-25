import { useTranslations } from "next-intl";
import {
  MessageCircle,
  Maximize2,
  Minimize2,
  X,
  Headphones,
  Bell,
  BellOff,
} from "lucide-react";
import { memo } from "react";
import { useNotificationStatus } from "@/hooks/custom/notificationObserve";
import { useFcmToken } from "@/hooks/custom/useFcmToken";
// import { useSocket } from "../../context/SocketProvider";

interface typeProps {
  toggleMinimize: () => void;
  toggleChat: () => void;
  isMinimized: boolean;
  session: string | null | undefined;
}

const HeaderChat = memo<typeProps>(
  ({ toggleMinimize, toggleChat, isMinimized, session }) => {
    const t = useTranslations("Chat" as any);

    const { isGranted, isDenied } = useNotificationStatus();

    const { handlePermission, loading } = useFcmToken();

    // const [status, setStatus] = useState("offline");

    // useEffect(() => {
    //   //
    //   if (!socket || !session) return; // لو السوكيت مش موجود، متعملش أي حاجة
    //   // 1. تعريف المستمع (Listener) مرة واحدة فقط
    //   const handleStatus = (status) => {
    //     // console.log("user connection status: ", status);
    //     setStatus(status);
    //   };
    //   // console.log("before set time out");
    //   // console.log("in set time out");
    //   // socket.on("user_connection_status", handleStatus);
    //   // const data = {
    //   //   roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a",
    //   //   userId: session,
    //   // };
    //   // socket.on("room_joined_ready", () => {
    //   //   // console.log("تم الانضمام للغرفة بنجاح، الآن نرسل طلب حالة الاتصال...");
    //   //   socket.emit("is_user_connected", {
    //   //     roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a",
    //   //     userId: session,
    //   //   });
    //   // });

    //   return () => {
    //     socket.off("user_connection_status");
    //     socket.off("room_joined_ready");
    //   };
    // }, [socket, session]);
    // // console.log("him in header chat anf this is the socket ", socket);

    return (
      <div>
        {/* تم تغيير الـ Gradient ليكون فاتح وهادئ (from-white to-emerald-50) مع حدود ناعمة */}
        <div className="border-b  border-emerald-100 bg-gradient-to-r from-white via-emerald-50/40 to-white px-1 py-2 md:px-5 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* أيقونة الشات بلون زمردي هادئ وخلفية فاتحة */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-black/70 shadow-sm">
                  <Headphones className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {t("support")}
                </h3>

                <div className="flex items-center gap-2">
                  {/* <button
                  // onClick={() => {
                  //   // console.log("هل السوكيت متصل؟", socket?.connected);
                  //   socket?.emit("is_user_connected", {
                  //     roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a", // الغرفة الثابتة اللي عملناها
                  //     userId: session,
                  //   });
                  //   socket?.on("user_connection_status", (status) => {
                  //     // console.log("حالة اتصال المستخدم: ", status);
                  //   });
                  //   // console.log("تم إرسال الطلب يدوياً!");
                  // }}
                  className="text-[10px] text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors font-semibold ml-2"
                >
                  {t("test_button")}
                </button> */}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isDenied && (
                <button
                  onClick={!isGranted ? handlePermission : undefined}
                  disabled={loading}
                  className="relative rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Enable notifications"
                  type="button"
                >
                  {isGranted ?
                    <Bell
                      className="h-4 w-4 text-emerald-600"
                      aria-hidden="true"
                    />
                  : <BellOff
                      className="h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />
                  }
                </button>
              )}

              <button
                onClick={toggleMinimize}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                aria-label={isMinimized ? t("maximize") : t("minimize")}
                type="button"
              >
                {isMinimized ?
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                : <Minimize2 className="h-4 w-4" aria-hidden="true" />}
              </button>

              <button
                onClick={toggleChat}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                aria-label={t("close_chat")}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isDenied && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[11px] font-medium text-red-600">
                قم بتفعيل الإشعارات من إعدادات المتصفح
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default HeaderChat;
