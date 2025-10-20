import strawberry
import typing
import os

import strawberry
from datetime import datetime
from typing import List, Optional
from supabase_service import supabase

# --- Optional Neo4j ---
# currently, all data is being retrieved from Supabase; does not use graph.py
USE_NEO4J = os.getenv("USE_NEO4J", "false").lower() == "true"
if USE_NEO4J:
    from graph import find_posts
    from classes import User

# ---- GraphQL Types ----
@strawberry.type
class UserType:
    userid: str
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None

@strawberry.type
class PostType:
    postid: str
    content: str
    author: UserType
    date: datetime
    edited: bool
    num_likes: int

# ---- Query Resolvers ----
@strawberry.type
class Query:
    @strawberry.field
    def all_posts(self) -> List[PostType]:
        response = supabase.table("posts").select("*").execute()
        posts = []
        for p in response.data:
            posts.append(
                PostType(
                    postid=p["postid"],
                    content=p["content"],
                    author=UserType(userid=p["author_id"]),
                    date=p["date"],
                    edited=p["edited"],
                    num_likes=p["num_likes"],
                )
            )
        return posts

    @strawberry.field
    def user_posts(self, userid: str) -> List[PostType]:
        """Return all posts from a specific user."""
        if USE_NEO4J:
            user = User(userid, username="", email="", phone="")
            post_ids = find_posts(user)
        else:
            response = supabase.table("posts").select("postid").eq("author_id", userid).execute()
            post_ids = [p["postid"] for p in response.data]

        posts = []
        for pid in post_ids:
            res = supabase.table("posts").select("*").eq("postid", pid).execute()
            if res.data:
                p = res.data[0]
                posts.append(
                    PostType(
                        postid=p["postid"],
                        content=p["content"],
                        author=UserType(userid=p["author_id"]),
                        date=p["date"],
                        edited=p["edited"],
                        num_likes=p["num_likes"],
                    )
                )
        return posts

    @strawberry.field
    def post_by_id(self, postid: str) -> Optional[PostType]:
        res = supabase.table("posts").select("*").eq("postid", postid).execute()
        if not res.data:
            return None
        p = res.data[0]
        return PostType(
            postid=p["postid"],
            content=p["content"],
            author=UserType(userid=p["author_id"]),
            date=p["date"],
            edited=p["edited"],
            num_likes=p["num_likes"],
        )

schema = strawberry.Schema(query=Query)
