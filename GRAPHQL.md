## This is what the user data thing looks like
graphql
type User {
  userid: String!
  username: String!
  email: String!
  profilePicture: String
  bio: String
}

## Check if the email exists
graphql
query {
  checkEmailExists(email: "user@example.com") {
    exists
  }
}


## Check if username exists
graphql
query {
  checkUsernameExists(username: "johndoe") {
    exists
  }
}


## Get user using email
graphql
query {
  getUserByEmail(email: "user@example.com") {
    userid
    username
    email
    profilePicture
    bio
  }
}


## Get user using username
graphql
query {
  getUserByUsername(username: "johndoe") {
    userid
    username
    email
    profilePicture
    bio
  }
}

## Add a user
graphql
mutation {
  registerUser(userInput: {
    username: "test"
    email: "test@gmail.com"
    password: "password6767!"
    profilePicture: "https://link"
    bio: "Gooner"
  }) {
    success
    message
    user {
      userid
      username
      email
    }
    error
  }
}
