import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { GraphQLClient, gql } from "graphql-request";
import * as Haptics from "expo-haptics";

import { useTheme } from "../../context/ThemeContext";
import { createThemedStyles } from "../../styles/themedStyles";

type PromptPost = {
  postid: string;
  content: string;
  authorid: string;
  date?: string | null;
  edited?: boolean | null;
  numlikes: number;
  promptid?: string | null;
  replies?: PromptPost[];
};

type ReplyCard = {
  id: string;
  username: string;
  reply: string;
  replies?: PromptPost[];
  likes: number;
};

const CURRENT_USER_ID = "demo-user";

const USERNAME_MAP: { [key: string]: string } = {
  "demo-user": "you",
  "user-alice": "alice",
  "user-bob": "bob",
  "user-charlie": "charlie",
};

const DEMO_POSTS: PromptPost[] = [
  {
    postid: "demo-1",
    content: "Seeing a teammate light up when their idea finally clicked.",
    authorid: "user-alice",
    date: "Today",
    edited: false,
    numlikes: 12,
    promptid: null,
    replies: [
      {
        postid: "demo-1-reply-1",
        content: "That is the best kind of energy.",
        authorid: "user-bob",
        date: "Today",
        edited: false,
        numlikes: 3,
        promptid: null,
      },
    ],
  },
  {
    postid: "demo-2",
    content: "A morning walk, a clear head, and five minutes without notifications.",
    authorid: "user-bob",
    date: "Today",
    edited: false,
    numlikes: 8,
    promptid: null,
    replies: [],
  },
  {
    postid: "demo-3",
    content: "Someone sent me an old song I forgot I loved.",
    authorid: "user-charlie",
    date: "Today",
    edited: false,
    numlikes: 15,
    promptid: null,
    replies: [],
  },
];

const GET_POSTS_QUERY = gql`
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

const GET_USER_QUERY = gql`
  query GetUser($userid: String!) {
    userByUserid(userid: $userid) {
      username
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

const getGraphqlUrl = () => {
  const explicitGraphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;
  if (explicitGraphqlUrl) {
    return explicitGraphqlUrl;
  }

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
  return apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, "")}/graphql` : undefined;
};

export default function HomeScreen() {
  const { styles: themeStyles } = useTheme();
  const styles = useMemo(() => createThemedStyles(themeStyles), [themeStyles]);
  const graphQLUrl = useMemo(() => getGraphqlUrl(), []);
  const graphQLClient = useMemo(
    () => (graphQLUrl ? new GraphQLClient(graphQLUrl) : null),
    [graphQLUrl]
  );

  const [todayPrompt] = useState("What inspired you today?");
  const [backendPosts, setBackendPosts] = useState<PromptPost[]>(DEMO_POSTS);
  const [usernameMap, setUsernameMap] = useState<{ [key: string]: string }>(USERNAME_MAP);
  const [refreshing, setRefreshing] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [hasResponded, setHasResponded] = useState(false);
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<{ [key: string]: { username: string; text: string }[] }>({});

  const friendsReplies = useMemo(
    () => [
      { id: "1", username: "alice", reply: "Seeing the sunrise", likes: 2 },
      { id: "2", username: "bob", reply: "My morning run!", likes: 5 },
      { id: "3", username: "charlie", reply: "A random act of kindness", likes: 3 },
    ],
    []
  );

  const allReplies = useMemo(
    () => [
      ...friendsReplies,
      { id: "4", username: "david", reply: "Reading an amazing book", likes: 12 },
      { id: "5", username: "emma", reply: "Trying a new recipe", likes: 8 },
      { id: "6", username: "frank", reply: "A walk in the park", likes: 15 },
    ],
    [friendsReplies]
  );

  const popularReplies = useMemo(() => {
    return [...allReplies]
      .sort((a, b) => {
        const aLikes = a.likes + (likes[a.id] ? 1 : 0);
        const bLikes = b.likes + (likes[b.id] ? 1 : 0);
        return bLikes - aLikes;
      })
      .slice(0, 5);
  }, [allReplies, likes]);

  const loadDemoPosts = useCallback(() => {
    setBackendPosts(DEMO_POSTS);
    setUsernameMap(USERNAME_MAP);
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!graphQLClient) {
      loadDemoPosts();
      return;
    }

    try {
      const allPostsResponse = await graphQLClient.request<{ allPosts: PromptPost[] }>(GET_POSTS_QUERY);
      const allPosts = allPostsResponse.allPosts;
      const postsWithReplies = await Promise.all(
        allPosts.map(async (post) => {
          const repliesResponse = await graphQLClient.request<{ getReplies?: PromptPost[] }>(
            GET_REPLIES_QUERY,
            { postid: post.postid, k: 10 }
          );
          return { ...post, replies: repliesResponse.getReplies || [] };
        })
      );

      const uniqueAuthorIds = Array.from(new Set(allPosts.map((post) => post.authorid)));
      const nextUsernameMap: { [key: string]: string } = {};

      await Promise.all(
        uniqueAuthorIds.map(async (authorid) => {
          try {
            const { userByUserid } = await graphQLClient.request<{
              userByUserid?: { username: string };
            }>(GET_USER_QUERY, { userid: authorid });
            nextUsernameMap[authorid] = userByUserid?.username || authorid;
          } catch {
            nextUsernameMap[authorid] = authorid;
          }
        })
      );

      setBackendPosts(postsWithReplies);
      setUsernameMap({ ...USERNAME_MAP, ...nextUsernameMap });
    } catch (err) {
      console.error("Error fetching posts:", err);
      loadDemoPosts();
    }
  }, [graphQLClient, loadDemoPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (userResponse.trim() === "") {
      alert("Please write your response!");
      return;
    }

    if (!graphQLClient) {
      const newPost: PromptPost = {
        postid: `local-${Date.now()}`,
        content: userResponse,
        authorid: CURRENT_USER_ID,
        date: "Just now",
        edited: false,
        numlikes: 0,
        promptid: null,
        replies: [],
      };

      setBackendPosts((prev) => [newPost, ...prev]);
      setUsernameMap((prev) => ({ ...prev, [CURRENT_USER_ID]: "you" }));
      setHasResponded(true);
      setUserResponse("");
      return;
    }

    try {
      const res = await graphQLClient.request<{ createPost?: PromptPost }>(CREATE_POST, {
        postData: {
          content: userResponse,
          authorid: CURRENT_USER_ID,
          promptid: null,
        },
      });
      const newPost = res.createPost;

      if (!newPost) {
        alert("Failed to create post. Please try again.");
        return;
      }

      setBackendPosts((prev) => [{ ...newPost, replies: [] }, ...prev]);
      setUsernameMap((prev) => ({ ...prev, [newPost.authorid]: prev[newPost.authorid] || newPost.authorid }));
      setHasResponded(true);
      setUserResponse("");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to submit your response.");
    }
  };

  const handleLike = (id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReply = (id: string, username: string) => {
    setReplyingTo({ id, username });
  };

  const handleSendReply = () => {
    if (replyText.trim() === "" || !replyingTo) return;

    setReplies((prev) => ({
      ...prev,
      [replyingTo.id]: [...(prev[replyingTo.id] || []), { username: "You", text: replyText }],
    }));

    setReplyText("");
    setReplyingTo(null);
  };

  const renderReplyCard = (item: ReplyCard) => (
    <View key={item.id} style={styles.replyBox}>
      <Text style={styles.friendName}>
        {item.username === "user" || item.username === "you" ? "Your response" : `@${item.username}`}
      </Text>
      <Text style={styles.friendReply}>{item.reply}</Text>

      <View style={styles.replyActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
          <Ionicons
            name={likes[item.id] ? "heart" : "heart-outline"}
            size={18}
            color={likes[item.id] ? "#FF6B6B" : "#8b92a0"}
          />
          <Text style={styles.actionText}>{item.likes + (likes[item.id] ? 1 : 0)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleReply(item.id, item.username)}>
          <Ionicons name="chatbubble-outline" size={16} color="#8b92a0" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>

      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.postid} style={styles.replyItem}>
              <Text style={styles.replyUsername}>@{usernameMap[reply.authorid] || reply.authorid}</Text>
              <Text style={styles.replyTextDisplay}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}

      {replies[item.id] && replies[item.id].length > 0 && (
        <View style={styles.repliesContainer}>
          {replies[item.id].map((reply, idx) => (
            <View key={`${reply.username}-${idx}`} style={styles.replyItem}>
              <Text style={styles.replyUsername}>@{reply.username}</Text>
              <Text style={styles.replyTextDisplay}>{reply.text}</Text>
            </View>
          ))}
        </View>
      )}

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
            <TouchableOpacity style={styles.replyCancel} onPress={() => setReplyingTo(null)}>
              <Text style={styles.replyCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.replySend} onPress={handleSendReply}>
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
                editable={!hasResponded}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {hasResponded && (
          <View style={styles.promptHeaderContainer}>
            <Text style={styles.promptHeaderText}>{todayPrompt}</Text>
          </View>
        )}

        {hasResponded && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Your Response</Text>
            <View style={styles.contentWrapper}>
              {backendPosts
                .filter((post) => post.authorid === CURRENT_USER_ID)
                .map((post) =>
                  renderReplyCard({
                    id: post.postid,
                    username: usernameMap[post.authorid] || post.authorid,
                    reply: post.content,
                    replies: post.replies,
                    likes: post.numlikes,
                  })
                )}
            </View>
          </View>
        )}

        {hasResponded && backendPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>All Posts</Text>
            <View style={styles.contentWrapper}>
              {backendPosts.map((post) =>
                renderReplyCard({
                  id: post.postid,
                  username: usernameMap[post.authorid] || post.authorid,
                  reply: post.content,
                  replies: post.replies,
                  likes: post.numlikes,
                })
              )}
            </View>
          </View>
        )}

        {hasResponded && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Friend Replies</Text>
            <View style={styles.contentWrapper}>{friendsReplies.map((item) => renderReplyCard(item))}</View>
          </View>
        )}

        {hasResponded && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Popular Replies</Text>
            <View style={styles.contentWrapper}>{popularReplies.map((item) => renderReplyCard(item))}</View>
          </View>
        )}

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
