from neo4j import GraphDatabase
#from torch import K

from .imports import User, Post
from typing import List

import dotenv
import os

load_status = dotenv.load_dotenv()
if load_status is False:
    raise RuntimeError('Environment variables not loaded.')

URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

try: 
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        driver.verify_connectivity()
    print("[AuraDB] Succesfully Connected to Neo4J Instance")
except Exception as e:
    print("[AuraDB] Neo4J instance is not connected")

driver = GraphDatabase.driver(URI, auth=AUTH)

def add_user(user: User) -> None:
    """ Adds users to the graph database.

    Args:
    user (User): user to be added """

    summary= driver.execute_query(
        """ CREATE (n:User {userid: $userid, username: $username, email: $email})""",
        userid=user.userid,
        username=user.username,
        email=user.email,
        database_="neo4j",
    ).summary

    print("[AuraDB] Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

def delete_user(user: User) -> None:
    """ Removes users from the graph database.

    Args:
    user (User): user to be removed """

    summary = driver.execute_query(
        """ MATCH (u: User)
        WHERE u.userid = $userid
        DELETE u""",
        userid=user.userid,
        database_="neo4j",
    ).summary

    print("[AuraDB] Deleted 1 node in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

def find_user(user: User) -> bool:
    """ Finds a user in the graph database"""

    records, summary, keys = driver.execute_query(
        """ MATCH (u: User {userid: $userid})
        RETURN u
        """,
        userid = user.userid,
        database_="neo4j"
    )

    return len(records) > 0

def update_user(userid: str, field_to_update: str, update: str) -> None:
    """Updates a single property on a User node identified by userid."""
    summary = driver.execute_query(
        """
            MATCH (u:User {userid: $userid})
            SET u[$field_to_update] = $update
        """,
        userid=userid,
        field_to_update=field_to_update,
        update=update,
        database_="neo4j",
    ).summary

    print(
        "[AuraDB] Updated user {userid}: properties_set={props} in {time} ms.".format(
            userid=userid,
            props=summary.counters.properties_set,
            time=summary.result_available_after,
        )
    )

def add_post(post: Post) -> None:
    """ Adds posts to the graph database.

    Args:
    Post (Post): post to be added """

    summary= driver.execute_query(
        """MATCH (u:User {userid: $author})
            CREATE (p: Post {postid: $postid, content: $content, author: $author, date: $date, edited: $edited, like_count: 0})
            CREATE (u)-[:POSTED]->(p)
        """,
        postid=post.postid,
        content=post.content,
        author=post.authorid,
        date=post.date.isoformat(),
        edited=post.edited,
        database_="neo4j",
    ).summary

    print("[AuraDB] Added post {postid} nodes in {time} ms.".format(
        postid = post.postid,
        time=summary.result_available_after
    ))

def delete_post(post: Post) -> None:
    """ Deletes post from the graphs database.

    Args:
    post (Post): post to be deleted """

    summary= driver.execute_query(
        """ MATCH (p: Post)
        WHERE p.postid = $post
        DELETE p""",
        postid=post.postid,
        database_="neo4j",
    ).summary

    print("[AuraDB] Deleted 1 node in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))
    print(f"[AuraDB] Deleted Post {post.postid}")

def update_post_field(postid: str, field_to_update: str, update: str) -> None:
    #TODO
    return

def update_post(post: Post) -> None:
    #TODO wholesale version
    return


def add_like(user: User, post: Post) -> None:
    """ Updates like relationship in graph database.

    Args:

    user (User): the user who liked the post
    post (Post): the post that was liked
    """
    summary= driver.execute_query(
        """ MATCH (p:Post {postid: $postid})
            MATCH (u:User {userid: $userid})
            CREATE (u)-[:LIKED]->(p)
            SET p.like_count = p.like_count + 1
        """,
        postid = post.postid,
        userid = user.userid,
        database_="neo4j",
    ).summary

    print("[AuraDB] Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

def add_reply(parent_post: Post, reply: Post):
    """ Adds reply relationships to the graph database"""
    summary= driver.execute_query(
        """ MATCH (p1:Post {postid: $postid1})
            MATCH (p2:Post {postid: $postid2})
            SET p1.isReply = true
            CREATE (p1)-[:REPLIES]->(p2)
            CREATE (p2)-[:HASREPLY]->(p1)
        """,
        postid1= reply.postid,
        postid2 = parent_post.postid,
        database_="neo4j",
    ).summary

    print("[AuraDB] Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))


def add_follow(user1: User, user2: User):
    """ Makes User 1 follow User 2"""
    summary = driver.execute_query(
        """
            MATCH (a:User {userid: $u1}), (b:User {userid: $u2})
            WHERE a <> b
            MERGE (a)-[r:FOLLOWS]->(b)
            ON CREATE SET r.since = datetime()
            RETURN r
        """,
        u1=user1.userid,
        u2=user2.userid,
        database_="neo4j",
    ).summary

    print(f"[AuraDB] add_follow: relationships_created={summary.counters.relationships_created}")
    return summary.counters.relationships_created

def find_friends(user: User) -> List[str]:
    """ Returns a list of the userids of the friends of user"""
    records, _, _ = driver.execute_query(
        """
            MATCH (me:User {userid: $me})
            MATCH (me)-[:FOLLOWS]->(u:User)-[:FOLLOWS]->(me)
            RETURN u.userid AS userid
            ORDER BY userid
        """,
        me=user.userid,
        database_="neo4j",
    )
    print(f"[AuraDB] Found {len(records)} friends")
    return [r["userid"] for r in records]

def find_posts(user: User) -> List[str]:
    """ Returns a list of the postids of the user's' posts"""
    records, _, _ = driver.execute_query(
        """
            MATCH (u:User {userid: $userid})-[:POSTED]->(p:Post)
            WHERE p.isReply = false AND EXISTS(p.postid)
            RETURN p.postid AS postid
            ORDER BY p.date DESC
        """,
        userid=user.userid,
        database_="neo4j",
    )
    print(f"[AuraDB] Found {len(records)} posts")
    return [r["postid"] for r in records if r.get("postid") is not None]

def find_replies(post: Post) -> List[str]:
    """ Returns a list of the postids of the post's replies"""
    # Use a pattern that explicitly requires postid to exist
    records, _, _ = driver.execute_query(
        """
            MATCH (p1:Post {postid: $postid})-[:HASREPLY]->(p2:Post)
            WHERE p2.postid IS NOT NULL
            RETURN p2.postid AS postid
            ORDER BY COALESCE(p2.date, datetime()) DESC
        """,
        postid=post.postid,
        database_="neo4j",
    )
    print(f"[AuraDB] Found {len(records)} replies")
    return [r["postid"] for r in records if r.get("postid") is not None]


#Implement graphql service that retrieves past prompts.

def past_prompts(user: User) -> List[str]:
    """ Returns a list of past prompts used by the user"""
    records, _, _ = driver.execute_query(
        """
            MATCH (u:User {userid: $userid})-[:USED_PROMPT]->(pr:Prompt)
            RETURN pr.promptid AS promptid
            ORDER BY pr.date DESC
        """,
        userid=user.userid,
        database_="neo4j",
    )
    print(f"[AuraDB] Found {len(records)} past prompts")
    return [r["promptid"] for r in records]


#Implement grapqhl service that retrieves replies from the prompts.

def replies_from_prompt(promptid: str) -> List[str]:
    """ Returns a list of the postids of replies generated from a prompt"""
    records, _, _ = driver.execute_query(
        """
            MATCH (pr:Prompt {promptid: $promptid})-[:GENERATED_REPLY]->(p:Post)
            WHERE EXISTS(p.postid)
            RETURN p.postid AS postid
            ORDER BY p.date DESC
        """,
        promptid=promptid,
        database_="neo4j",
    )
    print(f"[AuraDB] Found {len(records)} replies from prompt")
    return [r["postid"] for r in records if r.get("postid") is not None]

def main():
    u2 = User("1", "user1", "email1@email.com", "124")
    delete_user(u2)

if __name__ == "__main__":
    import io
    io.run(main())




'''
<------ Cypher Cheat Sheet ------>

Cypher Command	                    Description
------------------------------------------------------------------------
CREATE (n:Label {prop: value})	  |  Make a new node
MATCH (n:Label)	                  |  Find existing nodes
WHERE n.prop = value	          |  Filter results
DELETE n	                      |  Delete nodes
DETACH DELETE n	                  |  Delete node + relationships
MERGE (n:Label {prop: value})	  |  “Create if not exists”
(a)-[:REL]->(b)	                  |  Relationship from a → b
(a)<-[:REL]-(b)	                  |  Relationship from b → a
RETURN n.prop	                  |  Return properties
SET n.prop = new_value	          |  Update
REMOVE n.prop	                  |  Remove a property
ON CREATE SET	                  |  Only set property when created
ON MATCH SET	                  |  Only set property when matched

'''
