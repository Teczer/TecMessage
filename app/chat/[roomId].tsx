import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { storage } from "@/lib/mmkv";
import { socket } from "@/lib/socket";
import { useColorScheme } from "nativewind";

interface Message {
  message: string;
  senderId: string;
  senderUsername: string;
  timestamp: string;
}

const getPrivateMessages = (roomId: string): Message[] => {
  const messagesData = storage.getString(`private_messages_${roomId}`);
  return messagesData ? JSON.parse(messagesData) : [];
};

const storePrivateMessage = (roomId: string, message: Message) => {
  const existingMessages = getPrivateMessages(roomId);
  existingMessages.push(message);
  storage.set(`private_messages_${roomId}`, JSON.stringify(existingMessages));
};

const ChatPage: React.FC = () => {
  const route = useRoute();
  const user = JSON.parse(storage.getString("user") || "{}");
  const { username, id } = user;
  const { roomId } = route.params as { roomId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (!roomId) {
      console.error("roomId is undefined");
      return;
    }

    console.log("roomId:", roomId);

    // Charger les messages précédents
    setMessages(getPrivateMessages(roomId));

    const handleNewMessage = (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      storePrivateMessage(roomId, msg);
    };

    const handlePreviousMessages = (previousMessages: Message[]) => {
      setMessages(previousMessages);
      previousMessages.forEach((msg) => storePrivateMessage(roomId, msg));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("previousMessages", handlePreviousMessages);

    // Join the room
    const userIds = roomId.split("_");
    if (userIds.length !== 2) {
      console.error("Invalid roomId format");
      return;
    }
    const [user1Id, user2Id] = userIds;
    socket.emit("joinRoom", { userId: user1Id, otherUserId: user2Id });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("previousMessages", handlePreviousMessages);
    };
  }, [roomId]);

  const sendMessage = () => {
    const senderId = id;
    const senderUsername = username;
    if (message.trim()) {
      const privateMessage: Message = {
        message,
        senderId,
        senderUsername,
        timestamp: new Date().toISOString(),
      };

      socket.emit("private-message", {
        senderId,
        senderUsername,
        receiverId: roomId.split("_").find((id) => id !== senderId),
        message: privateMessage.message,
      });

      // Réinitialiser le champ de message sans l'ajouter localement
      setMessage("");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      >
        {messages.map((msg) => (
          <View key={msg.timestamp} style={{ marginBottom: 8 }}>
            <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>
              {msg.senderUsername}: {msg.message}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TextInput
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginTop: 16,
          color: colorScheme === "dark" ? "#fff" : "#000",
        }}
      />
      <TouchableOpacity
        onPress={sendMessage}
        style={{ marginTop: 16, padding: 10, backgroundColor: "blue" }}
      >
        <Text style={{ color: "white" }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatPage;
