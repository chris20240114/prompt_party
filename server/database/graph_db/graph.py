from neo4j import GraphDatabase

from imports import User, Post

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
        """ CREATE (User {userid: $userid, username: $username, email: $email})""", 
        userid=user.userid, 
        username=user.username, 
        email=user.email.email,
        database_="neo4j",
    ).summary

    print("Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
        time=summary.result_available_after
    ))

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

    print("Created {nodes_created} nodes in {time} ms.".format(
        nodes_created=summary.counters.nodes_created,
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