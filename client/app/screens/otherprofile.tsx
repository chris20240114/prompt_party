import { useState, useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import { Link } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { createThemedStyles } from "../../styles/themedStyles";

export default function OtherProfileScreen() {
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);
  const [promptResponse, setPromptResponse] = useState("");
  const [hasResponded, setHasResponded] = useState(false);

  // Mock profile data - replace with real data from backend
  const profileData = {
    profileImage: "https://via.placeholder.com/150",
    displayName: "Jane Doe",
    username: "@janedoe123",
    customPrompt: "What's the best advice you've ever received? 💭",
    bgColor: "#6c63ff",
    streak: 47, // Days in a row
  };

  // Pinned prompts - user's favorite responses
  const pinnedPrompts = [
    {
      id: 1,
      prompt: "What made you smile yesterday?",
      answer: "My cat did the funniest thing while I was working from home! 😹",
      likes: 24,
      date: "3 days ago"
    },
    {
      id: 2,
      prompt: "If you could go anywhere right now?",
      answer: "Definitely Japan! I've been dreaming about visiting Tokyo and Kyoto for years 🇯🇵",
      likes: 18,
      date: "1 week ago"
    },
    {
      id: 3,
      prompt: "What inspired you today?",
      answer: "Reading about someone who started their dream business at 50. It's never too late! 💪",
      likes: 32,
      date: "2 weeks ago"
    },
  ];

  const handleSubmitResponse = () => {
    if (promptResponse.trim() === "") {
      alert("Please write a response!");
      return;
    }
    setHasResponded(true);
    console.log("Response submitted:", promptResponse);
    // TODO: Send to backend
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

      {/* Header / Banner */}
      <View style={[styles.header, { backgroundColor: profileData.bgColor }]}>

        {/* Edit Button in top-left (only show if viewing own profile) */}
        <Link href="/screens/profile" asChild>
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={20} color="#fff" />
          </TouchableOpacity>
        </Link>

        {/* Streak Flare in top-right */}
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text style={styles.streakNumber}>{profileData.streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>

        {/* Profile Image OVERLAPPING the header */}
        <View style={styles.profileImageContainerOther}>
          <Image
            source={{ uri: profileData.profileImage }}
            style={styles.profileImage}
          />
        </View>

      </View>

      {/* User Info */}
      <Text style={styles.displayName}>{profileData.displayName}</Text>
      <Text style={styles.username}>{profileData.username}</Text>

      {/* Custom Prompt Section - Visitors can answer */}
      <View style={styles.customPromptContainer}>
        <View style={styles.promptHeader}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#6c63ff" />
          <Text style={styles.customPromptTitle}>Their Prompt</Text>
        </View>
        <Text style={styles.customPromptText}>{profileData.customPrompt}</Text>

        {!hasResponded ? (
          <>
            <TextInput
              style={styles.promptInput}
              placeholder="Share your answer..."
              placeholderTextColor="#a0a8b0"
              value={promptResponse}
              onChangeText={setPromptResponse}
              multiline
            />
            <TouchableOpacity style={styles.promptSubmitButton} onPress={handleSubmitResponse}>
              <Text style={styles.promptSubmitText}>Send Response</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.responseSubmitted}>
            <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
            <Text style={styles.responseSubmittedText}>Response sent! ✓</Text>
          </View>
        )}
      </View>

      {/* Pinned Prompts Section */}
      <View style={styles.pinnedSection}>
        <View style={styles.pinnedHeader}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.pinnedTitle}>Pinned Responses</Text>
        </View>

        {pinnedPrompts.map((item) => (
          <View key={item.id} style={styles.pinnedCard}>
            <View style={styles.pinnedPromptHeader}>
              <Text style={styles.pinnedPrompt}>{item.prompt}</Text>
              <Ionicons name="pin" size={16} color="#6c63ff" />
            </View>
            <Text style={styles.pinnedAnswer}>{item.answer}</Text>
            <View style={styles.pinnedFooter}>
              <View style={styles.likesContainer}>
                <Ionicons name="heart" size={14} color="#FF6B6B" />
                <Text style={styles.likesText}>{item.likes} likes</Text>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
        ))}
      </View>

      </ScrollView>
    </SafeAreaView>
  );
}
