import { useTranslations } from "next-intl";
// import { UserNotification } from "@/app/api/utils/notificationSchema";
import { ArrowLeft, Trash2, User2Icon, Calendar } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

interface BellOnceItemProps {
  setSelectedNotification: Dispatch<SetStateAction<any | null>>;
  // selectedNotification: UserNotification;
  selectedNotification: any;
}

const BellOnceItem = ({
  setSelectedNotification,
  selectedNotification,
}: BellOnceItemProps) => {
  const t = useTranslations("Notifications" as any);
  const formattedDate = new Date(
    selectedNotification.createdAt,
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col animate-in slide-in-from-right-5 duration-300">
      {/* Header للرجوع */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-emerald-50/50">
        <button
          onClick={() => setSelectedNotification(null)}
          className="p-1.5 rounded-full text-emerald-700 hover:bg-emerald-100 transition-all active:scale-90"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-[13px] font-bold text-emerald-950 flex-1">
          {t("notification_details_title")}
        </h2>
      </div>

      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
            {selectedNotification.senderImage ?
              <Image
                src={selectedNotification.senderImage}
                width={80}
                height={80}
                className="object-cover w-full h-full"
                alt={selectedNotification.senderName || t("sender_alt")}
              />
            : <User2Icon size={35} className="text-emerald-600" />}
          </div>
        </div>

        <div className="w-full space-y-3">
          {/* اسم المرسل */}
          <div>
            <h3 className="font-black text-emerald-900 text-lg leading-tight">
              {selectedNotification.senderName}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {selectedNotification.sender}
            </span>
          </div>

          <div className="space-y-2 text-right">
            {/* العنوان - Title */}
            <div className="bg-emerald-50/30 p-3 rounded-t-xl border-b-2 border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-950">
                {selectedNotification.title}
              </h4>
            </div>

            {/* الوصف - Description (المحتوى الطرش) */}
            <div className="bg-gray-50 p-4 rounded-b-xl border border-gray-100 shadow-inner">
              <p className="text-[13px] text-gray-700 font-medium leading-relaxed break-words">
                {selectedNotification.description}
              </p>
            </div>
          </div>

          {/* التاريخ */}
          <div className="flex items-center justify-center gap-1.5 text-gray-400 mt-4">
            <Calendar size={12} />
            <p className="text-[10px] font-medium">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Footer زرار المسح */}
      <div className="p-3 bg-white border-t border-gray-100 mt-2">
        <button
          onClick={() => {
            // @TODO: ضيف لوجيك المسح هنا
            // console.log("Delete this one:", selectedNotification.id);
            setSelectedNotification(null);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-[0.98] border border-transparent hover:border-red-100"
        >
          <Trash2 size={16} />
          {t("delete_this_notification")}
        </button>
      </div>
    </div>
  );
};

export default BellOnceItem;
