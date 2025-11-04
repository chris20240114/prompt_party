import os
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from typing import Optional
from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# create the user data model thing
class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str
  profile_picture: Optional[str] = None
  bio: Optional[str] = None

#no password
class UserResponse(BaseModel):
  userid: str
  username: str
  email: EmailStr
  profile_picture: Optional[str] = None
  bio: Optional[str] = None

async def create_user(user_data: UserCreate) -> dict:
  #create a new user and also puts them into the supabase table
  try:
    response = supabase.auth.sign_up({
    "email": user_data.email,
    "password": user_data.password,
    })

    if not response:
      return {
        "success": False,
        "error": "failed to create user"
      }
    user_id = response.user.id

    record = {
      "userid":user_id,
      "username":user_data.username,
      "email": user_data.email,
      "profile_picture":user_data.profile_picture,
      "bio":user_data.bio
    }

    database_response = supabase.table("users").insert(record).execute()

    return {
      "success": True,
      "user": UserResponse(
          userid=user_id,
          username=user_data.username,
          email=user_data.email,
          profile_picture=user_data.profile_picture,
          bio=user_data.bio
      )
    }
  except Exception as e:
      # errors
      return {
          "success": False,
          "error": str(e)
      }

async def get_user_email(email:str) -> Optional[dict]:
  #see if the user is in the database

  try:
    response = supabase.table("users").select("*").eq("email", email).execute()

    if response.data and len(response.data) > 0:
      return response.data[0]
    return None

  except Exception as e:
    print("Error finding user")
    return None

async def get_user_username(username:str) -> Optional[dict]:
  #see if the user is in the database

  try:
    response = supabase.table("users").select("*").eq("username", username).execute()

    if response.data and len(response.data) > 0:
      return response.data[0]
    return None

  except Exception as e:
    print("Error finding username")
    return None

