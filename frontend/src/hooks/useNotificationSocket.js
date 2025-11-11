import { useEffect } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";

export default function useNotificationSocket(onNotification) {
  useEffect(() => {
    if (typeof onNotification !== "function") return undefined;

    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const base = (api.defaults.baseURL || window.location.origin).replace(/\/api\/?$/, "");
    const socket = io(base, {
      auth: { token },
      transports: ["websocket"],
    });

    const handleIncoming = (payload) => {
      onNotification(payload);
    };

    socket.on("notification", handleIncoming);
    socket.on("connect_error", (err) => {
      console.error("Notification socket error", err.message);
    });

    return () => {
      socket.off("notification", handleIncoming);
      socket.disconnect();
    };
  }, [onNotification]);
}
