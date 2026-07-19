from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.habit import Habit, CheckIn
from backend.schemas.checkin import (
    StatsResponse,
    JournalEntry,
    JournalResponse,
)
from backend.services.tree_logic import calculate_tree

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/health")
async def health():
    return {"status": "ok", "app": "TobyHabit"}


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Total habits
    result = await db.execute(select(func.count(Habit.id)))
    total_habits = result.fetchone()[0]

    # Active habits
    result = await db.execute(
        select(func.count(Habit.id)).where(Habit.is_archived == False)
    )
    active_habits = result.fetchone()[0]

    # Total checkins
    result = await db.execute(select(func.count(CheckIn.id)))
    total_checkins = result.fetchone()[0]

    # Total unique days tracked
    result = await db.execute(
        select(func.count(func.distinct(CheckIn.date)))
    )
    total_days_tracked = result.fetchone()[0] or 0

    # Best streak across all habits
    best_streak = 0
    best_streak_name = None

    result = await db.execute(
        select(Habit).where(Habit.is_archived == False)
    )
    habits = result.scalars().all()

    forest_health_sum = 0
    for habit in habits:
        r = await db.execute(
            select(CheckIn.date, CheckIn.is_mini)
            .where(CheckIn.habit_id == habit.id)
            .order_by(CheckIn.date.desc())
        )
        rows = r.all()
        checkin_dates = [row[0] for row in rows]
        checkin_is_mini = [row[1] for row in rows]
        tree = calculate_tree(checkin_dates, checkin_is_mini)

        if tree.longest_streak > best_streak:
            best_streak = tree.longest_streak
            best_streak_name = habit.name

        # Health score: excellent=100, good=75, okay=50, wilted=25
        health_map = {"excellent": 100, "good": 75, "okay": 50, "wilting": 25, "wilted": 0}
        forest_health_sum += health_map.get(tree.health, 0)

    forest_health_pct = forest_health_sum // max(active_habits, 1)

    return StatsResponse(
        total_habits=total_habits,
        active_habits=active_habits,
        total_checkins=total_checkins,
        total_days_tracked=total_days_tracked,
        best_streak=best_streak,
        best_streak_habit_name=best_streak_name,
        forest_health_pct=forest_health_pct,
    )


@router.get("/journal", response_model=JournalResponse)
async def get_journal(
    habit_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Get checkin notes as a timeline."""
    query = (
        select(CheckIn, Habit.name, Habit.emoji)
        .join(Habit, CheckIn.habit_id == Habit.id)
        .where(CheckIn.note.isnot(None), CheckIn.note != "")
        .order_by(CheckIn.date.desc(), CheckIn.created_at.desc())
    )

    if habit_id:
        query = query.where(CheckIn.habit_id == habit_id)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.fetchone()[0]

    # Paginate
    result = await db.execute(query.offset(offset).limit(limit))
    rows = result.all()

    entries = [
        JournalEntry(
            id=row[0].id,
            habit_id=row[0].habit_id,
            habit_name=row[1],
            habit_emoji=row[2],
            date=row[0].date,
            note=row[0].note or "",
            mood=row[0].mood,
            is_mini=row[0].is_mini,
        )
        for row in rows
    ]

    return JournalResponse(entries=entries, total=total)
