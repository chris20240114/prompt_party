import os
import uuid
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

assert SUPABASE_URL is not None, "SUPABASE_URL missing"
assert SUPABASE_KEY is not None, "SUPABASE_KEY missing"

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

#create new post
class PostCreate(BaseModel):
  content: str
  author_id: str

#return a post
class PostResponse(BaseModel):
  postid: str
  content: str 
  author_id: str
  date: datetime
  edited: bool
  num_likes: int

async def create_user(user_data: UserCreate) -> dict:
  #create a new user and also puts them into the supabase table
  try:
    response = supabase.auth.sign_up({
    "email": user_data.email,
    "password": user_data.password,
    })

    if not response.user:
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

async def create_post(post_data: PostCreate) -> dict:
    #creates a new post and puts them in the supabase posts table
    try:
        post_id = str(uuid.uuid4())
        record = {
            "postid": post_id,
            "content": post_data.content,
            "author_id": post_data.author_id,
            "date": datetime.utcnow(),
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
                author_id=post_data.author_id,
                date=record["date"],
                edited=False,
                num_likes=0
            )
        }
    except Exception as e:
        return {"success": False, "error": str(e)}