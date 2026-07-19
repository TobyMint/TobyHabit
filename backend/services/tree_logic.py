from dataclasses import dataclass
from datetime import date, timedelta

from backend.config import MILESTONES, RESURRECTION_WINDOW_DAYS, RESURRECTION_REQUIRED_DAYS, get_today
from backend.services.streak import StreakInfo, calculate_streak


@dataclass
class TreeInfo:
    stage: int
    stage_label: str
    health: str  # excellent / good / okay / wilting / wilted
    total_days: int  # raw unique days
    effective_days: int  # full days + (mini-only days // 2)
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


def _compute_effective_days(
    checkin_dates: list[date],
    checkin_is_mini: list[bool],
) -> tuple[int, int]:
    """
    Compute raw unique days and effective days.
    Mini-only days count as 0.5 (2 mini days = 1 effective day).
    A day with at least one full check-in counts as 1 full day.
    """
    if not checkin_dates:
        return 0, 0

    # For each unique date, track the best check-in type
    date_best: dict[date, bool] = {}  # True = has full check-in
    for d, is_mini in zip(checkin_dates, checkin_is_mini):
        if d not in date_best:
            date_best[d] = not is_mini
        else:
            # Upgrade from mini to full if we see a full check-in
            if not is_mini:
                date_best[d] = True

    raw_days = len(date_best)
    full_days = sum(1 for v in date_best.values() if v)
    mini_days = sum(1 for v in date_best.values() if not v)
    effective_days = full_days + (mini_days // 2)

    return raw_days, effective_days


def calculate_tree(
    checkin_dates: list[date],
    checkin_is_mini: list[bool] | None = None,
) -> TreeInfo:
    """Calculate full tree info from check-in data."""
    if checkin_is_mini is None:
        checkin_is_mini = [False] * len(checkin_dates)

    raw_days, effective_days = _compute_effective_days(checkin_dates, checkin_is_mini)
    stage = get_stage(effective_days)

    streak_info = calculate_streak(checkin_dates)

    # Calculate recent mini ratio (last 7 days)
    today = get_today()
    recent = [
        is_mini
        for d, is_mini in zip(checkin_dates, checkin_is_mini)
        if d > today - timedelta(days=7)
    ]
    mini_ratio = sum(recent) / len(recent) if recent else 0.0

    health = get_health(streak_info.current_streak, mini_ratio)

    # Calculate next milestone (based on effective_days)
    next_milestone = None
    days_to_next = None
    for m in MILESTONES:
        if effective_days < m:
            next_milestone = m
            days_to_next = m - effective_days
            break

    return TreeInfo(
        stage=stage,
        stage_label=STAGE_LABELS[stage],
        health=health,
        total_days=raw_days,
        effective_days=effective_days,
        current_streak=streak_info.current_streak,
        longest_streak=streak_info.longest_streak,
        freeze_cards=streak_info.freeze_cards_available,
        next_milestone=next_milestone,
        days_to_next_milestone=days_to_next,
    )


def get_reached_milestones(
    old_effective_days: int, new_effective_days: int, is_mini: bool
) -> list[int]:
    """Return milestone days crossed. Mini check-ins don't trigger celebrations."""
    if is_mini:
        return []
    reached = []
    for m in MILESTONES:
        if old_effective_days < m <= new_effective_days:
            reached.append(m)
    return reached
