from datetime import date, datetime
from pydantic import BaseModel, Field


class HabitCreate(BaseModel):
    name: str = Field(..., max_length=100)
    emoji: str = Field(default="🌱", max_length=10)
    description: str | None = None
    target_count_per_day: int = Field(default=1, ge=1, le=99)
    mini_version_text: str | None = Field(None, max_length=200)
    color: str = Field(default="#4CAF50", max_length=7)
    tree_species: str = Field(default="oak", max_length=20)


class HabitUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    emoji: str | None = Field(None, max_length=10)
    description: str | None = None
    target_count_per_day: int | None = Field(None, ge=1, le=99)
    mini_version_text: str | None = Field(None, max_length=200)
    color: str | None = Field(None, max_length=7)
    tree_species: str | None = Field(None, max_length=20)
    is_archived: bool | None = None


class TreeInfo(BaseModel):
    stage: int
    stage_label: str
    health: str  # excellent / good / okay / wilting / wilted
    total_days: int
    current_streak: int
    longest_streak: int
    freeze_cards: int
    next_milestone: int | None
    days_to_next_milestone: int | None


class HabitResponse(BaseModel):
    id: int
    name: str
    emoji: str
    description: str | None
    target_count_per_day: int
    mini_version_text: str | None
    color: str
    tree_species: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    today_count: int  # how many times checked in today
    today_mini_count: int  # how many mini check-ins today
    tree: TreeInfo | None = None

    model_config = {"from_attributes": True}


class HabitListItem(BaseModel):
    id: int
    name: str
    emoji: str
    color: str
    tree_species: str
    is_archived: bool
    today_count: int
    target_count_per_day: int
    tree: TreeInfo | None = None

    model_config = {"from_attributes": True}


class CheckInCreate(BaseModel):
    is_mini: bool = False
    note: str | None = None
    mood: int | None = Field(None, ge=1, le=5)


class CheckInResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    is_mini: bool
    note: str | None
    mood: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckInResult(BaseModel):
    checkin: CheckInResponse
    tree: TreeInfo
    milestone_reached: list[int]  # e.g., [7, 21]
    streak_frozen: bool  # whether a freeze card was consumed
