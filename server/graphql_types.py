import strawberry

from typing import Optional
from datetime import datetime

@strawberry.type
class UserType:
    userid: str
    username: str
    email: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None

@strawberry.input
class UserInput:
  username: str
  email: str
  password: str
  profile_picture: Optional[str] = None
  bio: Optional[str] = None

@strawberry.type
class PostType:
    postid: str
    content: str
    authorid: str
    date: datetime
    edited: bool
    num_likes: int

@strawberry.input
class PostInput:
    content: str
    authorid: str