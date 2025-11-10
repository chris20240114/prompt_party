from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
import graphql_types as gql

class User(BaseModel):
    userid: str
    username: str
    email: EmailStr
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    ranking: Optional[str] = ''

    def convert_UserType(self) -> gql.UserType:
      return gql.UserType(
          userid=self.userid, 
          username=self.username, 
          email=str(self.email), 
          phone=None, 
          profile_picture=self.profile_picture
      )

class Post(BaseModel):
    postid: str
    content: str
    authorid: str
    date: datetime
    edited: bool
    num_likes: int

    def convert_PostType(self) -> gql.PostType:
      return gql.PostType(
          postid=self.postid,
          content=self.content, 
          authorid=self.authorid,
          date=self.date,
          edited=self.edited,
          num_likes=self.num_likes
      )

#Models for Supabase

class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str
  profile_picture: Optional[str] = None
  bio: Optional[str] = None
  ranking: Optional[str] = ''

class UserResponse(User):
    pass

class PostCreate(BaseModel):
  content: str
  authorid: str

class PostResponse(Post):
    pass
    
