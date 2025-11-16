import strawberry
from strawberry.exceptions import GraphQLError

from typing import List, Optional

import database.relational_db.supabase_service as sp
import database.graph_db.graph as n4j

from graphql_types import UserType, UserInput, PostType, PostInput
from classes import User, Post, PostResponse, PostCreate, UserCreate, UserResponse
import uuid


# ---- Query Resolvers ----
@strawberry.type
class Query:
    @strawberry.field
    def all_posts(self) -> List[PostType]:
        """
        Retrieves all posts from the database.

        Returns:
            List[PostType]: List of all posts in the system, ordered by creation date.
                           Each post includes postid, content, authorid, date, edited flag, and like count.
        """
        response = sp.supabase.table("posts").select("*").execute()
        posts = []
        for p in response.data:
            posts.append(
                PostType(
                    postid=p["postid"],
                    content=p["content"],
                    authorid=p["author_id"],
                    date=p["date"],
                    edited=p["edited"],
                    num_likes=p["num_likes"],
                )
            )
        return posts

    @strawberry.field
    async def user_posts(self, userid: str) -> List[PostType]:
        """
        Retrieves all posts created by a specific user.

        Args:
            userid (str): The unique user ID to fetch posts for

        Returns:
            List[PostType]: List of posts created by the specified user.
                           Returns empty list if user has no posts or user doesn't exist.
        """
        result = await sp.get_user_posts(userid)

        if not result.get("success"):
            raise GraphQLError(f"Error fetching posts: {result.get('error')}")

        return [PostType(**p) for p in result.get("posts", [])]


    @strawberry.field
    async def post_by_id(self, postid: str) -> Optional[PostType]:
        """
        Retrieves a specific post by its unique post ID.

        Args:
            postid (str): The unique post ID to fetch

        Returns:
            Optional[PostType]: The post data if found, raises GraphQL error if not found

        Raises:
            GraphQLError: If the post with the given ID doesn't exist
        """
        result = await sp.get_post_by_id(postid)

        if not result.get("success"):
            raise GraphQLError(result.get("error", f"Post {postid} not found"))

        p = result["post"]
        return PostType(**p)


    @strawberry.field
    async def userid_by_username(self, username: str) -> Optional[str]:
        """
        Retrieves a user ID by looking up their username.

        Args:
            username (str): The username to search for

        Returns:
            Optional[str]: The user ID if found, None if not found or error occurs

        Raises:
            GraphQLError: If there's an error in the database lookup process
        """
        try:
            result = await sp.get_userid(username)

            if result is None:
                return None

            if not result.get("success"):
                raise GraphQLError(f"Error in fetching userid.\nDetails: {result.get('error')}")

            return result["userid"]
        except Exception as e:
            print("Error in fetching userid: ", e)
            return None

    @strawberry.field
    async def get_friends(self, username: str) -> Optional[List[UserType]]:
        """
        Retrieves a list of friends (mutual followers) for the given username.
        
        A 'friend' is defined as a user who both follows and is followed by the given user.
        This data comes from the Neo4j graph database.

        Args:
            username (str): The username whose friends to fetch.

        Returns:
            Optional[List[UserType]]: List of mutual friends as UserType objects, or None if error occurs.
        """
        try:
            # get userid from Supabase
            user_result = await sp.get_userid(username)
            if not user_result or not user_result.get("success"):
                raise GraphQLError(f"User '{username}' not found.")

            userid = user_result["userid"]

            # get full user data
            user_data = await sp.get_user(userid)
            if not user_data or not user_data.get("success"):
                raise GraphQLError(f"User data for '{username}' could not be fetched.")

            user = User(
                userid=userid,
                username=user_data["username"],
                email=user_data["email"]
            )

            # get friend ids from Neo4j
            friend_ids = n4j.find_friends(user)

            friends = []
            for fid in friend_ids:
                friend_data = await sp.get_user(fid)
                if friend_data.get("success"):
                    friends.append(
                        UserType(
                            userid=friend_data["userid"],
                            username=friend_data["username"],
                            email=friend_data["email"],
                            phone=None,
                            profile_picture=friend_data.get("profile_picture"),
                            ranking=friend_data.get("ranking")
                        )
                    )

            return friends

        except Exception as e:
            print("Error in get_friends:", e)
            return None

    @strawberry.field
    async def user_by_userid(self, userid: str) -> Optional[UserType]:
        """
        Retrieves a user's profile information by their user ID.

        Args:
            userid (str): The unique user ID to fetch information for

        Returns:
            Optional[UserType]: User profile data if found, None if error occurs

        Raises:
            GraphQLError: If there's an error in the database lookup process
        """
        try:
            result = await sp.get_user(userid)

            if not result.get("success"):
                error_msg = result.get('error', 'Unknown error')
                raise GraphQLError(f"Error in fetching user.\nDetails: {error_msg}")

            user_data = {k: v for k, v in result.items() if k != 'success'}
            return UserType(
                userid=user_data.get("userid", ""),
                username=user_data.get("username", ""),
                email=user_data.get("email", ""),
                phone=None,
                profile_picture=user_data.get("profile_picture"),
                ranking=user_data.get("ranking")
            )
        except GraphQLError:
            raise
        except Exception as e:
            print("Error in fetching user: ", e)
            return

    @strawberry.field
    async def get_replies(self, postid: str, k: int = 10) -> List[PostType]:
        result = await sp.get_post_by_id(postid)

        parent = Post(**result["post"])

        reply_ids = n4j.find_replies(parent)[:k]

        replies = []

        for reply_id in reply_ids:
            result = await sp.get_post_by_id(reply_id)
            if result.get("success"):
                replies.append(PostType(**result["post"]))
        return replies



# ---- Mutation Resolvers ----
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_post(self, post_data: PostInput) -> Optional[PostType]:
        """
        Creates a new post and stores it in both relational and graph databases.

        Args:
            post_data (PostInput): Post creation data containing:
                - content (str): The text content of the post
                - authorid (str): The user ID of the post author

        Returns:
            Optional[PostType]: The created post data if successful, None if error occurs

        Raises:
            GraphQLError: If there's an error creating the post
        """
        try:
            post_create = PostCreate(**post_data.__dict__)
            result = await sp.create_post(post_create)

            if not result.get("success"):
                raise GraphQLError(f"Error in creating post.\nDetails: {result.get('error')}")

            post = result["post"]

            print(f"[Supabase] Success in adding post to supabase.")
            n4j.add_post(post)

            return post.convert_PostType

        except Exception as e:
            print("Error creating post:", e)
            return

    @strawberry.mutation
    async def create_user(self, user_data: UserInput) -> Optional[UserType]:
        """
        Creates a new user account and stores it in both relational and graph databases.

        Args:
            user_data (UserInput): User creation data containing:
                - username (str): Unique username for the user
                - email (str): User's email address (used for authentication)
                - password (str): User's password (hashed by Supabase)
                - profile_picture (str, optional): URL to user's profile picture
                - bio (str, optional): User's biography/description

        Returns:
            Optional[UserType]: The created user data if successful, None if error occurs

        Raises:
            GraphQLError: If there's an error creating the user (e.g., email/username already exists)
        """
        try:
            user_create = UserCreate(**user_data.__dict__)
            results = await sp.create_user(user_create)

            if not results.get("success"):
                raise GraphQLError(f"Error in creating user. \n Details: {results.get('error', 'Unknown error')}")

            print(f"[Supabase] Success in adding user to supabase.")
            user = results["user"]

            n4j.add_user(user)

            return user.convert_UserType()
        except Exception as e:
            print("Error creating user:", e)
            return

    @strawberry.mutation
    async def add_like(self, post_data: PostInput, user_data: UserInput) -> Optional[PostType]:
        """
        Adds a like from a user to a specific post in the graph database.

        Args:
            post_data (PostInput): Post data containing the post to like
            user_data (UserInput): User data for the user who is liking the post

        Returns:
            Optional[PostType]: The post data if successful, None if error occurs
        """
        try:
            user = User(**user_data.__dict__)
            post = Post(**post_data.__dict__)

            n4j.add_like(user, post)
            await sp.update_like_count(post)


            return post.convert_PostType
        except Exception as e:
            print("Error in adding like:", e)
            return

    @strawberry.mutation
    def add_follow(self, user1_id: str, user2_id: str) -> Optional[UserType]:
        """
        Creates a follow relationship between two users in the graph database.

        Args:
            user1_id (str): The user ID of the follower (who is following)
            user2_id (str): The user ID of the user being followed

        Returns:
            Optional[UserType]: The user being followed if successful, None if error occurs
        """
        try:
            user1 = User(sp.get_user(user1_id))
            user2 = User(sp.get_user(user1_id))

            n4j.add_follow(user1, user2)

            return user2.convert_UserType()

        except Exception as e:
            print(f"Error in having user {user1_id} follow {user2_id}")

    @strawberry.mutation
    async def delete_user(self, user_id: str) -> Optional[UserType]:
        """
        Deletes a user from both relational and graph databases.

        Args:
            user_id (str): The unique user ID to delete (must be valid UUID format)

        Returns:
            Optional[UserType]: The deleted user's data if successful, None if error occurs

        Raises:
            GraphQLError: If there's an error deleting the user (e.g., invalid UUID, user not found)
        """
        try:
            result = await sp.delete_user(user_id)

            if not result.get("success"):
                error_msg = result.get('error', 'Unknown error')
                raise GraphQLError(f"Error in deleting user.\n Details: {error_msg}")

            user_data = {k: v for k, v in result.items() if k != 'success'}
            print(f"[SUPABASE] Successfully deleted user {user_id}")

            user_data = await sp.get_user(user_id)
            user = User(**user_data)

            n4j.delete_user(user)

            return UserType(
                userid=user_data.get("userid", ""),
                username=user_data.get("username", ""),
                email=user_data.get("email", ""),
                phone=None,
                profile_picture=user_data.get("profile_picture"),
                ranking=user_data.get("ranking")
            )
        except GraphQLError:
            raise
        except Exception as e:
            print("Error in deleting user: ", e)
            return None

    @strawberry.mutation
    async def delete_post(self, post_id: str) -> Optional[PostType]:
        """
        Deletes a post from both relational and graph databases.

        Args:
            post_id (str): The unique post ID to delete (must be valid UUID format)

        Returns:
            Optional[PostType]: The deleted post's data if successful, None if error occurs

        Raises:
            GraphQLError: If there's an error deleting the post (e.g., invalid UUID, post not found)
        """
        try:
            result = await sp.delete_post(post_id)

            if not result.get("success"):
                error_msg = result.get('error', 'Unknown error')
                raise GraphQLError(f"Error in deleting user.\n Details: {error_msg}")

            post_data = {k: v for k, v in result.items() if k != 'success'}
            print(f"[SUPABASE] Successfully deleted user {post_id}")

            post = Post(**post_data)

            n4j.delete_post(post)

            return PostType(
                post=post_data.get("postid", ""),
                content=post_data.get("content", ""),
                authorid=post_data.get("authorid", ""),
                date=post_data.get("date", ""),
                edited=post.get("edited", ""),
                num_likes=post.get("num_likes", "")
            )
        except GraphQLError:
            raise
        except Exception as e:
            print("Error in deleting user: ", e)
            return None

    @strawberry.mutation
    async def update_post_field(self, post_id: str, field_to_update: str, update: str) -> Optional[PostType]:
        """
        Updates post on specified field

        Args:
            postid (str): the postid of the user we want to update
            field_to_update (str): the field we seek to update
            update (str): our updated value

        Returns:
            Optional[PostType]: The updated post's data if successful, None if error occurs

        Raises:
            AssertionError: if we try to update userid, authorid
        """
        assert field_to_update not in ["postid", "authorid"], "You cannot update these parameters"

        try:

            response = sp.supabase.table("posts") \
            .update({field_to_update: update}) \
            .eq("postid", post_id) \
            .execute()
            post = (
                sp.supabase.table("posts")
                .update({field_to_update: update})
                .eq("postid", post_id)
                .execute()
            )

            if not response.data or len(response.data) == 0:
                print(f"[update_post_field] No post found with postid={post_id}")
                return None

            updated_post_data = response.data[0]

            print(f"[Supabase] Successfully updated {field_to_update} for post {post_id}.")
            return PostType(**updated_post_data)

        except Exception as e:
            print("Error in updating post: ", e)
            return None


    @strawberry.mutation
    async def update_user_field(self, user_id: str, field_to_update: str, update: str) -> Optional[PostType]:
        """
        Updates a user's field in the Supabase users table.

        Args:
            userid (str): The user ID to update.
            field_to_update (str): The field name to update (e.g., "bio", "username").
            update (str): The new value for that field.

        Returns:
            UserType: The updated user record.
        """
        result = await sp.update_user_field(user_id, field_to_update, update)

        if not result.get("success"):
            raise GraphQLError(result.get("error", "Failed to update user field"))

        return UserType(
            userid=result["userid"],
            username=result["username"],
            email=result["email"],
            profile_picture=result.get("profile_picture"),
            bio=result.get("bio"),
            ranking=result.get("ranking")
        )

schema = strawberry.Schema(query=Query, mutation=Mutation)
