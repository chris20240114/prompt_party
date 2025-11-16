import os
from dotenv import load_dotenv
import uuid

from supabase import create_client, Client

from .imports import UserCreate, UserResponse, PostCreate, PostResponse

from typing import Optional, Any
from datetime import datetime, timezone

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

assert SUPABASE_URL is not None, "SUPABASE_URL missing"
assert SUPABASE_KEY is not None, "SUPABASE_KEY missing"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def create_user(user_data: UserCreate) -> dict:
    """
    Creates a new user in Supabase authentication and adds their profile to the users table.
    
    Args:
        user_data (UserCreate): User creation data containing:
            - username (str): Unique username for the user
            - email (str): User's email address (used for authentication)
            - password (str): User's password (hashed by Supabase)
            - profile_picture (str, optional): URL to user's profile picture
            - bio (str, optional): User's biography/description
    
    Returns:
        dict: Response dictionary containing:
            - success (bool): Whether the operation was successful
            - user (UserResponse): Created user object if successful
            - error (str): Error message if unsuccessful
    
    Example:
        >>> user_data = UserCreate(
        ...     username="johndoe",
        ...     email="john@example.com",
        ...     password="securepassword123",
        ...     bio="Hello World!"
        ... )
        >>> result = await create_user(user_data)
        >>> if result["success"]:
        ...     print(f"Created user: {result['user'].username}")
        >>> else:
        ...     print(f"Error: {result['error']}")
    """
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })

        if not response.user:
            return {
                "success": False,
                "error": "failed to create user"
            }
        user_id = response.user.id

        record = {
            "userid": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "profile_picture": user_data.profile_picture,
            "bio": user_data.bio,
            "ranking": user_data.ranking
        }

        database_response = supabase.table("users").insert(record).execute()

        return {
            "success": True,
            "user": UserResponse(
                userid=user_id,
                username=user_data.username,
                email=user_data.email,
                profile_picture=user_data.profile_picture,
                bio=user_data.bio,
                ranking=user_data.ranking
            )
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

async def get_user_email(email: str) -> Optional[dict]:
    """
    Retrieves a user from the database by their email address.
    
    Args:
        email (str): The email address to search for
    
    Returns:
        Optional[dict]: User data dictionary if found, None if not found or error occurs
        
    Example:
        >>> user = await get_user_email("john@example.com")
        >>> if user:
        ...     print(f"Found user: {user['username']}")
        >>> else:
        ...     print("User not found")
    """
    try:
        response = supabase.table("users").select("*").eq("email", email).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    except Exception as e:
        print("Error finding user")
        return None

async def get_userid(username: str) -> Optional[dict]:
    """
    Retrieves a user ID from the database by their username.
    
    Args:
        username (str): The username to search for
    
    Returns:
        Optional[dict]: Response dictionary containing:
            - success (bool): Whether the operation was successful
            - userid (str): User ID if found
            - error (str): Error message if unsuccessful or user not found
            
    Example:
        >>> result = await get_userid("johndoe")
        >>> if result.get("success"):
        ...     print(f"User ID: {result['userid']}")
        >>> else:
        ...     print(f"Error: {result.get('error')}")
    """
    try:
        if username:
            response = supabase.table("users").select("userid").eq("username", username).execute()

            if response.data and len(response.data) > 0:
                return {"success": True, "userid": response.data[0]["userid"]}
            else:
                return {"success": False, "error": "No such user exists."}

    except Exception as e:
        return {"success": False, "error": str(e)}

async def get_user_username(username: str) -> Optional[dict]:
    """
    Retrieves a user from the database by their username.
    
    Args:
        username (str): The username to search for
    
    Returns:
        Optional[dict]: User data dictionary if found, None if not found or error occurs
        
    Example:
        >>> user = await get_user_username("johndoe")
        >>> if user:
        ...     print(f"Found user: {user['email']}")
        >>> else:
        ...     print("User not found")
    """
    try:
        response = supabase.table("users").select("*").eq("username", username).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None

    except Exception as e:
        print("Error finding username")
        return None
    
async def get_user_ranking(userid: str) -> dict:
    """
    Retrieves only the ranking dictionary for a given user by their user ID.

    Args:
        userid (str): The unique user ID to search for

    Returns:
        dict: Response dictionary containing:
            - success (bool): Whether the operation was successful
            - ranking (dict, optional): Ranking dictionary if found
            - error (str, optional): Error message if unsuccessful
    
    Example:
        >>> result = await get_user_ranking("123e4567-e89b-12d3-a456-426614174000")
        >>> if result["success"]:
        ...     print(result["ranking"])
        >>> else:
        ...     print(result["error"])
    """
    try:
        response = supabase.table("users").select("ranking").eq("userid", userid).execute()
        if response.data and len(response.data) > 0:
            ranking = response.data[0].get("ranking", {})
            return {"success": True, "ranking": ranking}
        else:
            return {"success": False, "error": "No such user exists"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_user(userid: str) -> dict:
    """
    Retrieves a user from the database by their user ID.
    
    Args:
        userid (str): The unique user ID to search for
    
    Returns:
        dict: Response dictionary containing:
            - success (bool): Whether the operation was successful
            - userid (str): User ID if found
            - username (str): Username if found
            - email (str): Email if found
            - profile_picture (str, optional): Profile picture URL if found
            - bio (str, optional): Bio if found
            - error (str): Error message if unsuccessful or user not found
            
    Example:
        >>> result = await get_user("123e4567-e89b-12d3-a456-426614174000")
        >>> if result.get("success"):
        ...     print(f"User: {result['username']} ({result['email']})")
        >>> else:
        ...     print(f"Error: {result.get('error')}")
    """
    try:
        response = supabase.table("users").select("*").eq("userid", userid).execute()

        if response.data and len(response.data) > 0:
            user_data = response.data[0]
            return {"success": True, **user_data}
        else:
            return {"success": False, "error": "No such user exists"}
    except Exception as e:
        return {"success": False, "error": str(e)}

async def delete_user(userid: str) -> dict:
    """
    Deletes a user from Supabase and returns the deleted user's data.
    
    This function first validates the UUID format, then retrieves the user data
    before deletion, performs the deletion, and returns the user data for
    use in related operations (like removing from graph database).
    
    Args:
        userid (str): The unique user ID to delete (must be valid UUID format)
    
    Returns:
        dict: Response dictionary containing:
            - success (bool): Whether the operation was successful
            - userid (str): Deleted user's ID if successful
            - username (str): Deleted user's username if successful
            - email (str): Deleted user's email if successful
            - profile_picture (str, optional): Deleted user's profile picture if successful
            - bio (str, optional): Deleted user's bio if successful
            - error (str): Error message if unsuccessful
            
    Example:
        >>> result = await delete_user("123e4567-e89b-12d3-a456-426614174000")
        >>> if result.get("success"):
        ...     print(f"Deleted user: {result['username']}")
        >>>     # Use user data for cleanup operations
        >>> else:
        ...     print(f"Error: {result.get('error')}")
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(userid)
        except ValueError:
            return {"success": False, "error": "Invalid UUID format"}
        
        user_response = supabase.table("users").select("*").eq("userid", userid).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            return {"success": False, "error": "No such user exists"}
        
        user_data = user_response.data[0]
        
        delete_response = (
            supabase.table("users")
            .delete()
            .eq("userid", userid)
            .execute()
        )
        
        return {"success": True, **user_data}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def update_user_field(userid: str, field_to_update: str, update: Any) -> dict:
    """ Updates user on specified field 
    
    Args: 
        userid (str): the userid of the user we want to update
        field_to_update (str): the field we seek to update
        update (str): our updated value

    Returns:
        dict: will contain the following: \
            - success (bool): whether or not the operation was successful
            - user_data (dict): this will be data for the updated user
            - error (str): the error message

    Raises:    
        AssertionError: if we try to update postid, authorid

    Example: 
        >>> response = field_to_update("uuid-here", "bio", "hello")
        >>> response["bio"] == "hello" # should return true!    
    """
    
    assert field_to_update != "userid", "You cannot update these parameters"
    
    try: 
        user_response = (
            supabase.table("users")
            .update({field_to_update: update})
            .eq("userid", userid)
            .execute()
        )

        if not user_response.data or len(user_response.data) == 0:
            return {"success": False, "error": "No such user exists"}
        
        user_data = supabase.table("users").select("*").eq("userid", userid).execute().data[0]

        return {"success": True, **user_data}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

async def create_post(post_data: PostCreate) -> dict:
    """
    Creates a new post and stores it in the Supabase posts table.
    
    Args:
        post_data (PostCreate): Post creation data containing:
            - content (str): The text content of the post
            - authorid (str): The user ID of the post author
    
    Returns:
        dict: Response dictionary containing:
            - success (bool): Whether the operation was successful
            - post (PostResponse): Created post object if successful, including:
                - postid (str): Auto-generated unique post ID
                - content (str): Post content
                - authorid (str): Author's user ID
                - date (str): Creation timestamp (ISO format)
                - edited (bool): Whether post was edited (False for new posts)
                - num_likes (int): Number of likes (0 for new posts)
            - error (str): Error message if unsuccessful
            
    Example:
        >>> post_data = PostCreate(
        ...     content="Hello World! This is my first post.",
        ...     authorid="123e4567-e89b-12d3-a456-426614174000"
        ... )
        >>> result = await create_post(post_data)
        >>> if result["success"]:
        ...     print(f"Created post: {result['post'].postid}")
        >>> else:
        ...     print(f"Error: {result['error']}")
    """
    try:
        post_id = str(uuid.uuid4())
        record = {
            "postid": post_id,
            "content": post_data.content,
            "authorid": post_data.authorid,
            "date": datetime.now(timezone.utc).isoformat(),
            "edited": False,
            "num_likes": 0
        }
        response = supabase.table("posts").insert(record).execute()
        if response.data is None or len(response.data) == 0:
            return {"success": False, "error": "Failed to insert post"}
        return {
            "success": True,
            "post": PostResponse(
                postid=post_id,
                content=post_data.content,
                authorid=post_data.authorid,
                date=record["date"],
                edited=False,
                num_likes=0
            )
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

async def delete_post(postid: str) -> dict:
    """
    Deletes a post from Supabase and returns the deleted user's data.
    
    This function first validates the UUID format, then retrieves the user data
    before deletion, performs the deletion, and returns the post data for
    use in related operations (like removing from graph database).
    
    Args:
        postid (str): The unique post ID to delete (must be valid UUID format)
    
    Returns:
        dict: Response dictionary containing: \
            - success (bool): Whether the operation was successful \
            - postid (str): Deleted post's ID if successful \
            - content (str): Deleted post's content if successful \
            - authorid (str): Deleted posts's author userid if successful \
            - date (str): Deleted posts's date of when created if successful \
            - edited (str): Deleted user's bio if successful \
            - num_likes (str): Number of likes for the post \
            - error (str): Error message if unsuccessful \          
    
    Example:
        >>> result = await delete_post("123e4567-e89b-12d3-a456-426614174000")
        >>> if result.get("success"):
        ...     print(f"Deleted post: {result['postname']}")
        >>>     # Use post data for cleanup operations
        >>> else:
        ...     print(f"Error: {result.get('error')}")
    """
    try:
        # Validate UUID format
        try:
            uuid.UUID(postid)
        except ValueError:
            return {"success": False, "error": "Invalid UUID format"}
        
        post_response = supabase.table("posts").select("*").eq("postid", postid).execute()
        
        if not post_response.data or len(post_response.data) == 0:
            return {"success": False, "error": "No such post exists"}
        
        post_data = post_response.data[0]
        
        delete_response = (
            supabase.table("posts")
            .delete()
            .eq("postid", postid)
            .execute()
        )
        
        return {"success": True, **post_data}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def update_post_field(postid: str, field_to_update: str, update: str) -> dict:
    """ Updates post on specified field 
    
    Args: 
        postid (str): the postid of the post we want to update
        field_to_update (str): the field we seek to update
        update (str): our updated value

    Returns:
        dict: will contain the following: \
            - success (bool): whether or not the operation was successful
            - post_data (dict): this will be data for the updated post
            - error (str): the error message

    Raises:    
        AssertionError: if we try to update postid, authorid

    Example: 
        >>> response = field_to_update("uuid-here", "content", "hello")
        >>> response["content"] == "hello" # should return true!    
    """

    assert field_to_update not in ("postid", "authorid"), "You cannot update these parameters"
    
    try: 
        post_response = (
            supabase.table("posts")
            .update({field_to_update: update})
            .eq("postid", postid)
            .execute()
        )

        if not post_response.data or len(post_response.data) == 0:
            return {"success": False, "error": "No such post exists"}
        
        post_data = supabase.table("posts").select("*").eq("postid", postid).execute().data[0]

        return {"success": True, **post_data}
    
    except Exception as e:
        return {"success": False, "error": str(e)}
    
async def get_user_posts(userid: str) -> dict:
    """
    Retrieves all posts created by a specific user.
    """
    try:
        response = supabase.table("posts").select("*").eq("authorid", userid).execute()
        if not response.data:
            return {"success": True, "posts": []}
        return {"success": True, "posts": response.data}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_post_by_id(postid: str) -> dict:
    """
    Retrieves a post by its postid.
    """
    try:
        response = supabase.table("posts").select("*").eq("postid", postid).execute()
        if not response.data or len(response.data) == 0:
            return {"success": False, "error": "No such post exists"}
        return {"success": True, "post": response.data[0]}
    except Exception as e:
        return {"success": False, "error": str(e)}
    
async def update_like_count(post):
    """
    Increments the num_likes field of the given post in Supabase.

    Args:
        post (Post): A Post object representing the liked post.

    Returns:
        dict: { "success": bool, "post": updated_post_data or None, "error": str or None }
    """
    try:
        # get current like count
        response = supabase.table("posts").select("num_likes").eq("postid", post.postid).execute()
        if not response.data:
            return {"success": False, "error": f"Post {post.postid} not found"}

        current_likes = response.data[0].get("num_likes", 0)

        # increment and update
        new_count = current_likes + 1
        update_response = (
            supabase.table("posts")
            .update({"num_likes": new_count})
            .eq("postid", post.postid)
            .execute()
        )

        updated_post = update_response.data[0] if update_response.data else None
        print(f"[Supabase] Updated like count for post {post.postid} -> {new_count}")

        return {"success": True, "post": updated_post}

    except Exception as e:
        print("Error updating like count:", e)
        return {"success": False, "error": str(e)}