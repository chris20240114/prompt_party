import re
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class User(BaseModel):
    userid: str
    username: str
    email: EmailStr
    phone: str
    profile_picture: Optional[str] = None

class Post(BaseModel):
    postid: str
    content: str
    author : User
    date: datetime
    edited: bool
    num_likes: int

    
