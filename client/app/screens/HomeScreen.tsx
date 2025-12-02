import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { createThemedStyles } from "../../styles/themedStyles";
import { GraphQLClient, gql } from 'graphql-request';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);
  const API_BASE_URL = 'http://localhost:8000'; 
  const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
  const client = new GraphQLClient(GRAPHQL_URL);
  const [backendPosts, setBackendPosts] = useState<any[]>([]);

  const GET_REPLIES_QUERY = gql`
    query GetReplies($postid: String!, $k: Int) {
      getReplies(postid: $postid, k: $k) {
        postid
        content
        authorid
        date
        edited
        numlikes
        promptid
      }
    }
  `;

  const CREATE_POST = gql`
  mutation CreatePost($postData: PostInput!) {
    createPost(postData: $postData) {
      postid
      content
      authorid
      date
      edited
      numlikes
      promptid
    }
  }
`;


  const [usernameMap, setUsernameMap] = useState<{ [key: string]: string }>({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const query = gql`
        query {
          allPosts {
            postid
            content
            authorid
            date
            edited
            numlikes
            promptid
          }
        }
      `;

      const allPostsResponse  = await client.request(query);
      const allPosts = allPostsResponse.allPosts;
      const postsWithReplies = await Promise.all(
        allPosts.map(async (post: any) => {
          const repliesResponse = await client.request(GET_REPLIES_QUERY, { postid: post.postid, k: 10 });
          const replies = repliesResponse.getReplies || [];
          return { ...post, replies};
        })
      );
      setBackendPosts(postsWithReplies);
      console.log("Fetched posts:", postsWithReplies);

      // Fetch usernames for all unique authorids
      const authorIds = allPosts.map((post: any) => post.authorid).filter((id: any): id is string => typeof id === 'string');
      const uniqueAuthorIds = Array.from(new Set<string>(authorIds));
      const usernameMapping: { [key: string]: string } = {};

      await Promise.all(
        uniqueAuthorIds.map(async (authorid: string) => {
          try {
            const userQuery = gql`
              query GetUser($userid: String!) {
                userByUserid(userid: $userid) {
                  username
                }
              }
            `;
            const { userByUserid } = await client.request(userQuery, { userid: authorid });
            if (userByUserid) {
              usernameMapping[authorid] = userByUserid.username;
            }
          } catch (err) {
            console.error(`Error fetching username for userid ${authorid}:`, err);
            // Fallback to authorid if username fetch fails
            usernameMapping[authorid] = authorid;
          }
        })
      );

      setUsernameMap(usernameMapping);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Trigger haptic feedback when refresh starts
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetchPosts();
    setRefreshing(false);
  };  

  // Simulate daily prompt and user state
  const [todayPrompt] = useState("What inspired you today?");
  const [userResponse, setUserResponse] = useState("");
  const [hasResponded, setHasResponded] = useState(false);
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<{ [key: string]: Array<{ username: string; text: string }> }>({});

  // Example friend replies
  const friendsReplies = [
    { id: "1", username: "alice", reply: "Seeing the sunrise 🌅", likes: 2, isFriend: true },
    { id: "2", username: "bob", reply: "My morning run!", likes: 5, isFriend: true },
    { id: "3", username: "charlie", reply: "A random act of kindness 💙", likes: 3, isFriend: true },
  ];

  // Example all replies (including non-friends for popular section)
  const allReplies = [
    ...friendsReplies,
    { id: "4", username: "david", reply: "Reading an amazing book", likes: 12, isFriend: false },
    { id: "5", username: "emma", reply: "Trying a new recipe", likes: 8, isFriend: false },
    { id: "6", username: "frank", reply: "A walk in the park", likes: 15, isFriend: false },
  ];

  // Get popular replies sorted by likes
  const popularReplies = useMemo(() => {
    return [...allReplies].sort((a, b) => {
      const aLikes = a.likes + (likes[a.id] ? 1 : 0);
      const bLikes = b.likes + (likes[b.id] ? 1 : 0);
      return bLikes - aLikes;
    }).slice(0, 5); // Top 5 most liked
  }, [likes, allReplies]);

  const handleSubmit = async () => {
  if (userResponse.trim() === "") return alert("Please write your response!");

  try {
    // TEMPORARY: authorid should come from auth / session
    const authorid = 'temp_id';   

    const variables = {
      postData: {
        content: userResponse,
        authorid,
        promptid: null
      }
    };

    const res = await client.request(CREATE_POST, variables);
    const newPost = res.createPost;

    // Insert new post at top of feed
    setBackendPosts(prev => [
      {
        ...newPost,
        username: usernameMap[newPost.authorid] || newPost.authorid,
        replies: []
      },
      ...prev
    ]);

    setHasResponded(true);

  } catch (err) {
    console.error("Error creating post:", err);
    alert("Failed to submit your response.");
  }
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

  const renderReplyCard = (item: any) => (
    <View key={item.id} style={styles.replyBox}>
      <Text style={styles.friendName}>
        {item.username === "user" ? "Your response" : `@${item.username}`}
      </Text>
      <Text style={styles.friendReply}>{item.reply}</Text>

      {/* Like and Reply buttons */}
      <View style={styles.replyActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons
            name={likes[item.id] ? "heart" : "heart-outline"}
            size={18}
            color={likes[item.id] ? "#FF6B6B" : "#8b92a0"}
          />
          <Text style={styles.actionText}>
            {item.likes + (likes[item.id] ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReply(item.id, item.username)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#8b92a0" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>

      {/* Display backend replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((r: any) => (
            <View key={r.postid} style={styles.replyItem}>
              <Text style={styles.replyUsername}>@{r.authorid}</Text>
              <Text style={styles.replyTextDisplay}>{r.content}</Text>
            </View>
          ))}
        </View>
      )}

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
            placeholderTextColor="#a0a8b0"
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4a9eff"
            colors={["#4a9eff"]}
          />
        }
      >
        {/* Daily Prompt - Only show before responding */}
        {!hasResponded && (
          <View style={styles.promptContainerFull}>
            <Text style={styles.promptTitle}>Prompt Party!</Text>
            <View style={styles.promptBox}>
              <Text style={styles.promptText}>{todayPrompt}</Text>

              <Text style={styles.friendsWaiting}>
                {friendsReplies.length} of your friends have already responded
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Share your response..."
                placeholderTextColor="#a0a8b0"
                value={userResponse}
                onChangeText={setUserResponse}
                multiline
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      {/* Show prompt text at top after responding */}
      {hasResponded && (
        <View style={styles.promptHeaderContainer}>
          <Text style={styles.promptHeaderText}>{todayPrompt}</Text>
        </View>
      )}

      {/* User's Response - Show after submitting */}
      {hasResponded && userResponse.trim() !== "" && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Your Response</Text>
          <View style={styles.contentWrapper}>
            {backendPosts.map((post: any) =>
              renderReplyCard({
                id: post.postid,
                username: usernameMap[post.authorid] || post.authorid,
                reply: post.content,
                replies: post.replies,
                likes: post.numlikes              })
            )}
          </View>
        </View>
      )}

      {/* Friends' Replies Section - Only visible after answering */}
      {hasResponded && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Friends' Replies</Text>
          <View style={styles.contentWrapper}>
            {friendsReplies.map((item) => renderReplyCard(item))}
          </View>
        </View>
      )}

      {/* Popular Replies Section - Only visible after answering */}
      {hasResponded && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Popular Replies</Text>
          <View style={styles.contentWrapper}>
            {popularReplies.map((item) => renderReplyCard(item))}
          </View>
        </View>
      )}

      {/* Past Prompts Link - Only visible after answering */}
      {hasResponded && (
        <Link href="/screens/PastPromptsScreen" asChild>
          <TouchableOpacity style={styles.pastPromptsLink}>
            <View style={styles.pastPromptsLinkContent}>
              <Ionicons name="time-outline" size={24} color="#4a9eff" />
              <Text style={styles.pastPromptsLinkText}>View Previous Prompts</Text>
              <Ionicons name="chevron-forward" size={24} color="#8b92a0" />
            </View>
          </TouchableOpacity>
        </Link>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}
