from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class User(BaseModel):
    userid: str
    username: str
    email: EmailStr
    profile_picture: Optional[str] = None
    bio: Optional[str] = None

class Post(BaseModel):
    postid: str
    content: str
    author_id: str
    date: datetime
    edited: bool
    num_likes: int

#Models for Supabase

class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str
  profile_picture: Optional[str] = None
  bio: Optional[str] = None

class UserResponse(User):
    pass

class PostCreate(BaseModel):
  content: str
  author_id: str

class PostResponse(Post):
    pass
    
