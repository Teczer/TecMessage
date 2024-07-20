import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";

import { getUserStored, storage } from "@/lib/mmkv";
import { generateUserId } from "@/lib/utils";
import { socket } from "@/lib/socket";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import PingAnimation from "@/components/PingAnimation";

export default function TabOneScreen() {
  const { colorScheme } = useColorScheme();

  const storedUser: User | null = getUserStored();
  const [user, setUser] = useState<User | null>(storedUser);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    console.log("user connected", user);
    socket.emit("user-connected", { ...user, socketId: socket.id });

    // Listen for updated-connectedUser event from the server
    socket.on("updated-connectedUser", (users) => {
      setConnectedUsers(users);
    });

    // Clean up the listener when the component unmounts or user changes
    return () => {
      socket.off("updated-connectedUser");
    };
  }, [user]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black">
      {!user && (
        <View
          className="flex-1 w-full px-4 items-center justify-center bg-white dark:bg-black"
          style={{ gap: 10 }}
        >
          <Text className="text-xl font-bold text-dark dark:text-white">
            Register
          </Text>
          <View className="w-full flex flex-row items-center justify-between mt-10">
            <TextInput
              className="w-4/5 p-2 dark:text-white border border-gray-300 dark:border-gray-700 rounded"
              placeholderTextColor="#ccc"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
            />
            <TouchableOpacity
              className="flex-row items-center justify-center bg-stone-100 dark:bg-stone-950 border rounded px-4 py-2"
              onPress={() => {
                const user = { username, id: generateUserId(8) };
                setUser(user);
                storage.set("user", JSON.stringify(user));
              }}
              style={{
                borderColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.2)",
              }}
            >
              <Feather
                name="arrow-right"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {user && (
        <View
          className="flex-1 w-full px-4 items-center justify-start bg-white dark:bg-black"
          style={{ gap: 10 }}
        >
          <Text className="text-lg font-mono text-dark dark:text-white mt-4">
            Hello {user.username}!
          </Text>
          <ScrollView
            className="flex-1 w-full mt-10"
            contentContainerStyle={{
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {connectedUsers
              .filter((connectedUser) => connectedUser.id !== user.id)
              .map((connectedUser) => (
                <View
                  className="flex flex-row w-full items-center justify-center"
                  key={connectedUser.id}
                >
                  <PingAnimation />
                  <TouchableOpacity
                    className="flex-row items-center justify-center bg-stone-100 dark:bg-stone-950 border rounded px-6 py-2"
                    style={{
                      borderColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                    }}
                  >
                    <Text className="text-sm font-bold text-dark dark:text-white">
                      {connectedUser.username}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
