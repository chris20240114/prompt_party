# PromptParty API Server

A FastAPI-based backend server for PromptParty, providing both REST and GraphQL APIs for user management and post functionality.

## Environment Setup

**Set up environment variables** (create a `.env` file):
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key

   # Neo4j Configuration (optional)
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_neo4j_password
   USE_NEO4J=false
   ```

## Running the Server

```bash
python server.py
```

The server will start on `http://localhost:8000`

## API Documentation

Once the server is running, access the interactive documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **GraphQL Playground**: `http://localhost:8000/graphql`

## API Endpoints

### REST API Endpoints

#### Health Check
- **GET** `/` - Basic health check
- **GET** `/health` - Detailed health status

#### User Management
- **POST** `/users/register` - Register a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword",
    "profile_picture": "https://example.com/avatar.jpg",
    "bio": "Hello World!"
  }
  ```

- **GET** `/users/check-email/{email}` - Check if email exists
- **GET** `/users/check-username/{username}` - Check if username exists

#### Post Management
- **POST** `/posts/create` - Create a new post
  ```json
  {
    "content": "This is my first post!",
    "author_id": "user-uuid-here"
  }
  ```

### GraphQL API

#### Queries

**Get All Posts:**
```graphql
query {
  allPosts {
    postid
    content
    authorid
    date
    edited
    numLikes
  }
}
```

**Get User's Posts:**
```graphql
query {
  userPosts(userid: "user-uuid-here") {
    postid
    content
    date
    numLikes
  }
}
```

**Get Post by ID:**
```graphql
query {
  postById(postid: "post-uuid-here") {
    postid
    content
    authorid
    date
    edited
    numLikes
  }
}
```

#### Mutations

**Create Post:**
```graphql
mutation {
  createPost(postData: {
    content: "Hello GraphQL!",
    authorId: "user-uuid-here"
  }) {
    postid
    content
    authorid
    date
    numLikes
  }
}
```

## Project Structure

```
server/
├── server.py                 # FastAPI application entry point
├── classes.py                # Pydantic data models
├── graphql_types.py          # GraphQL type definitions
├── gql_schema.py            # GraphQL schema and resolvers
├── REST_routes.py           # REST API route handlers
├── database/
│   ├── relational_db/
│   │   └── supabase_service.py    # Supabase database operations
│   └── graph_db/
│       ├── graph.py              # Neo4j graph operations
│       └── imports.py            # Import helpers
└── README.md
```

### Database Operations

- **Relational data** (users, posts): Use functions in `database/relational_db/supabase_service.py`
- **Graph relationships** (likes, follows): Use functions in `database/graph_db/graph.py`

## Error Handling

The API handles errors gracefully:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side issues

GraphQL errors include detailed error messages for debugging.

## Data Models

### User
- `userid`: Unique identifier
- `username`: Display name
- `email`: Email address (validated)
- `profile_picture`: Optional avatar URL
- `bio`: Optional user biography

### Post
- `postid`: Unique identifier
- `content`: Post text content
- `author_id`: ID of the user who created the post
- `date`: Creation timestamp
- `edited`: Whether the post has been modified
- `num_likes`: Number of likes received

## Related Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Strawberry GraphQL Documentation](https://strawberry.rocks/)
- [Supabase Documentation](https://supabase.com/docs)
- [Neo4j Python Driver](https://neo4j.com/docs/python-manual/current/)
