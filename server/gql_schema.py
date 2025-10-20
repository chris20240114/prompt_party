import strawberry
from strawberry.exceptions import GraphQLError

from typing import List, Optional

import database.relational_db.supabase_service as sp
import database.graph_db.graph as n4j

from graphql_types import UserType, UserInput, PostType, PostInput
from classes import User, Post, PostResponse, PostCreate, UserCreate, UserResponse

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
    def user_posts(self, userid: str) -> List[PostType]:
        #TODO for Sarah: please place all Supabase logic in supabase_service.py file
        """
        Retrieves all posts created by a specific user.
        
        Args:
            userid (str): The unique user ID to fetch posts for
            
        Returns:
            List[PostType]: List of posts created by the specified user.
                           Returns empty list if user has no posts or user doesn't exist.
        """
        response = sp.supabase.table("posts").select("postid").eq("author_id", userid).execute()
        post_ids = [p["postid"] for p in response.data]

        posts = []
        for pid in post_ids:
            res = sp.supabase.table("posts").select("*").eq("postid", pid).execute()
            if res.data:
                p = res.data[0]
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
    def post_by_id(self, postid: str) -> Optional[PostType]:
        #TODO for Sarah: please place all Supabase logic in supabase_service.py file
        """
        Retrieves a specific post by its unique post ID.
        
        Args:
            postid (str): The unique post ID to fetch
            
        Returns:
            Optional[PostType]: The post data if found, raises GraphQL error if not found
            
        Raises:
            GraphQLError: If the post with the given ID doesn't exist
        """
        res = sp.supabase.table("posts").select("*").eq("postid", postid).execute()
        
        if not res.data:
            raise GraphQLError(
                f"!! Post {postid} does not exist !!"
            )
        
        p = res.data[0]

        return PostType(
            postid=p["postid"],
            content=p["content"],
            authorid=p["author_id"],
            date=p["date"],
            edited=p["edited"],
            num_likes=p["num_likes"],
        )

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
                profile_picture=user_data.get("profile_picture")
            )
        except GraphQLError:
            raise
        except Exception as e:
            print("Error in fetching user: ", e)
            return



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
    def add_like(self, post_data: PostInput, user_data: UserInput) -> Optional[PostType]:
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
            #TODO make this function in supabase_service.py
            #update_like_count(post)

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
                profile_picture=user_data.get("profile_picture")
            )
        except GraphQLError:
            raise
        except Exception as e:
            print("Error in deleting user: ", e)
            return None



schema = strawberry.Schema(query=Query, mutation=Mutation)