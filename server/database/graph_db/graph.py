from neo4j import GraphDatabase

from imports import User, Post, Email
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

    summary = driver.execute_query( 
        """ CREATE (n:User {userid: $userid, username: $username, email: $email, phone: $phone})""", 
        userid=user.userid, 
        username=user.username, 
        email=user.email.email,
        phone=user.phone,
        database_="neo4j",
    ).summary

    print("Created {nodes_created} nodes in {time} ms.".format(
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

    print("Deleted 1 node in {time} ms.".format(
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

def add_post(post: Post) -> None:
    """ Adds posts to the graph database.
    
    Args: 
    Post (Post): post to be added """

    summary = driver.execute_query( 
        """ CREATE (p: Post {postid: $postid, content: $content, author: $author, date: $date, edited: $edited, like_count: 0})
            MATCH (u:User)
            WHERE u.userid = p.author
            CREATE (u)-[:POSTED]->(p)
        """, 
        postid=post.postid,
        content=post.content, 
        author=post.author.userid, 
        date=post.date.str,
        edited=post.edited,
        database_="neo4j",
    ).summary

    print("Added post {postid} nodes in {time} ms.".format(
        userid = post.postid,
        time=summary.result_available_after
    ))

def add_like(user: User, post: Post) -> None:
    """ Updates like relationship in graph database. 
    
    Args: 

    user (User): the user who liked the post
    post (Post): the post that was liked
    """
    summary = driver.execute_query( 
        """ MATCH (p:Post)
            WHERE p.postid = $postid
            MATCH (u:User)
            WHERE u.userid = $userid
            CREATE (u)-[:LIKED]->(p)
            SET p.like_count = p.like_count + 1
        """, 
        postid = post.postid,
        userid = user.userid,
        database_="neo4j",
    ).summary

    print("Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

def add_reply(parent_post: Post, reply: Post):
    """ Adds reply relationships to the graph database"""
    summary = driver.execute_query( 
        """ MATCH (p1:Post)
            WHERE p1.postid = $postid1
            MATCH (p2:Post)
            WHERE p2.postid = $postid2
            CREATE (p1)-[:REPLIES]->(p2)
            CREATE (p2)-[:HASREPLY]->(p1)
        """, 
        postid1= reply.postid,
        postid2 = parent_post.postid,
        database_="neo4j",
    ).summary

# TO DO for Chris

def add_follow(user1: User, user2: User):
    """ Makes User 1 follow User 2"""
    return

def find_friends(user: User) -> List[str]:
    """ Returns a list of the userids of the friends of user"""
    return

def find_posts(user: User) -> List[str]:
    """ Returns a list of the postids of the user's' posts"""
    return



def main():
    u2 = User("1", "user1", "email1@email.com", "124")
    delete_user(u2)

if __name__ == "__main__":
    main()