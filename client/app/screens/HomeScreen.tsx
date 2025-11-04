import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { BlurView } from "expo-blur";
import { homeStyles as styles } from "../../styles/homestyles";

export default function HomeScreen() {
  // Simulate daily prompt and user state
  const [todayPrompt] = useState("What inspired you today?");
  const [userResponse, setUserResponse] = useState("");
  const [hasResponded, setHasResponded] = useState(false);

  // Example friend replies and past prompts
  const friendsReplies = [
    { username: "alice", reply: "Seeing the sunrise 🌅" },
    { username: "bob", reply: "My morning run!" },
    { username: "charlie", reply: "A random act of kindness 💙" },
  ];

  const pastPrompts = [
    {
      prompt: "What made you smile yesterday?",
      yourReply: "My dog being goofy 🐶",
      friendsReplies: [
        { username: "alice", reply: "Got a surprise call from an old friend" },
        { username: "bob", reply: "Found $20 in my jacket pocket!" },
      ]
    },
    {
      prompt: "If you could go anywhere right now?",
      yourReply: "Tokyo 🇯🇵",
      friendsReplies: [
        { username: "charlie", reply: "Iceland to see the northern lights" },
        { username: "alice", reply: "Back home to visit family" },
      ]
    },
  ];

  const handleSubmit = () => {
    if (userResponse.trim() === "") return alert("Please write your response!");
    setHasResponded(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Daily Prompt - Primary Focus */}
        <Text style={styles.header}>Today's Prompt</Text>
      <View style={styles.promptBox}>
        <Text style={styles.promptText}>{todayPrompt}</Text>

        <TextInput
          style={styles.input}
          placeholder="Share your response..."
          value={userResponse}
          onChangeText={setUserResponse}
          multiline
          editable={!hasResponded}
        />

        {!hasResponded && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}

        {hasResponded && (
          <View style={styles.submittedIndicator}>
            <Text style={styles.submittedText}>✓ Submitted</Text>
          </View>
        )}
      </View>

      {/* Friends' Replies Section - Blurred until answered */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Friends' Replies</Text>
        <View style={styles.contentWrapper}>
          {hasResponded ? (
            // Show unblurred content
            <>
              {friendsReplies.map((item, index) => (
                <View key={index} style={styles.replyBox}>
                  <Text style={styles.friendName}>@{item.username}</Text>
                  <Text style={styles.friendReply}>{item.reply}</Text>
                </View>
              ))}
            </>
          ) : (
            // Show blurred content with lock message
            <View style={styles.blurredSection}>
              <View style={styles.lockedContent}>
                {friendsReplies.map((item, index) => (
                  <View key={index} style={styles.replyBox}>
                    <Text style={styles.friendName}>@{item.username}</Text>
                    <Text style={styles.friendReply}>{item.reply}</Text>
                  </View>
                ))}
              </View>
              <BlurView intensity={80} style={styles.blurOverlay} tint="light">
                <View style={styles.lockMessage}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockText}>Answer the prompt to see friends' replies</Text>
                </View>
              </BlurView>
            </View>
          )}
        </View>
      </View>

      {/* Past Prompts Section - Blurred until answered */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Previous Prompts</Text>
        <View style={styles.contentWrapper}>
          {hasResponded ? (
            // Show unblurred past prompts
            <>
              {pastPrompts.map((item, index) => (
                <View key={index} style={styles.pastBox}>
                  <Text style={styles.pastPrompt}>{item.prompt}</Text>
                  <View style={styles.yourReplyBox}>
                    <Text style={styles.yourReplyLabel}>Your reply:</Text>
                    <Text style={styles.pastReply}>{item.yourReply}</Text>
                  </View>
                  <View style={styles.pastFriendsReplies}>
                    {item.friendsReplies.map((friend, idx) => (
                      <View key={idx} style={styles.pastReplyBox}>
                        <Text style={styles.pastFriendName}>@{friend.username}:</Text>
                        <Text style={styles.pastFriendReply}>{friend.reply}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : (
            // Show blurred past prompts with lock message
            <View style={styles.blurredSection}>
              <View style={styles.lockedContent}>
                {pastPrompts.map((item, index) => (
                  <View key={index} style={styles.pastBox}>
                    <Text style={styles.pastPrompt}>{item.prompt}</Text>
                    <View style={styles.yourReplyBox}>
                      <Text style={styles.yourReplyLabel}>Your reply:</Text>
                      <Text style={styles.pastReply}>{item.yourReply}</Text>
                    </View>
                    <View style={styles.pastFriendsReplies}>
                      {item.friendsReplies.map((friend, idx) => (
                        <View key={idx} style={styles.pastReplyBox}>
                          <Text style={styles.pastFriendName}>@{friend.username}:</Text>
                          <Text style={styles.pastFriendReply}>{friend.reply}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <BlurView intensity={80} style={styles.blurOverlay} tint="light">
                <View style={styles.lockMessage}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockText}>Answer the prompt to see past prompts</Text>
                </View>
              </BlurView>
            </View>
          )}
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
