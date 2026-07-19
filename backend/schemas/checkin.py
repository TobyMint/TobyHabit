from pydantic import BaseModel
from datetime import date


class StatsResponse(BaseModel):
    total_habits: int
    active_habits: int
    total_checkins: int
    total_days_tracked: int
    best_streak: int
    best_streak_habit_name: str | None
    forest_health_pct: int  # 0-100


class JournalEntry(BaseModel):
    id: int
    habit_id: int
    habit_name: str
    habit_emoji: str
    date: date
    note: str
    mood: int | None
    is_mini: bool


class JournalResponse(BaseModel):
    entries: list[JournalEntry]
    total: int


class HabitCalendarDay(BaseModel):
    date: date
    count: int
    is_mini: bool


class HabitCalendarResponse(BaseModel):
    days: list[HabitCalendarDay]
    start_date: date
    end_date: date
