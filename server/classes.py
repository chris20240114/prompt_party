import re
from typing import Optional, List
from datetime import datetime


class Email:
    def __init__(self, email: str):
        try:
            self.validate_email(email = email)
            self.email = email
        except AssertionError:
            raise ValueError("Not a valid email!")
    
    def validate_email(self, email: str):
        """ Validates an email address"""
        assert re.search(r"@", email)

class User:
    def __init__(self, userid, username, email, phone, profile_picture = None):
        self.userid: str = userid
        self.username: str = username
        self.email: Email = email
        self.phone: str = phone
        self.profile_picture: Optional[str] = profile_picture

class Post:
    def __init__(self, postid: str, content: str, author: User, date: datetime, edited: bool = False):
        self.postid: str = postid
        self.content: str = str
        self.author = User
        self.date: datetime = date
        self.edited: bool = edited

    
