from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.config import get_today
from backend.database import get_db
from backend.models.habit import Habit, CheckIn
from backend.schemas.habit import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitListItem,
    CheckInCreate,
    CheckInResponse,
    CheckInResult,
)
from backend.services.tree_logic import (
    calculate_tree,
    get_reached_milestones,
)

def _tree_to_dict(tree):
    """Convert service TreeInfo dataclass to dict for Pydantic schema."""
    return asdict(tree)

router = APIRouter(prefix="/api/habits", tags=["habits"])


async def _habit_to_response(habit: Habit, db: AsyncSession) -> HabitResponse:
    """Convert ORM Habit to response with tree info."""
    # Get all check-ins for this habit
    result = await db.execute(
        select(CheckIn)
        .where(CheckIn.habit_id == habit.id)
        .order_by(CheckIn.date.desc())
    )
    checkins = result.scalars().all()

    checkin_dates = [c.date for c in checkins]
    checkin_is_mini = [c.is_mini for c in checkins]

    tree = calculate_tree(checkin_dates, checkin_is_mini)

    today = get_today()
    today_checkins = [c for c in checkins if c.date == today]

    return HabitResponse(
        id=habit.id,
        name=habit.name,
        emoji=habit.emoji,
        description=habit.description,
        target_count_per_day=habit.target_count_per_day,
        mini_version_text=habit.mini_version_text,
        color=habit.color,
        tree_species=habit.tree_species,
        is_archived=habit.is_archived,
        created_at=habit.created_at,
        updated_at=habit.updated_at,
        today_count=sum(1 for c in today_checkins if not c.is_mini),
        today_mini_count=sum(1 for c in today_checkins if c.is_mini),
        tree=_tree_to_dict(tree),
    )


@router.get("", response_model=list[HabitListItem])
async def list_habits(
    include_archived: bool = False,
    db: AsyncSession = Depends(get_db),
):
    query = select(Habit)
    if not include_archived:
        query = query.where(Habit.is_archived == False)
    query = query.order_by(Habit.created_at.desc())

    result = await db.execute(query)
    habits = result.scalars().all()

    items = []
    for habit in habits:
        # Get checkins for tree info
        r = await db.execute(
            select(CheckIn.date, CheckIn.is_mini)
            .where(CheckIn.habit_id == habit.id)
            .order_by(CheckIn.date.desc())
        )
        rows = r.all()
        checkin_dates = [row[0] for row in rows]
        checkin_is_mini = [row[1] for row in rows]
        tree = calculate_tree(checkin_dates, checkin_is_mini)

        today = get_today()
        today_full = sum(1 for i, d in enumerate(checkin_dates) if d == today and not checkin_is_mini[i])

        items.append(
            HabitListItem(
                id=habit.id,
                name=habit.name,
                emoji=habit.emoji,
                color=habit.color,
                tree_species=habit.tree_species,
                is_archived=habit.is_archived,
                today_count=today_full,
                target_count_per_day=habit.target_count_per_day,
                tree=_tree_to_dict(tree),
            )
        )

    return items


@router.post("", response_model=HabitResponse, status_code=201)
async def create_habit(
    data: HabitCreate,
    db: AsyncSession = Depends(get_db),
):
    habit = Habit(**data.model_dump())
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return await _habit_to_response(habit, db)


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")
    return await _habit_to_response(habit, db)


@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: int,
    data: HabitUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(habit, key, value)

    await db.commit()
    await db.refresh(habit)
    return await _habit_to_response(habit, db)


@router.delete("/{habit_id}")
async def archive_habit(
    habit_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Archive a habit (soft delete)."""
    result = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")

    habit.is_archived = True
    await db.commit()
    return {"ok": True}
