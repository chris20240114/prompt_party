import os, sys
import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime


# <----------------------> Do not edit below this line <---------------------->

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Minimal env so import-time code doesn't choke
os.environ.setdefault("NEO4J_URI", "bolt://test")
os.environ.setdefault("NEO4J_USERNAME", "neo4j")
os.environ.setdefault("NEO4J_PASSWORD", "pass")

# Patch BEFORE importing module under test
patcher_env = patch("dotenv.load_dotenv", return_value=True)
patcher_ctor = patch("neo4j.GraphDatabase.driver")
patcher_env.start()
mock_ctor = patcher_ctor.start()

# First call is used as context manager to verify_connectivity
ctx = MagicMock()
ctx.__enter__.return_value = MagicMock(verify_connectivity=MagicMock())
ctx.__exit__.return_value = False
module_driver = MagicMock()
mock_ctor.side_effect = [ctx, module_driver]

# <----------------------> Do not edit above this line <---------------------->

from server.database.graph_db.graph import (
    add_user, delete_user, find_user,
    add_post, add_like, add_reply,
    add_follow, find_friends, find_posts
)
from imports import User, Post

def make_summary(**kw):
    d = dict(nodes_created=0, nodes_deleted=0,
             relationships_created=0, properties_set=0,
             result_available_after=1)
    d.update(kw)
    counters = type("Counters", (), d)
    return type("Summary", (), {"counters": counters, "result_available_after": d["result_available_after"]})

class GraphOpsTests(unittest.TestCase):
    def setUp(self):
        module_driver.execute_query.reset_mock()

    def test_add_user(self):
        module_driver.execute_query.return_value = type("Res", (), {"summary": make_summary(nodes_created=1)})
        u = User(userid="u1", username="alice", email="a@x.com", phone="111")
        add_user(u)
        _, kwargs = module_driver.execute_query.call_args
        self.assertEqual(kwargs["email"], "a@x.com")

    def test_add_post(self):
        module_driver.execute_query.return_value = type("Res", (), {"summary": make_summary(nodes_created=1, relationships_created=1)})
        author = User(userid="au1", username="auth", email="auth@x.com", phone="000")
        p = Post(postid="p1", content="hi", author=author, date=datetime(2025, 10, 10, 10, 0, 0), edited=False, num_likes=0)
        add_post(p)
        _, kwargs = module_driver.execute_query.call_args
        self.assertEqual(kwargs["author"], "au1")
        self.assertTrue(kwargs["date"].startswith("2025-10-10T10:00:00"))

    def test_add_like(self):
        module_driver.execute_query.return_value = type("Res", (), {"summary": make_summary(relationships_created=1, properties_set=1)})
        u = User(userid="liker", username="L", email="l@x.com", phone="1")
        a = User(userid="au1", username="auth", email="a@x.com", phone="2")
        p = Post(postid="pX", content="c", author=a, date=datetime.now(), edited=False, num_likes=0)
        add_like(u, p)
        _, kwargs = module_driver.execute_query.call_args
        self.assertEqual(kwargs["userid"], "liker")
        self.assertEqual(kwargs["postid"], "pX")

    def test_add_reply(self):
        module_driver.execute_query.return_value = type("Res", (), {"summary": make_summary(relationships_created=2)})
        a = User(userid="a1", username="A", email="a@x.com", phone="1")
        b = User(userid="b1", username="B", email="b@x.com", phone="2")
        parent = Post(postid="parent", content="P", author=a, date=datetime.now(), edited=False, num_likes=0)
        child  = Post(postid="child",  content="C", author=b, date=datetime.now(), edited=False, num_likes=0)
        add_reply(parent, child)
        _, kwargs = module_driver.execute_query.call_args
        self.assertEqual(kwargs["postid1"], "child")
        self.assertEqual(kwargs["postid2"], "parent")

    def test_add_follow_and_mutuals(self):
        # add_follow result
        module_driver.execute_query.return_value = type("Res", (), {"summary": make_summary(relationships_created=1)})
        u1 = User(userid="u1", username="A", email="a@x.com", phone="1")
        u2 = User(userid="u2", username="B", email="b@x.com", phone="2")
        self.assertEqual(add_follow(u1, u2), 1)

        # find_friends returns two records
        module_driver.execute_query.return_value = ([{"userid": "u2"}, {"userid": "u3"}], make_summary(), ["userid"])
        self.assertEqual(find_friends(u1), ["u2", "u3"])

    def test_find_user_true_false(self):
        module_driver.execute_query.return_value = ([{"u": {"userid": "xx"}}], make_summary(), ["u"])
        self.assertTrue(find_user(User(userid="xx", username="x", email="x@x.com", phone="1")))
        module_driver.execute_query.return_value = ([], make_summary(), [])
        self.assertFalse(find_user(User(userid="none", username="n", email="n@x.com", phone="1")))

    def test_find_posts(self):
        module_driver.execute_query.return_value = ([{"postid": "p3"}, {"postid": "p1"}], make_summary(), ["postid"])
        me = User(userid="me", username="m", email="m@x.com", phone="1")
        self.assertEqual(find_posts(me), ["p3", "p1"])

def tearDownModule():
    patcher_env.stop()
    patcher_ctor.stop()

if __name__ == "__main__":
    unittest.main(verbosity=2)
