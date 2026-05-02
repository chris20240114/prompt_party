from fastapi import APIRouter, HTTPException, status
from database.relational_db.supabase_service import create_user, get_user_email, get_user_username, UserCreate, create_post, PostCreate

user_router = APIRouter(prefix="/users", tags=["users"])
post_router = APIRouter(prefix="/posts", tags=["Posts"])

@user_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user account.
    
    Creates a new user account after validating that the username and email
    are not already in use. The user is created in Supabase authentication
    and added to the users table.
    
    Args:
        user_data (UserCreate): User registration data containing:
            - username (str): Unique username
            - email (str): Email address for authentication
            - password (str): User password
            - profile_picture (str, optional): Profile picture URL
            - bio (str, optional): User biography
    
    Returns:
        dict: Response containing success message and user data
        
    Raises:
        HTTPException: 400 if username or email already exists
        HTTPException: 500 if user creation fails
    """
    # Check if username exists
    existing_username = await get_user_username(user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check if email exists
    existing_email = await get_user_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    # Create user
    result = await create_user(user_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["error"]
        )

    return {
        "message": "User created successfully",
        "user": result["user"]
    }

@user_router.get("/check-email/{email}")
async def check_email_exists(email: str):
    """
    Check if an email address is already registered.
    
    Args:
        email (str): Email address to check
        
    Returns:
        dict: Response containing 'exists' boolean indicating if email is taken
    """
    user = await get_user_email(email)
    return {"exists": user is not None}

@user_router.get("/check-username/{username}")
async def check_username_exists(username: str):
    """
    Check if a username is already taken.
    
    Args:
        username (str): Username to check
        
    Returns:
        dict: Response containing 'exists' boolean indicating if username is taken
    """
    user = await get_user_username(username)
    return {"exists": user is not None}

@post_router.post("/create", response_model=dict)
async def add_post(post: PostCreate):
    """
    Create a new post.
    
    Creates a new post and stores it in the database. The post is assigned
    a unique ID and timestamp automatically.
    
    Args:
        post (PostCreate): Post data containing:
            - content (str): The text content of the post
            - authorid (str): The user ID of the post author
    
    Returns:
        dict: Response containing success status and post data
        
    Raises:
        HTTPException: 400 if post creation fails
    """

    result = await create_post(post)
    if result.get("success"):
        return result
    else:
        raise HTTPException(status_code=400, detail=result.get("error"))
