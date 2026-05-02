import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { createThemedStyles } from "../../styles/themedStyles";

export default function PastPromptsScreen() {
  const router = useRouter();
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});

  // Mock past prompts data - replace with real data from backend
  const pastPrompts = [
    {
      id: "1",
      date: "Jan 9, 2025",
      prompt: "What made you smile yesterday?",
      yourReply: "My dog being goofy 🐶",
      friendsReplies: [
        { id: "p1-1", username: "alice", reply: "Got a surprise call from an old friend", likes: 4 },
        { id: "p1-2", username: "bob", reply: "Found $20 in my jacket pocket!", likes: 7 },
      ]
    },
    {
      id: "2",
      date: "Jan 8, 2025",
      prompt: "If you could go anywhere right now?",
      yourReply: "Tokyo 🇯🇵",
      friendsReplies: [
        { id: "p2-1", username: "charlie", reply: "Iceland to see the northern lights", likes: 6 },
        { id: "p2-2", username: "alice", reply: "Back home to visit family", likes: 3 },
      ]
    },
    {
      id: "3",
      date: "Jan 7, 2025",
      prompt: "What's your favorite way to unwind?",
      yourReply: "Reading a good book with tea",
      friendsReplies: [
        { id: "p3-1", username: "bob", reply: "Playing video games", likes: 5 },
        { id: "p3-2", username: "charlie", reply: "Going for a walk in nature", likes: 8 },
      ]
    },
    {
      id: "4",
      date: "Jan 6, 2025",
      prompt: "What's your biggest goal this year?",
      yourReply: "Learn a new language",
      friendsReplies: [
        { id: "p4-1", username: "alice", reply: "Run a marathon", likes: 12 },
        { id: "p4-2", username: "bob", reply: "Start my own business", likes: 9 },
      ]
    },
    {
      id: "5",
      date: "Jan 5, 2025",
      prompt: "What's your favorite memory from last week?",
      yourReply: "Dinner with old friends",
      friendsReplies: [
        { id: "p5-1", username: "charlie", reply: "Finishing a big project", likes: 6 },
        { id: "p5-2", username: "alice", reply: "A beautiful sunset hike", likes: 11 },
      ]
    },
  ];

  const handleLike = (id: string) => {
    setLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pastPromptsHeader}>
        <TouchableOpacity
          style={styles.pastPromptsBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#e6e8eb" />
        </TouchableOpacity>
        <Text style={styles.pastPromptsHeaderTitle}>Previous Prompts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.pastPromptsContainer}>
        {pastPrompts.map((item) => (
          <View key={item.id} style={styles.pastPromptCard}>
            {/* Date */}
            <Text style={styles.pastPromptDate}>{item.date}</Text>

            {/* Prompt Question */}
            <Text style={styles.pastPromptQuestion}>{item.prompt}</Text>

            {/* Your Response */}
            <View style={styles.pastPromptYourResponse}>
              <Text style={styles.pastPromptYourLabel}>Your response</Text>
              <Text style={styles.pastPromptYourText}>{item.yourReply}</Text>
            </View>

            {/* Friends Replies Count */}
            <View style={styles.pastPromptFriendsHeader}>
              <Ionicons name="people" size={16} color="#8b92a0" />
              <Text style={styles.pastPromptFriendsCount}>
                {item.friendsReplies.length} friend{item.friendsReplies.length !== 1 ? 's' : ''} replied
              </Text>
            </View>

            {/* Friends Replies List */}
            <View style={styles.pastPromptFriendsList}>
              {item.friendsReplies.map((friend) => (
                <View key={friend.id} style={styles.pastPromptFriendCard}>
                  <Text style={styles.pastPromptFriendName}>@{friend.username}</Text>
                  <Text style={styles.pastPromptFriendReply}>{friend.reply}</Text>

                  {/* Like Button */}
                  <TouchableOpacity
                    style={styles.pastPromptLikeButton}
                    onPress={() => handleLike(friend.id)}
                  >
                    <Ionicons
                      name={likes[friend.id] ? "heart" : "heart-outline"}
                      size={16}
                      color={likes[friend.id] ? "#FF6B6B" : "#8b92a0"}
                    />
                    <Text style={styles.pastPromptLikeCount}>
                      {friend.likes + (likes[friend.id] ? 1 : 0)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
