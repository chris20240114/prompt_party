from neo4j import GraphDatabase
from torch import K

from .imports import User, Post
from typing import List

import dotenv
import os

load_status = dotenv.load_dotenv()
if load_status is False:
    raise RuntimeError('Environment variables not loaded.')

URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

with GraphDatabase.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity()

driver = GraphDatabase.driver(URI, auth=AUTH)

def add_user(user: User) -> None:
    """ Adds users to the graph database.

    Args:
    user (User): user to be added """

    _, summary, _ = driver.execute_query(
        """ CREATE (n:User {userid: $userid, username: $username, email: $email})""",
        userid=user.userid,
        username=user.username,
        email=user.email,
        database_="neo4j",
    )

    print("[AuraDB] Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

def delete_user(user: User) -> None:
    """ Removes users from the graph database.

    Args:
    user (User): user to be removed """

    _, summary, _ = driver.execute_query(
        """ MATCH (u: User)
        WHERE u.userid = $userid
        DELETE u""",
        userid=user.userid,
        database_="neo4j",
    )

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
        userid = user.userid
    )

    return len(records) > 0

def update_user(userid: str, field_to_update: str, update: str) -> None:
    #TODO
    return

def add_post(post: Post) -> None:
    """ Adds posts to the graph database.

    Args:
    Post (Post): post to be added """

    _, summary, _ = driver.execute_query(
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
    )

    print("[AuraDB]Added post {postid} nodes in {time} ms.".format(
        postid = post.postid,
        time=summary.result_available_after
    ))

def delete_post(post: Post) -> None:
    """ Deletes post from the graphs database.

    Args:
    post (Post): post to be deleted """

    _, summary, _ = driver.execute_query(
        """ MATCH (p: Post)
        WHERE p.postid = $post
        DELETE p""",
        postid=post.postid,
        database_="neo4j",
    )

    print("[AuraDB] Deleted 1 node in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

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
    _, summary, _ = driver.execute_query(
        """ MATCH (p:Post {postid: $postid})
            MATCH (u:User {userid: $userid})
            CREATE (u)-[:LIKED]->(p)
            SET p.like_count = p.like_count + 1
        """,
        postid = post.postid,
        userid = user.userid,
        database_="neo4j",
    )

    print("[AuraDB] Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

def add_reply(parent_post: Post, reply: Post):
    """ Adds reply relationships to the graph database"""
    _, summary, _ = driver.execute_query(
        """ MATCH (p1:Post {postid: $postid1})
            MATCH (p2:Post {postid: $postid2})
            SET p1.isReply = true
            CREATE (p1)-[:REPLIES]->(p2)
            CREATE (p2)-[:HASREPLY]->(p1)
        """,
        postid1= reply.postid,
        postid2 = parent_post.postid,
        database_="neo4j",
    )


def add_follow(user1: User, user2: User):
    """ Makes User 1 follow User 2"""
    _, summary, _ = driver.execute_query(
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
    )

    # Cypher query explanation
    """
            #// Find both user nodes in the graph by their 'userid' properties
            MATCH (a:User {userid: $u1}), (b:User {userid: $u2})

            // 'WHERE a <> b' prevents a user from following themselves
            WHERE a <> b

            // 'MERGE' creates the relationship if it doesn't exist yet.
            // If it already exists, it does nothing (no duplicates).
            MERGE (a)-[r:FOLLOWS]->(b)

            // 'ON CREATE SET' runs only if a new relationship was created.
            // Here we store a timestamp showing when the follow started.
            ON CREATE SET r.since = datetime()

            // Return the relationship (optional — mainly for debugging)
            RETURN r
    """

    print(f"add_follow: relationships_created={summary.counters.relationships_created}")
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
    return [r["userid"] for r in records]

def find_posts(user: User) -> List[str]:
    """ Returns a list of the postids of the user's' posts"""
    records, _, _ = driver.execute_query(
        """
            MATCH (u:User {userid: $userid})-[:POSTED]->(p:Post)
            WHERE p.isReply = false
            RETURN p.postid AS postid
            ORDER BY p.date DESC
        """,
        userid=user.userid,
        database_="neo4j",
    )
    return [r["postid"] for r in records]

def find_replies(post: Post) -> List[str]:
    """ Returns a list of the postids of the post's replies"""
    records, _, _ = driver.execute_query(
        """
            MATCH (p1:Post {postid: $postid})-[:HASREPLY]->(p2:Post)
            RETURN p2.postid AS postid
            ORDER BY p2.date DESC
        """,
        postid=post.postid,
        database_="neo4j",
    )
    return [r["postid"] for r in records]



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
