# TypeScript API Tutorial

This tutorial shows how to use the PromptParty API from TypeScript/JavaScript applications. The API provides both REST and GraphQL endpoints for user management and post functionality.

## Setup

First, install the necessary dependencies:

```bash
npm install graphql-request
# or for fetch-based GraphQL
npm install @apollo/client graphql
```

## API Configuration

The server runs on `http://localhost:8000` by default. Here's the basic configuration:

```typescript
const API_BASE_URL = 'http://localhost:8000';
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
```

## Type Definitions

Define the TypeScript interfaces based on your API models:

```typescript
// Ranking types
interface RankingType {
  filmArtMusic: number;
  currentEvents: number;
  sports: number;
  comedy: number;
  technology: number;
}

interface RankingInput {
  filmArtMusic: number;
  currentEvents: number;
  sports: number;
  comedy: number;
  technology: number;
}

// User types
interface User {
  userid: string;
  username: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  bio?: string;
  ranking?: RankingType;
}

interface UserCreate {
  username: string;
  email: string;
  password: string;
  profile_picture?: string;
  bio?: string;
  ranking?: RankingInput;
}

// Post types
interface Post {
  postid: string;
  content: string;
  authorid: string;
  date: string;
  edited: boolean;
  num_likes: number;
  promptid?: string;
}

interface PostCreate {
  content: string;
  authorid: string;
  promptid?: string;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## REST API Usage

### User Management

#### Register a New User

```typescript
async function registerUser(userData: UserCreate): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to register user');
  }

  const result = await response.json();
  return result.user;
}

// Usage example
try {
  const newUser = await registerUser({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securepassword',
    profile_picture: 'https://example.com/avatar.jpg',
    bio: 'Hello World!'
  });
  console.log('User created:', newUser);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### Check Email Availability

```typescript
async function checkEmailExists(email: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/users/check-email/${encodeURIComponent(email)}`);
  const result = await response.json();
  return result.exists;
}

// Usage
const emailAvailable = await checkEmailExists('john@example.com');
console.log('Email available:', emailAvailable);
```

#### Check Username Availability

```typescript
async function checkUsernameExists(username: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/users/check-username/${encodeURIComponent(username)}`);
  const result = await response.json();
  return result.exists;
}
```

### Post Management

#### Create a New Post

```typescript
async function createPost(postData: PostCreate): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create post');
  }

  const result = await response.json();
  return result.post || result;
}

// Usage example
try {
  const newPost = await createPost({
    content: 'This is my first post!',
    authorid: 'user-uuid-here'
  });
  console.log('Post created:', newPost);
} catch (error) {
  console.error('Post creation failed:', error.message);
}
```

### Health Check

```typescript
async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();
    return result.status === 'healthy';
  } catch (error) {
    return false;
  }
}
```

## GraphQL API Usage

### Setup with graphql-request

```typescript
import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient(GRAPHQL_URL);

// GraphQL type definitions for queries and mutations
const GET_ALL_POSTS = gql`
  query GetAllPosts {
    allPosts {
      postid
      content
      authorid
      date
      edited
      numLikes
      promptid
    }
  }
`;

const GET_USER_POSTS = gql`
  query GetUserPosts($userid: String!) {
    userPosts(userid: $userid) {
      postid
      content
      authorid
      date
      edited
      numLikes
      promptid
    }
  }
`;

const GET_POST_BY_ID = gql`
  query GetPostById($postid: String!) {
    postById(postid: $postid) {
      postid
      content
      authorid
      date
      edited
      numLikes
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
      numLikes
      promptid
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($userData: UserInput!) {
    createUser(userData: $userData) {
      userid
      username
      email
      phone
      profilePicture
      ranking {
        filmArtMusic
        currentEvents
        sports
        comedy
        technology
      }
    }
  }
`;

const GET_USER_BY_USERID = gql`
  query GetUserByUserid($userid: String!) {
    userByUserid(userid: $userid) {
      userid
      username
      email
      phone
      profilePicture
      ranking {
        filmArtMusic
        currentEvents
        sports
        comedy
        technology
      }
    }
  }
`;

const GET_USERID_BY_USERNAME = gql`
  query GetUseridByUsername($username: String!) {
    useridByUsername(username: $username)
  }
`;

const GET_FRIENDS = gql`
  query GetFriends($username: String!) {
    getFriends(username: $username) {
      userid
      username
      email
      phone
      profilePicture
      ranking {
        filmArtMusic
        currentEvents
        sports
        comedy
        technology
      }
    }
  }
`;

const GET_REPLIES = gql`
  query GetReplies($postid: String!, $k: Int = 10) {
    getReplies(postid: $postid, k: $k) {
      postid
      content
      authorid
      date
      edited
      numLikes
      promptid
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId) {
      userid
      username
      email
      phone
      profilePicture
      ranking {
        filmArtMusic
        currentEvents
        sports
        comedy
        technology
      }
    }
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($postId: String!) {
    deletePost(postId: $postId) {
      postid
      content
      authorid
      date
      edited
      numLikes
      promptid
    }
  }
`;

const ADD_LIKE = gql`
  mutation AddLike($postData: PostInput!, $userData: UserInput!) {
    addLike(postData: $postData, userData: $userData) {
      postid
      content
      numLikes
      promptid
    }
  }
`;

const ADD_FOLLOW = gql`
  mutation AddFollow($user1Id: String!, $user2Id: String!) {
    addFollow(user1Id: $user1Id, user2Id: $user2Id) {
      userid
      username
      email
      phone
      profilePicture
      ranking {
        filmArtMusic
        currentEvents
        sports
        comedy
        technology
      }
    }
  }
`;

const UPDATE_POST_FIELD = gql`
  mutation UpdatePostField($postId: String!, $fieldToUpdate: String!, $update: String!) {
    updatePostField(postId: $postId, fieldToUpdate: $fieldToUpdate, update: $update) {
      postid
      content
      authorid
      date
      edited
      numLikes
      promptid
    }
  }
`;

const UPDATE_USER_FIELD = gql`
  mutation UpdateUserField($userId: String!, $fieldToUpdate: String!, $update: String!) {
    updateUserField(userId: $userId, fieldToUpdate: $fieldToUpdate, update: $update) {
      userid
      username
      email
      phone
      profilePicture
      ranking {
        filmArtMusic
        currentEvents
        sports
        comedy
        technology
      }
    }
  }
`;
```

### GraphQL Query Functions

#### Get All Posts

```typescript
async function getAllPosts(): Promise<Post[]> {
  try {
    const data = await client.request(GET_ALL_POSTS);
    return data.allPosts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
}
```

#### Get User's Posts

```typescript
async function getUserPosts(userid: string): Promise<Post[]> {
  try {
    const data = await client.request(GET_USER_POSTS, { userid });
    return data.userPosts;
  } catch (error) {
    console.error('Failed to fetch user posts:', error);
    throw error;
  }
}

// Usage
const userPosts = await getUserPosts('user-uuid-here');
console.log('User posts:', userPosts);
```

#### Get Post by ID

```typescript
async function getPostById(postid: string): Promise<Post | null> {
  try {
    const data = await client.request(GET_POST_BY_ID, { postid });
    return data.postById;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}
```

#### Get User Information

```typescript
async function getUserByUserid(userid: string): Promise<User | null> {
  try {
    const data = await client.request(GET_USER_BY_USERID, { userid });
    return data.userByUserid;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

async function getUseridByUsername(username: string): Promise<string | null> {
  try {
    const data = await client.request(GET_USERID_BY_USERNAME, { username });
    return data.useridByUsername;
  } catch (error) {
    console.error('Failed to fetch user ID:', error);
    return null;
  }
}

// Usage
const userid = await getUseridByUsername('johndoe');
console.log('User ID:', userid);
```

#### Get Friends (Mutual Followers)

```typescript
async function getFriends(username: string): Promise<User[]> {
  try {
    const data = await client.request(GET_FRIENDS, { username });
    return data.getFriends || [];
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    return [];
  }
}

// Usage
const friends = await getFriends('johndoe');
console.log('Friends:', friends);
// Note: Friends are users who both follow and are followed by the given user
```

#### Get Replies to a Post

```typescript
async function getReplies(postid: string, k: number = 10): Promise<Post[]> {
  try {
    const data = await client.request(GET_REPLIES, { postid, k });
    return data.getReplies || [];
  } catch (error) {
    console.error('Failed to fetch replies:', error);
    return [];
  }
}

// Usage
const replies = await getReplies('post-uuid-here', 10);
console.log('Replies:', replies);
// Returns up to k replies to the specified post
```

### GraphQL Mutation Functions

#### Create Post via GraphQL

```typescript
async function createPostGraphQL(postData: { content: string; authorid: string; promptid?: string }): Promise<Post | null> {
  try {
    const data = await client.request(CREATE_POST, { postData });
    return data.createPost;
  } catch (error) {
    console.error('Failed to create post:', error);
    return null;
  }
}

// Usage
const newPost = await createPostGraphQL({
  content: 'Hello GraphQL!',
  authorid: 'user-uuid-here',
  promptid: 'optional-prompt-id'
});
```

#### Create User via GraphQL

```typescript
async function createUserGraphQL(userData: UserCreate): Promise<User | null> {
  try {
    const data = await client.request(CREATE_USER, { userData });
    return data.createUser;
  } catch (error) {
    console.error('Failed to create user:', error);
    return null;
  }
}

// Usage
const newUser = await createUserGraphQL({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'securepassword',
  profile_picture: 'https://example.com/avatar.jpg',
  bio: 'Hello World!',
  ranking: {
    filmArtMusic: 5,
    currentEvents: 3,
    sports: 2,
    comedy: 4,
    technology: 5
  }
});
```

#### Delete User via GraphQL

```typescript
async function deleteUserGraphQL(userId: string): Promise<User | null> {
  try {
    const data = await client.request(DELETE_USER, { userId });
    return data.deleteUser;
  } catch (error) {
    console.error('Failed to delete user:', error);
    return null;
  }
}

// Usage
const deletedUser = await deleteUserGraphQL('user-uuid-here');
console.log('Deleted user:', deletedUser);
```

#### Delete Post via GraphQL

```typescript
async function deletePostGraphQL(postId: string): Promise<Post | null> {
  try {
    const data = await client.request(DELETE_POST, { postId });
    return data.deletePost;
  } catch (error) {
    console.error('Failed to delete post:', error);
    return null;
  }
}

// Usage
const deletedPost = await deletePostGraphQL('post-uuid-here');
console.log('Deleted post:', deletedPost);
```

#### Add Like via GraphQL

```typescript
async function addLikeGraphQL(
  postData: { content: string; authorid: string; promptid?: string },
  userData: UserCreate
): Promise<Post | null> {
  try {
    const data = await client.request(ADD_LIKE, { postData, userData });
    return data.addLike;
  } catch (error) {
    console.error('Failed to add like:', error);
    return null;
  }
}

// Usage
const likedPost = await addLikeGraphQL(
  { 
    content: 'Post content', 
    authorid: 'author-uuid-here',
    promptid: 'optional-prompt-id'
  },
  {
    username: 'likerusername',
    email: 'liker@example.com',
    password: 'password'
  }
);
console.log('Post after like:', likedPost);
// Note: This mutation requires full post and user data, not just IDs
```

#### Add Follow via GraphQL

```typescript
async function addFollowGraphQL(
  followerId: string,
  followedId: string
): Promise<User | null> {
  try {
    const data = await client.request(ADD_FOLLOW, {
      user1Id: followerId,
      user2Id: followedId
    });
    return data.addFollow;
  } catch (error) {
    console.error('Failed to add follow:', error);
    return null;
  }
}

// Usage
const followedUser = await addFollowGraphQL('follower-uuid-here', 'followed-uuid-here');
console.log('Now following:', followedUser);
```

#### Update Post Field via GraphQL

```typescript
async function updatePostFieldGraphQL(
  postId: string,
  fieldToUpdate: string,
  update: string
): Promise<Post | null> {
  try {
    const data = await client.request(UPDATE_POST_FIELD, {
      postId,
      fieldToUpdate,
      update
    });
    return data.updatePostField;
  } catch (error) {
    console.error('Failed to update post field:', error);
    return null;
  }
}

// Usage
const updatedPost = await updatePostFieldGraphQL(
  'post-uuid-here',
  'content',
  'Updated post content'
);
console.log('Updated post:', updatedPost);
// Note: Cannot update 'postid' or 'authorid' fields
```

#### Update User Field via GraphQL

```typescript
async function updateUserFieldGraphQL(
  userId: string,
  fieldToUpdate: string,
  update: string
): Promise<User | null> {
  try {
    const data = await client.request(UPDATE_USER_FIELD, {
      userId,
      fieldToUpdate,
      update
    });
    return data.updateUserField;
  } catch (error) {
    console.error('Failed to update user field:', error);
    return null;
  }
}

// Usage
const updatedUser = await updateUserFieldGraphQL(
  'user-uuid-here',
  'bio',
  'Updated biography'
);
console.log('Updated user:', updatedUser);
// Can be used to update fields like 'bio', 'username', 'profile_picture', etc.
```

## Complete API Client Class

Here's a complete TypeScript class that wraps all the API functionality:

```typescript
class PromptPartyAPI {
  private baseUrl: string;
  private graphqlClient: GraphQLClient;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.graphqlClient = new GraphQLClient(`${baseUrl}/graphql`);
  }

  // REST API methods
  async registerUser(userData: UserCreate): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to register user');
    }

    return (await response.json()).user;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/users/check-email/${encodeURIComponent(email)}`);
    return (await response.json()).exists;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/users/check-username/${encodeURIComponent(username)}`);
    return (await response.json()).exists;
  }

  async createPost(postData: PostCreate): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/posts/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create post');
    }

    return await response.json();
  }

  // GraphQL methods
  async getAllPosts(): Promise<Post[]> {
    return await this.graphqlClient.request(GET_ALL_POSTS).then(data => data.allPosts);
  }

  async getUserPosts(userid: string): Promise<Post[]> {
    return await this.graphqlClient.request(GET_USER_POSTS, { userid }).then(data => data.userPosts);
  }

  async getPostById(postid: string): Promise<Post | null> {
    try {
      return await this.graphqlClient.request(GET_POST_BY_ID, { postid }).then(data => data.postById);
    } catch (error) {
      return null;
    }
  }

  async createPostGraphQL(postData: { content: string; authorid: string; promptid?: string }): Promise<Post | null> {
    try {
      return await this.graphqlClient.request(CREATE_POST, { postData }).then(data => data.createPost);
    } catch (error) {
      console.error('GraphQL post creation failed:', error);
      return null;
    }
  }

  async getUserByUserid(userid: string): Promise<User | null> {
    try {
      return await this.graphqlClient.request(GET_USER_BY_USERID, { userid }).then(data => data.userByUserid);
    } catch (error) {
      return null;
    }
  }

  async getUseridByUsername(username: string): Promise<string | null> {
    try {
      return await this.graphqlClient.request(GET_USERID_BY_USERNAME, { username }).then(data => data.useridByUsername);
    } catch (error) {
      return null;
    }
  }

  async getFriends(username: string): Promise<User[]> {
    try {
      return await this.graphqlClient.request(GET_FRIENDS, { username }).then(data => data.getFriends || []);
    } catch (error) {
      return [];
    }
  }

  async getReplies(postid: string, k: number = 10): Promise<Post[]> {
    try {
      return await this.graphqlClient.request(GET_REPLIES, { postid, k }).then(data => data.getReplies || []);
    } catch (error) {
      return [];
    }
  }

  async createUserGraphQL(userData: UserCreate): Promise<User | null> {
    try {
      return await this.graphqlClient.request(CREATE_USER, { userData }).then(data => data.createUser);
    } catch (error) {
      console.error('GraphQL user creation failed:', error);
      return null;
    }
  }

  async deleteUserGraphQL(userId: string): Promise<User | null> {
    try {
      return await this.graphqlClient.request(DELETE_USER, { userId }).then(data => data.deleteUser);
    } catch (error) {
      console.error('GraphQL user deletion failed:', error);
      return null;
    }
  }

  async deletePostGraphQL(postId: string): Promise<Post | null> {
    try {
      return await this.graphqlClient.request(DELETE_POST, { postId }).then(data => data.deletePost);
    } catch (error) {
      console.error('GraphQL post deletion failed:', error);
      return null;
    }
  }

  async addLikeGraphQL(postData: { content: string; authorid: string; promptid?: string }, userData: UserCreate): Promise<Post | null> {
    try {
      return await this.graphqlClient.request(ADD_LIKE, { postData, userData }).then(data => data.addLike);
    } catch (error) {
      console.error('GraphQL like addition failed:', error);
      return null;
    }
  }

  async addFollowGraphQL(followerId: string, followedId: string): Promise<User | null> {
    try {
      return await this.graphqlClient.request(ADD_FOLLOW, { user1Id: followerId, user2Id: followedId }).then(data => data.addFollow);
    } catch (error) {
      console.error('GraphQL follow addition failed:', error);
      return null;
    }
  }

  async updatePostFieldGraphQL(postId: string, fieldToUpdate: string, update: string): Promise<Post | null> {
    try {
      return await this.graphqlClient.request(UPDATE_POST_FIELD, { postId, fieldToUpdate, update }).then(data => data.updatePostField);
    } catch (error) {
      console.error('GraphQL post update failed:', error);
      return null;
    }
  }

  async updateUserFieldGraphQL(userId: string, fieldToUpdate: string, update: string): Promise<User | null> {
    try {
      return await this.graphqlClient.request(UPDATE_USER_FIELD, { userId, fieldToUpdate, update }).then(data => data.updateUserField);
    } catch (error) {
      console.error('GraphQL user update failed:', error);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

// Usage
const api = new PromptPartyAPI();

// Example usage
async function example() {
  try {
    // Check if API is healthy
    const isHealthy = await api.checkHealth();
    console.log('API Health:', isHealthy);

    if (!isHealthy) throw new Error('API is not available');

    // Register a new user
    const newUser = await api.registerUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      bio: 'Test user bio'
    });
    console.log('Created user:', newUser);

    // Create a post
    const newPost = await api.createPost({
      content: 'Hello from TypeScript!',
      authorid: newUser.userid
    });
    console.log('Created post:', newPost);

    // Get all posts via GraphQL
    const allPosts = await api.getAllPosts();
    console.log('All posts:', allPosts);

    // Get user's posts
    const userPosts = await api.getUserPosts(newUser.userid);
    console.log('User posts:', userPosts);

    // Get friends (mutual followers)
    const friends = await api.getFriends(newUser.username);
    console.log('Friends:', friends);

    // Get replies to a post
    if (newPost) {
      const replies = await api.getReplies(newPost.postid, 10);
      console.log('Replies:', replies);
    }

    // Update a post
    if (newPost) {
      const updatedPost = await api.updatePostFieldGraphQL(
        newPost.postid,
        'content',
        'Updated content!'
      );
      console.log('Updated post:', updatedPost);
    }

    // Add a like
    if (newPost) {
      const likedPost = await api.addLikeGraphQL(
        { 
          content: newPost.content, 
          authorid: newPost.authorid,
          promptid: newPost.promptid
        },
        {
          username: 'anotheruser',
          email: 'another@example.com',
          password: 'password123'
        }
      );
      console.log('Post after like:', likedPost);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Error Handling

Always wrap API calls in try-catch blocks and handle specific error cases:

```typescript
async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}

// Usage
const posts = await safeApiCall(() => api.getAllPosts());
if (posts) {
  console.log('Posts loaded successfully');
} else {
  console.log('Failed to load posts');
}
```

This tutorial covers all the main API endpoints and provides a solid foundation for integrating with the PromptParty API from TypeScript applications.
