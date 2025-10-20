# Create our GraphQL schemas here
# If they become too hectic, we will create standalone files for each subgroup
# Should all contain the basic imports as defined here

import strawberry
from typing import Optional
from datetime import datetime
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.relational_db.supabase_service import create_post, PostCreate, PostResponse

@strawberry.type
class PostType:
    postid: str
    content: str
    author_id: str
    date: datetime
    edited: bool
    num_likes: int

@strawberry.input
class PostInput:
    content: str
    author_id: str

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_post(self, post_data: PostInput) -> Optional[PostType]:
        try:
            post_create = PostCreate(**post_data.__dict__)
            result = await create_post(post_create)

            if not result.get("success"):
                return None

            post = result["post"]
            return PostType(
                postid=post.postid,
                content=post.content,
                author_id=post.author_id,
                date=post.date,
                edited=post.edited,
                num_likes=post.num_likes
            )
        except Exception as e:
            print("Error creating post:", e)
            return None

@strawberry.type
class Query:
    @strawberry.field
    def temp(self) -> str:
        return "Placeholder for future queries"

schema = strawberry.Schema(query=Query, mutation=Mutation)
