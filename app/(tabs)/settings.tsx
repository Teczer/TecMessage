import { useColorScheme } from "nativewind";

import { Platform, Text, TouchableOpacity, View } from "react-native";
import ToggleTheme from "@/components/ToggleTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { storage } from "@/lib/mmkv";
import { FontAwesome } from "@expo/vector-icons";

export default function TabTwoScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  return (
    <SafeAreaView className="flex-1 pt-2 items-center justify-start bg-white dark:bg-black">
      <Text className="text-xl font-bold text-dark dark:text-white">
        Settings
      </Text>
      {/* THEME SETTINGS */}
      <View
        className="flex w-full items-center justify-center my-10"
        style={{ gap: 2 }}
      >
        <Text className="w-5/6 text-lg text-start text-dark dark:text-neutral-200 mb-4">
          Theme Settings
        </Text>
        <ToggleTheme
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          theme="light"
        />
        <ToggleTheme
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          theme="dark"
        />
      </View>
      <TouchableOpacity
        className="flex-row items-center justify-center bg-stone-100 dark:bg-stone-950 border rounded px-4 py-2"
        onPress={() => {
          storage.clearAll();
        }}
        style={{
          borderColor:
            colorScheme === "dark"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)",
        }}
      >
        <FontAwesome
          name="trash"
          size={24}
          color={colorScheme === "dark" ? "white" : "black"}
        />
      </TouchableOpacity>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
}
