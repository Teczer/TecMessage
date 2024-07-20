import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export function getUserStored(): User | null {
  const storedUser = storage.getString("user");
  return storedUser ? JSON.parse(storedUser) : null;
}
