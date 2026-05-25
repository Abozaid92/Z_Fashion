"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | undefined;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userId) return; // لو مفيش UserId متعملش اتصال أصلاً

    const socketInstance = io(
      "https://real-time-chat-for-zfashion-chat.up.railway.app",
      {
        query: { userId: userId },
        transports: ["websocket"], // إجبار المتصفح على WebSocket أسرع وأحسن لفيرسل
        reconnectionAttempts: 5, // يحاول يربط 5 مرات لو السيرفر وقع
      },
    );

    socketInstance.on("connect", () => {
      socketInstance.emit("join_Room_connection", userId);
      socketInstance.emit("roomId", userId);
    });

    setSocket(socketInstance);

    return () => {
      // هنا بنستخدم socketInstance مباشرة عشان نضمن إن الـ Emit يروح قبل الـ Disconnect
      socketInstance.emit("is_user_connected", {
        roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a",
        userId: userId,
      });
      socketInstance.disconnect();
    };
  }, [userId]); // الـ Effect هيشتغل بس لما الـ userId يتغير

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

// -------- ابقي اشتغل الكود الي تحت لو السيرفر في وضع الديفولمنت

// "use client";
// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
//   useRef,
// } from "react";
// import { io, Socket } from "socket.io-client";
// import { useSession } from "next-auth/react";
// const SocketContext = createContext<Socket | null>(null);

// export const SocketProvider = ({
//   children,
//   userId,
// }: {
//   children: ReactNode;
//   userId: string | undefined;
// }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);

//   useEffect(() => {
//     const socketInstance = io("https://z-fashion-e-commerce-chat.vercel.app", {
//       query: { userId: userId },
//     });

//     socketInstance.on("connect", () => {
//       // console.log("Socket connected, now joining room...");

//       // this emit => to join room to calcultae connections only (to put ☑ or ☑☑)
//       socketInstance.emit("join_Room_connection", userId);
//       // console.log(`we joined the ${userId} room in client with id: `, "");
//       socketInstance.emit("roomId", userId);
//     });

//     setSocket(socketInstance);
//     // console.log("socket in provider", socketInstance);
//     return () => {
//       socket?.emit("is_user_connected", {
//         roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a", // الغرفة الثابتة اللي عملناها
//         userId: userId,
//       });

//       socketInstance.disconnect();
//     };
//   }, [userId]);

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
