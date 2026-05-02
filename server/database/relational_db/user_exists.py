import os
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

assert SUPABASE_URL is not None, "SUPABASE_URL missing"
assert SUPABASE_KEY is not None, "SUPABASE_KEY missing"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

"""
def user_exists(uid: Optional[str], email: Optional[str], phone: Optional[str]) -> bool:
    # Checks if a user exists within the Prompt Party users table.
    
    # Args:
    # uid (str): the user id
    # email (str): the user's email
    # phone (str): the user's phone number
    
    if not ([uid, email, phone]):
        raise ValueError("Please provide UID, Email, or Phone Number")
    
    query = supabase.table("users").select("uid").limit(1)

    if uid:
        query = query.eq("uid", uid)
    if email:
        query = query.eq("email", email)
    if phone:
        query = query.eq("phone", phone)
    
    result = query.execute()
    return len(result.data) > 0
"""


def user_exists(uid: Optional[str], email: Optional[str]) -> bool:
    """Checks if a user exists within the Prompt Party users table.
    
    Args:
    uid (str): the user id
    email (str): the user's email
    phone (str): the user's phone number
    """
    if not ([uid, email]):
        raise ValueError("Please provide your User ID or Email")
    
    query = supabase.table("users").select("userid").limit(1)

    if uid:
        query = query.eq("userid", uid)
    if email:
        query = query.eq("email", email)
    
    result = query.execute()
    return len(result.data) > 0

print(user_exists("955d0fe2-4a8e-4864-81c0-fb7c29ad7fc5", "jayden1@gmail.com")) # true
print(user_exists("00000000-0000-0000-0000-000000000000", "jayden1@gmail.com")) # false
print(user_exists("955d0fe2-4a8e-4864-81c0-fb7c29ad7fc5", "none")) # false
print(user_exists("00000000-0000-0000-0000-000000000000", "none")) # false