import { useTranslations } from "next-intl";

const MessageItemLoader = () => {
  const skeletonMessages = Array.from({ length: 10 });

  return (
    <div className="flex flex-col gap-5 w-full px-4 py-4 overflow-y-scroll">
      {skeletonMessages.map((_, index) => {
        // فكرة ذكية: جعل الرسائل تتبادل بين اليمين واليسار بشكل عشوائي أو منتظم
        const isEven = index % 2 === 0;

        return (
          <div
            key={index}
            className={`flex ${isEven ? "justify-start" : "justify-end"} animate-pulse`}
          >
            <div
              className={`
                rounded-2xl shadow-sm
                ${isEven ? "bg-slate-200 rounded-tl-none" : "bg-emerald-100 rounded-tr-none"}
                /* تنويع العرض (Width) عشان يبان حقيقي */
                ${
                  index % 3 === 0 ? "w-[60%] h-14"
                  : index % 3 === 1 ? "w-[40%] h-10"
                  : "w-[75%] h-20"
                }
              `}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageItemLoader;
