import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { createThemedStyles } from "../../styles/themedStyles";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";

export default function HomeScreen() {
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);

  // Simulate daily prompt and user state
  const [todayPrompt] = useState("What inspired you today?");
  const [userResponse, setUserResponse] = useState("");
  const [hasResponded, setHasResponded] = useState(false);
  const [showPastPrompts, setShowPastPrompts] = useState(false);
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<{ [key: string]: Array<{ username: string; text: string }> }>({});

  // Example friend replies and past prompts
  const friendsReplies = [
    { id: "1", username: "alice", reply: "Seeing the sunrise 🌅", likes: 2 },
    { id: "2", username: "bob", reply: "My morning run!", likes: 5 },
    { id: "3", username: "charlie", reply: "A random act of kindness 💙", likes: 3 },
  ];

  const pastPrompts = [
    {
      date: "Jan 9, 2025",
      prompt: "What made you smile yesterday?",
      yourReply: "My dog being goofy 🐶",
      friendsReplies: [
        { id: "p1-1", username: "alice", reply: "Got a surprise call from an old friend", likes: 4 },
        { id: "p1-2", username: "bob", reply: "Found $20 in my jacket pocket!", likes: 7 },
      ]
    },
    {
      date: "Jan 8, 2025",
      prompt: "If you could go anywhere right now?",
      yourReply: "Tokyo 🇯🇵",
      friendsReplies: [
        { id: "p2-1", username: "charlie", reply: "Iceland to see the northern lights", likes: 6 },
        { id: "p2-2", username: "alice", reply: "Back home to visit family", likes: 3 },
      ]
    },
    {
      date: "Jan 7, 2025",
      prompt: "What's your favorite way to unwind?",
      yourReply: "Reading a good book with tea",
      friendsReplies: [
        { id: "p3-1", username: "bob", reply: "Playing video games", likes: 5 },
        { id: "p3-2", username: "charlie", reply: "Going for a walk in nature", likes: 8 },
      ]
    },
  ];

  const handleSubmit = () => {
    if (userResponse.trim() === "") return alert("Please write your response!");
    setHasResponded(true);
  };

  const handleLike = (id: string) => {
    setLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleReply = (id: string, username: string) => {
    setReplyingTo({ id, username });
  };

  const handleSendReply = () => {
    if (replyText.trim() === "" || !replyingTo) return;

    // Add the reply to the replies state
    setReplies(prev => ({
      ...prev,
      [replyingTo.id]: [
        ...(prev[replyingTo.id] || []),
        { username: "You", text: replyText }
      ]
    }));

    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Theme Switcher - FOR TESTING ONLY */}
      <ThemeSwitcher />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Daily Prompt - Primary Focus */}
        <View style={!hasResponded ? styles.promptContainerFull : styles.promptContainerNormal}>
          <Text style={styles.promptTitle}>Today's Prompt</Text>
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>{todayPrompt}</Text>

            {!hasResponded && (
              <Text style={styles.friendsWaiting}>
                {friendsReplies.length} of your friends have already responded
              </Text>
            )}

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
        </View>

      {/* Friends' Replies Section - Only visible after answering */}
      {hasResponded && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Friends' Replies</Text>
          <View style={styles.contentWrapper}>
            {friendsReplies.map((item) => (
              <View key={item.id} style={styles.replyBox}>
                <Text style={styles.friendName}>@{item.username}</Text>
                <Text style={styles.friendReply}>{item.reply}</Text>

                {/* Like and Reply buttons */}
                <View style={styles.replyActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLike(item.id)}
                  >
                    <Text style={[styles.actionIcon, likes[item.id] && styles.likedIcon]}>
                      {likes[item.id] ? "❤️" : "🤍"}
                    </Text>
                    <Text style={styles.actionText}>
                      {item.likes + (likes[item.id] ? 1 : 0)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleReply(item.id, item.username)}
                  >
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>Reply</Text>
                  </TouchableOpacity>
                </View>

                {/* Display existing replies */}
                {replies[item.id] && replies[item.id].length > 0 && (
                  <View style={styles.repliesContainer}>
                    {replies[item.id].map((reply, idx) => (
                      <View key={idx} style={styles.replyItem}>
                        <Text style={styles.replyUsername}>@{reply.username}</Text>
                        <Text style={styles.replyTextDisplay}>{reply.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Reply Input */}
                {replyingTo?.id === item.id && (
                  <View style={styles.replyInputContainer}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder={`Reply to @${item.username}...`}
                      value={replyText}
                      onChangeText={setReplyText}
                      multiline
                    />
                    <View style={styles.replyInputActions}>
                      <TouchableOpacity
                        style={styles.replyCancel}
                        onPress={() => setReplyingTo(null)}
                      >
                        <Text style={styles.replyCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.replySend}
                        onPress={handleSendReply}
                      >
                        <Text style={styles.replySendText}>Send</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Past Prompts Section - Only visible after answering */}
      {hasResponded && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.pastPromptsToggle}
            onPress={() => setShowPastPrompts(!showPastPrompts)}
          >
            <Text style={styles.sectionHeader}>Previous Prompts</Text>
            <Text style={styles.toggleIcon}>{showPastPrompts ? "▼" : "▶"}</Text>
          </TouchableOpacity>

          {showPastPrompts && (
            <View style={styles.contentWrapper}>
              {pastPrompts.map((item, index) => (
                <View key={index} style={styles.pastBox}>
                  <Text style={styles.pastDate}>{item.date}</Text>
                  <Text style={styles.pastPrompt}>{item.prompt}</Text>
                  <View style={styles.yourReplyBox}>
                    <Text style={styles.yourReplyLabel}>Your reply:</Text>
                    <Text style={styles.pastReply}>{item.yourReply}</Text>
                  </View>
                  <View style={styles.pastFriendsReplies}>
                    <Text style={styles.pastFriendsLabel}>Friends' replies:</Text>
                    {item.friendsReplies.map((friend) => (
                      <View key={friend.id} style={styles.pastReplyCard}>
                        <View style={styles.pastReplyHeader}>
                          <Text style={styles.pastFriendName}>@{friend.username}</Text>
                        </View>
                        <Text style={styles.pastFriendReply}>{friend.reply}</Text>

                        {/* Like and Reply buttons for past prompts */}
                        <View style={styles.replyActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleLike(friend.id)}
                          >
                            <Text style={[styles.actionIcon, likes[friend.id] && styles.likedIcon]}>
                              {likes[friend.id] ? "❤️" : "🤍"}
                            </Text>
                            <Text style={styles.actionText}>
                              {friend.likes + (likes[friend.id] ? 1 : 0)}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleReply(friend.id, friend.username)}
                          >
                            <Text style={styles.actionIcon}>💬</Text>
                            <Text style={styles.actionText}>Reply</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Display existing replies for past prompts */}
                        {replies[friend.id] && replies[friend.id].length > 0 && (
                          <View style={styles.repliesContainer}>
                            {replies[friend.id].map((reply, idx) => (
                              <View key={idx} style={styles.replyItem}>
                                <Text style={styles.replyUsername}>@{reply.username}</Text>
                                <Text style={styles.replyTextDisplay}>{reply.text}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Reply Input for past prompts */}
                        {replyingTo?.id === friend.id && (
                          <View style={styles.replyInputContainer}>
                            <TextInput
                              style={styles.replyInput}
                              placeholder={`Reply to @${friend.username}...`}
                              value={replyText}
                              onChangeText={setReplyText}
                              multiline
                            />
                            <View style={styles.replyInputActions}>
                              <TouchableOpacity
                                style={styles.replyCancel}
                                onPress={() => setReplyingTo(null)}
                              >
                                <Text style={styles.replyCancelText}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.replySend}
                                onPress={handleSendReply}
                              >
                                <Text style={styles.replySendText}>Send</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}
