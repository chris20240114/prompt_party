from fastapi import APIRouter, HTTPException, status
from server.database.relational_db.supabase_service import create_user, get_user_email, get_user_username, UserCreate

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
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

@router.get("/check-email/{email}")
async def check_email_exists(email: str):
    user = await get_user_email(email)
    return {"exists": user is not None}

@router.get("/check-username/{username}")
async def check_username_exists(username: str):
    user = await get_user_username(username)
    return {"exists": user is not None}
