from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.routers.habits import router as habits_router
from backend.routers.checkins import router as checkins_router
from backend.routers.stats import router as stats_router

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="TobyHabit",
    description="习惯森林 - 用游戏化方式养成好习惯",
    version="0.1.0",
    lifespan=lifespan,
)

# API routes
app.include_router(habits_router)
app.include_router(checkins_router)
app.include_router(stats_router)

# Serve frontend static files (if built)
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {"message": "TobyHabit API is running. Frontend not built yet.", "docs": "/docs"}
