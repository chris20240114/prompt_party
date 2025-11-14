import { useState, useMemo } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { createThemedStyles } from "../../styles/themedStyles";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";

export default function ProfileScreen() {
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);
  // Editable fields
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bgColor, setBgColor] = useState("#6c63ff");
  const [customPrompt, setCustomPrompt] = useState("");

  // Non-editable fields
  const email = "user@example.com";
  const username = "exampleuser";
  const streak = 47; // From backend - read only

  // Mock pinned prompts with ability to unpin
  const [pinnedPrompts, setPinnedPrompts] = useState([
    {
      id: 1,
      prompt: "What made you smile yesterday?",
      answer: "My cat did the funniest thing while I was working from home! 😹",
      likes: 24,
      date: "3 days ago",
      isPinned: true,
    },
    {
      id: 2,
      prompt: "If you could go anywhere right now?",
      answer: "Definitely Japan! I've been dreaming about visiting Tokyo and Kyoto for years 🇯🇵",
      likes: 18,
      date: "1 week ago",
      isPinned: true,
    },
    {
      id: 3,
      prompt: "What inspired you today?",
      answer: "Reading about someone who started their dream business at 50. It's never too late! 💪",
      likes: 32,
      date: "2 weeks ago",
      isPinned: true,
    },
  ]);

  // Pick new profile picture
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUnpin = (id: number) => {
    Alert.alert(
      "Unpin Response",
      "Remove this from your pinned responses?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpin",
          style: "destructive",
          onPress: () => {
            setPinnedPrompts(pinnedPrompts.filter(item => item.id !== id));
          }
        }
      ]
    );
  };

  const handleSave = () => {
    console.log("Profile updated:", {
      profileImage,
      displayName,
      username,
      customPrompt,
    });
    alert("Profile updated!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Theme Switcher - FOR TESTING ONLY */}
      <ThemeSwitcher />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Header with background color */}
        <View style={[styles.header, { backgroundColor: bgColor }]}>

          {/* Streak Badge (Read-only) */}
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color="#FF6B35" />
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>

          {/* Profile Image overlapping banner */}
          <View style={styles.profileImageContainerOther}>
            <TouchableOpacity onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.placeholder]}>
                  <Text style={{ color: "#888" }}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Editable display name */}
        <TextInput
          style={styles.input}
          placeholder="Display name"
          value={displayName}
          onChangeText={setDisplayName}
        />

        {/* Non-editable username */}
        <View style={styles.emailBox}>
          <Text style={styles.emailLabel}>Username</Text>
          <Text style={styles.emailValue}>@{username}</Text>
        </View>

        {/* Non-editable email */}
        <View style={styles.emailBox}>
          <Text style={styles.emailLabel}>Email</Text>
          <Text style={styles.emailValue}>{email}</Text>
        </View>

        {/* Custom Prompt Editor */}
        <View style={styles.customPromptContainer}>
          <View style={styles.promptHeader}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#6c63ff" />
            <Text style={styles.customPromptTitle}>Your Custom Prompt</Text>
          </View>
          <Text style={styles.promptHelpText}>
            Set a question for visitors to answer on your profile
          </Text>
          <TextInput
            style={styles.promptInput}
            placeholder="e.g., What's your favorite quote?"
            value={customPrompt}
            onChangeText={setCustomPrompt}
            multiline
          />
        </View>

        {/* Manage Pinned Prompts */}
        <View style={styles.pinnedSection}>
          <View style={styles.pinnedHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.pinnedTitle}>Manage Pinned Responses</Text>
          </View>
          <Text style={styles.pinnedHelpText}>
            These appear on your profile. Tap the pin to remove.
          </Text>

          {pinnedPrompts.length === 0 ? (
            <View style={styles.emptyPinnedState}>
              <Ionicons name="pin-outline" size={40} color="#ccc" />
              <Text style={styles.emptyPinnedText}>No pinned responses yet</Text>
              <Text style={styles.emptyPinnedSubtext}>
                Pin your favorite responses from the home screen
              </Text>
            </View>
          ) : (
            pinnedPrompts.map((item) => (
              <View key={item.id} style={styles.pinnedCard}>
                <View style={styles.pinnedPromptHeader}>
                  <Text style={styles.pinnedPrompt}>{item.prompt}</Text>
                  <TouchableOpacity onPress={() => handleUnpin(item.id)}>
                    <Ionicons name="pin" size={18} color="#6c63ff" />
                  </TouchableOpacity>
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
            ))
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
