// دالة مساعدة عشان نتأكد إننا في المتصفح قبل ما ننشئ الـ Audio
const createAudio = (path: string) => {
  if (typeof window !== "undefined") {
    return new Audio(path);
  }
  return null;
};

export const recievedAudioTone = createAudio(
  "/sounds/WhatsApp_Sound_Original_Message.mp3",
);
export const sentAudioTone = createAudio(
  "/sounds/WhatsApp_outgoing_message_sound_HQ.mp3",
);
export const TypingAudioTone = createAudio(
  "/sounds/Phone_typing_Free_Sound _ffect_[cut_1sec].mp3",
);
