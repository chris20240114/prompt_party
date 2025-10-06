from fastapi import FastAPI
from user_routes import router as user_router

app = FastAPI(title="Prompt Party API")

app.include_router(user_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
