#use this to test creating and seeing if users exist
import requests
import json
from datetime import datetime

ENDPOINT = "http://localhost:8000/graphql"

def query(gql, variables=None):
    response = requests.post(ENDPOINT, json={"query": gql, "variables": variables})
    return response.json()

# See if you can register the user
timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
result = query("""
    mutation($input: UserRegistrationInput!) {
        registerUser(userInput: $input) {
            success
            message
            user { userid username email }
            error
        }
    }
""", {
    "input": {
        "username": f"user_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "TestPass123!"
    }
})

print(json.dumps(result, indent=2))
