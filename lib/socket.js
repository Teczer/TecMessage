import { io } from "socket.io-client";
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

export const socket = io(
  process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000"
);
