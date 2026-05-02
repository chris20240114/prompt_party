import asyncio
import sys
import os

# Add relational_db folder to path for supabase_service.py
rel_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "database", "relational_db"))
sys.path.append(rel_db_dir)

from gql_schema import schema

# already created 5 new users, each with 3 posts

# --- Hardcoded 5 existing users ---
EXISTING_USERS = [
    {"userid": "8f04dd25-25db-41eb-8341-ebc99e9f834a"},
    {"userid": "a11db797-00dc-421b-97d3-93ad5be52ede"},
    {"userid": "5ef90988-cac5-423a-9b94-81d2d11cdf7f"},
    {"userid": "2fd0d7e2-3b08-4d46-97bc-05bddfc65e07"},
    {"userid": "bd5eaf0c-4cc8-429e-b924-6f0dec662c5a"},
]

async def test_graphql_queries():
    print("--- Running GraphQL Tests ---")

    # --- all_posts ---
    query_all = """
    {
        allPosts {
            postid
        }
    }
    """
    result_all = await schema.execute(query_all)
    if result_all.data and "allPosts" in result_all.data:
        print(f"[all_posts] Success: {len(result_all.data['allPosts'])} posts found")
    else:
        print("[all_posts] Failed")

    # --- user_posts and post_by_id for each user ---
    for user in EXISTING_USERS:
        userid = user["userid"]

        # user_posts
        query_user = f"""
        {{
            userPosts(userid: "{userid}") {{
                postid
            }}
        }}
        """
        result_user = await schema.execute(query_user)
        posts = result_user.data["userPosts"] if result_user.data and "userPosts" in result_user.data else []
        success = bool(posts)
        print(f"[user_posts] User {userid}: {'Success' if success else 'Failed'} ({len(posts)} posts)")

        # post_by_id: test first post if exists
        if posts:
            first_post_id = posts[0]["postid"]
            query_post_by_id = f"""
            {{
                postById(postid: "{first_post_id}") {{
                    postid
                }}
            }}
            """
            result_post = await schema.execute(query_post_by_id)
            post_success = bool(result_post.data and "postById" in result_post.data and result_post.data["postById"])
            print(f"[post_by_id] Post {first_post_id}: {'Success' if post_success else 'Failed'}")
        
    #Tests adding a post for the first user
    test_user = EXISTING_USERS[0]["userid"]
    mutation_add_post = f"""
    mutation {{
        addPost(content: "Test", authorId: "{test_user}") {{
            postid
            content
            author_id
        }}
    }}
    """
    result_mutation = await schema.execute(mutation_add_post)
    if result_mutation.data and "addPost" in result_mutation.data:
        print(f"[add_post] Success: Created post {result_mutation.data['addPost']['postid']}")
    else:
        print("[add_post] Failed to create post")


async def main():
    await test_graphql_queries()

if __name__ == "__main__":
    asyncio.run(main())
