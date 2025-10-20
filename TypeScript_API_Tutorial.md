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
// User types
interface User {
  userid: string;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
}

interface UserCreate {
  username: string;
  email: string;
  password: string;
  profile_picture?: string;
  bio?: string;
}

// Post types
interface Post {
  postid: string;
  content: string;
  authorid: string;
  date: string;
  edited: boolean;
  num_likes: number;
}

interface PostCreate {
  content: string;
  authorid: string;
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
    }
  }
`;

const GET_USER_POSTS = gql`
  query GetUserPosts($userid: String!) {
    userPosts(userid: $userid) {
      postid
      content
      date
      numLikes
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
      numLikes
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($postData: UserInput!) {
    createUser(postData: $postData) {
      userid
      username
      email
      profilePicture
    }
  }
`;

const GET_USER_BY_USERID = gql`
  query GetUserByUserid($userid: String!) {
    userByUserid(userid: $userid) {
      userid
      username
      email
      profilePicture
    }
  }
`;

const GET_USERID_BY_USERNAME = gql`
  query GetUseridByUsername($username: String!) {
    useridByUsername(username: $username)
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
```

### GraphQL Mutation Functions

#### Create Post via GraphQL

```typescript
async function createPostGraphQL(postData: { content: string; authorid: string }): Promise<Post | null> {
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
  authorid: 'user-uuid-here'
});
```

#### Create User via GraphQL

```typescript
async function createUserGraphQL(userData: UserCreate): Promise<User | null> {
  try {
    const data = await client.request(CREATE_USER, { postData: userData });
    return data.createUser;
  } catch (error) {
    console.error('Failed to create user:', error);
    return null;
  }
}
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

  async createPostGraphQL(postData: { content: string; authorid: string }): Promise<Post | null> {
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
