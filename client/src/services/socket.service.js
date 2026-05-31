import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const createSocketClient = (token, onGlobalMessage) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws/chat`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: () => {},
    onConnect: () => {
      client.subscribe("/topic/admin/updates", (message) => {
        const newMsg = JSON.parse(message.body);
        onGlobalMessage(newMsg);
      });
    },
  });

  return client;
};