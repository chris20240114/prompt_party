from fastapi import FastAPI
from REST_routes import user_router, post_router
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from gql_schema import schema
import uvicorn
from fastapi.staticfiles import StaticFiles


app = FastAPI(
    title="Prompt Party API",
    description="API for PromptParty",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.mount("/src/", StaticFiles(directory="./documentation"), name="graphql_docs")

# Include REST routers
app.include_router(user_router)
app.include_router(post_router)

# GraphQL router
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Prompt Party API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """More detailed health check"""
    return {
        "status": "healthy",
        "message": "API is operational",
        "endpoints": {
            "graphql": "/graphql",
            "users": "/users",
            "posts": "/posts"
        },
        "graphql documentaion": "/graphql_docs/homepage.html",
        "REST API documentation": "/docs"
    }

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

