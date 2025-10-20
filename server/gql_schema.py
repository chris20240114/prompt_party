import strawberry
from strawberry.exceptions import GraphQLError

from typing import List, Optional

from database.relational_db.supabase_service import supabase, create_post
from database.graph_db.graph import add_post

from graphql_types import UserType, PostType, PostInput, convert_Post_to_PostType, convert_User_to_UserType
from classes import User, Post, PostResponse, PostCreate

# ---- Query Resolvers ----
@strawberry.type
class Query:
    @strawberry.field
    def all_posts(self) -> List[PostType]:
        """ Return all posts """
        response = supabase.table("posts").select("*").execute()
        posts = []
        for p in response.data:
            posts.append(
                PostType(
                    postid=p["postid"],
                    content=p["content"],
                    authorid=p["author_id"],
                    date=p["date"],
                    edited=p["edited"],
                    num_likes=p["num_likes"],
                )
            )
        return posts

    @strawberry.field
    def user_posts(self, userid: str) -> List[PostType]:
        #TODO for Sarah: please place all Supabase logic in supabase_service.py file
        """Return all posts from a specific user."""
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
                        authorid=p["author_id"],
                        date=p["date"],
                        edited=p["edited"],
                        num_likes=p["num_likes"],
                    )
                )
        return posts

    @strawberry.field
    def post_by_id(self, postid: str) -> Optional[PostType]:
        #TODO for Sarah: please place all Supabase logic in supabase_service.py file
        """" Return a post by its post_id """
        res = supabase.table("posts").select("*").eq("postid", postid).execute()
        
        if not res.data:
            raise GraphQLError(
                f"!! Post {postid} does not exist !!"
            )
        
        p = res.data[0]

        return PostType(
            postid=p["postid"],
            content=p["content"],
            authorid=p["author_id"],
            date=p["date"],
            edited=p["edited"],
            num_likes=p["num_likes"],
        )

# ---- Mutation Resolvers ----
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_post(self, post_data: PostInput) -> Optional[PostType]:
        try:
            post_create = PostCreate(**post_data.__dict__)
            result = await create_post(post_create)

            if not result.get("success"):
                raise GraphQLError("Error in creating post")

            post = result["post"]
            
            await add_post(post)
            
            return convert_Post_to_PostType(post)

        except Exception as e:
            print("Error creating post:", e)
            return None

schema = strawberry.Schema(query=Query, mutation=Mutation)