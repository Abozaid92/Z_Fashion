import { useTranslations } from "next-intl";
import React from "react";

const IsTypingDesign = () => {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
            style={{ animationDelay: "0.1s" }}
          ></span>
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
            style={{ animationDelay: "0.2s" }}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default IsTypingDesign;
