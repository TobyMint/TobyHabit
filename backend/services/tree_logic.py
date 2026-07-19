from dataclasses import dataclass
from datetime import date, timedelta

from backend.config import MILESTONES, RESURRECTION_WINDOW_DAYS, RESURRECTION_REQUIRED_DAYS, get_today
from backend.services.streak import StreakInfo, calculate_streak


@dataclass
class TreeInfo:
    stage: int
    stage_label: str
    health: str  # excellent / good / okay / wilting / wilted
    total_days: int
    current_streak: int
    longest_streak: int
    freeze_cards: int
    next_milestone: int | None
    days_to_next_milestone: int | None


STAGE_LABELS = {
    0: "种子",
    1: "嫩芽",
    2: "树苗",
    3: "小树",
    4: "大树",
    5: "开花",
    6: "结果",
    7: "古树",
}

STAGE_THRESHOLDS = [0, 1, 7, 21, 66, 100, 200, 365]


def get_stage(total_days: int) -> int:
    """Determine tree growth stage based on total check-in days."""
    stage = 0
    for i, threshold in enumerate(STAGE_THRESHOLDS):
        if total_days >= threshold:
            stage = i
    return stage


def get_health(current_streak: int, recent_mini_ratio: float = 0.0) -> str:
    """
    Determine tree health based on current streak and mini check-in ratio.

    recent_mini_ratio: ratio of mini check-ins in the last 7 days (0.0 to 1.0)
    """
    if current_streak >= 7:
        if recent_mini_ratio >= 0.7:
            return "good"  # Long streak but mostly mini → downgrade
        return "excellent"
    elif current_streak >= 3:
        return "good"
    elif current_streak >= 1:
        return "okay"
    elif current_streak == 0:
        return "wilted"
    return "okay"


def calculate_tree(
    checkin_dates: list[date],
    checkin_is_mini: list[bool] | None = None,
) -> TreeInfo:
    """
    Calculate full tree info from check-in data.
    """
    total_days = len(set(checkin_dates))
    stage = get_stage(total_days)

    streak_info = calculate_streak(checkin_dates)

    # Calculate recent mini ratio (last 7 days)
    if checkin_is_mini:
        today = get_today()
        recent = [
            is_mini
            for d, is_mini in zip(checkin_dates, checkin_is_mini)
            if d > today - timedelta(days=7)
        ]
        if recent:
            mini_ratio = sum(recent) / len(recent)
        else:
            mini_ratio = 0.0
    else:
        mini_ratio = 0.0

    health = get_health(streak_info.current_streak, mini_ratio)

    # Calculate next milestone
    next_milestone = None
    days_to_next = None
    for m in MILESTONES:
        if total_days < m:
            next_milestone = m
            days_to_next = m - total_days
            break

    return TreeInfo(
        stage=stage,
        stage_label=STAGE_LABELS[stage],
        health=health,
        total_days=total_days,
        current_streak=streak_info.current_streak,
        longest_streak=streak_info.longest_streak,
        freeze_cards=streak_info.freeze_cards_available,
        next_milestone=next_milestone,
        days_to_next_milestone=days_to_next,
    )


def get_reached_milestones(old_total_days: int, new_total_days: int) -> list[int]:
    """Return list of milestone days crossed in this check-in."""
    reached = []
    for m in MILESTONES:
        if old_total_days < m <= new_total_days:
            reached.append(m)
    return reached
