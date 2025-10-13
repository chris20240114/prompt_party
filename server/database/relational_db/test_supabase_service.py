import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# <----------------------> Do not edit below this line <---------------------->

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Patch create_client before import to inject a fake supabase client
patcher_client = patch("supabase.create_client")
mock_client_ctor = patcher_client.start()

mock_supabase = MagicMock()
mock_client_ctor.return_value = mock_supabase

# <----------------------> Do not edit above this line <---------------------->

from server.database.relational_db.supabase_service import (
    create_user,
    get_user_email,
    get_user_username,
    UserCreate,
)

# <----------------------> Test definitions <---------------------->

class SupabaseUserTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.user_data = UserCreate(
            username="test_user",
            email="test@example.com",
            password="secret123",
            bio="just testing"
        )


        # Reset all mocks before each test
        mock_supabase.reset_mock()

    async def test_create_user_success(self):
        # Mock Supabase auth.sign_up returning a fake user ID
        mock_supabase.auth.sign_up.return_value = MagicMock(user=MagicMock(id="uuid-1234"))
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{"userid": "uuid-1234"}])

        result = await create_user(self.user_data)

        self.assertTrue(result["success"])
        self.assertEqual(result["user"].userid, "uuid-1234")
        mock_supabase.auth.sign_up.assert_called_once()
        mock_supabase.table.assert_called_with("users")

    async def test_create_user_failure(self):
        # Simulate sign_up returning None
        mock_supabase.auth.sign_up.return_value = None

        result = await create_user(self.user_data)
        self.assertFalse(result["success"])
        self.assertIn("failed", result["error"])

    async def test_get_user_email_found(self):
        fake_response = MagicMock(data=[{"email": "test@example.com", "username": "found"}])
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = fake_response

        result = await get_user_email("test@example.com")

        self.assertIsNotNone(result)
        self.assertEqual(result["email"], "test@example.com")
        mock_supabase.table.assert_called_with("users")

    async def test_get_user_email_not_found(self):
        fake_response = MagicMock(data=[])
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = fake_response

        result = await get_user_email("missing@example.com")
        self.assertIsNone(result)

    async def test_get_user_username_found(self):
        fake_response = MagicMock(data=[{"username": "user1"}])
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = fake_response

        result = await get_user_username("user1")
        self.assertEqual(result["username"], "user1")

    async def test_get_user_username_not_found(self):
        fake_response = MagicMock(data=[])
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = fake_response

        result = await get_user_username("nope")
        self.assertIsNone(result)



def tearDownModule():
    patcher_client.stop()


if __name__ == "__main__":
    unittest.main(verbosity=2)
