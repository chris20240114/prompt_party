import strawberry

from typing import Optional, Dict
from datetime import datetime

@strawberry.type
class RankingType:
    film_art_music: int
    current_events: int
    sports: int
    comedy: int
    technology: int

@strawberry.input
class RankingInput:
    film_art_music: int
    current_events: int
    sports: int
    comedy: int
    technology: int

@strawberry.type
class UserType:
    userid: str
    username: str
    email: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    ranking: Optional[RankingType] = None

@strawberry.input
class UserInput:
  username: str
  email: str
  password: str
  profile_picture: Optional[str] = None
  bio: Optional[str] = None
  ranking: Optional[RankingInput] = None

@strawberry.type
class PostType:
    postid: str
    content: str
    authorid: str
    date: datetime
    edited: bool
    num_likes: int
    promptid: Optional[str] = None

@strawberry.input
class PostInput:
    content: str
    authorid: str
    promptid: Optional[str] = None