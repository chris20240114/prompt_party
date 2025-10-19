from fastapi import APIRouter, HTTPException
from server.database.relational_db.supabase_service import create_post, PostCreate

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.post("/create", response_model=dict)
async def add_post(post: PostCreate):

    result = await create_post(post)
    if result.get("success"):
        return result
    else:
        raise HTTPException(status_code=400, detail=result.get("error"))