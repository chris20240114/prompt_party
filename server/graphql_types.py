import strawberry

from typing import Optional
from pydantic import EmailStr
from datetime import datetime

from classes import User, Post

@strawberry.type
class UserType:
    userid: str
    username: str
    email: EmailStr
    phone: Optional[str] = None
    profile_picture: Optional[str] = None

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
    author_id: str


#Converters

def convert_User_to_UserType(user: User) -> UserType:
    return UserType(user.userid, user.username, user.email, user.phone, user.profile_picture)

def convert_Post_to_PostType(post: Post) -> PostType:
    return PostType(
        postid=post.postid,
        content=post.content, 
        author_id=post.author_id,
        date=post.date,
        edited=post.edited,
        num_likes=post.num_likes
    )