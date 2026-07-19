from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.habit import Habit, CheckIn
from backend.schemas.habit import CheckInCreate, CheckInResponse, CheckInResult
from backend.schemas.checkin import HabitCalendarDay, HabitCalendarResponse
from dataclasses import asdict

from backend.services.tree_logic import (
    calculate_tree,
    get_reached_milestones,
)

def _tree_to_dict(tree):
    """Convert service TreeInfo dataclass to dict for Pydantic schema."""
    return asdict(tree)

router = APIRouter(prefix="/api/habits", tags=["checkins"])


@router.post("/{habit_id}/checkin", response_model=CheckInResult)
async def check_in(
    habit_id: int,
    data: CheckInCreate,
    db: AsyncSession = Depends(get_db),
):
    # Verify habit exists
    result = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")

    if habit.is_archived:
        raise HTTPException(status_code=400, detail="已归档的习惯不能打卡")

    today = date.today()

    # Check if already checked in today
    existing = await db.execute(
        select(CheckIn).where(
            CheckIn.habit_id == habit_id,
            CheckIn.date == today,
        )
    )
    existing_checkin = existing.scalar_one_or_none()

    # Get old total days for milestone detection
    old_result = await db.execute(
        select(func.count(CheckIn.id)).where(CheckIn.habit_id == habit_id)
    )
    old_count_row = old_result.fetchone()
    old_total_days = old_count_row[0] if old_count_row else 0

    if existing_checkin:
        # Update existing checkin (e.g., upgrade from mini to full)
        if existing_checkin.is_mini and not data.is_mini:
            existing_checkin.is_mini = False
            if data.note is not None:
                existing_checkin.note = data.note
            if data.mood is not None:
                existing_checkin.mood = data.mood
            await db.commit()
            await db.refresh(existing_checkin)
            checkin = existing_checkin
        else:
            # Already checked in with same or higher level
            checkin = existing_checkin
    else:
        checkin = CheckIn(
            habit_id=habit_id,
            date=today,
            is_mini=data.is_mini,
            note=data.note,
            mood=data.mood,
        )
        db.add(checkin)
        await db.commit()
        await db.refresh(checkin)

    # Calculate new stats
    all_result = await db.execute(
        select(CheckIn).where(CheckIn.habit_id == habit_id).order_by(CheckIn.date.desc())
    )
    all_checkins = all_result.scalars().all()
    checkin_dates = [c.date for c in all_checkins]
    checkin_is_mini = [c.is_mini for c in all_checkins]
    new_total_days = len(set(checkin_dates))

    tree = calculate_tree(checkin_dates, checkin_is_mini)
    milestones = get_reached_milestones(old_total_days, new_total_days)

    return CheckInResult(
        checkin=CheckInResponse.model_validate(checkin),
        tree=_tree_to_dict(tree),
        milestone_reached=milestones,
        streak_frozen=False,  # simplified for now
    )


@router.get("/{habit_id}/checkins", response_model=list[CheckInResponse])
async def list_checkins(
    habit_id: int,
    limit: int = 60,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CheckIn)
        .where(CheckIn.habit_id == habit_id)
        .order_by(CheckIn.date.desc())
        .limit(limit)
    )
    checkins = result.scalars().all()
    return [CheckInResponse.model_validate(c) for c in checkins]


@router.get("/{habit_id}/calendar", response_model=HabitCalendarResponse)
async def habit_calendar(
    habit_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get calendar heatmap data for a habit."""
    result = await db.execute(
        select(CheckIn.date, CheckIn.is_mini)
        .where(CheckIn.habit_id == habit_id)
        .order_by(CheckIn.date)
    )
    rows = result.all()

    if not rows:
        today = date.today()
        return HabitCalendarResponse(
            days=[],
            start_date=today,
            end_date=today,
        )

    days = [
        HabitCalendarDay(date=row[0], count=1, is_mini=row[1])
        for row in rows
    ]

    return HabitCalendarResponse(
        days=days,
        start_date=rows[0][0],
        end_date=rows[-1][0],
    )
