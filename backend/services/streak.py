from datetime import date, timedelta
from dataclasses import dataclass
from collections import defaultdict

from backend.config import get_today


@dataclass
class StreakInfo:
    current_streak: int
    longest_streak: int
    freeze_cards_total: int
    freeze_cards_used: int
    freeze_cards_available: int
    needs_resurrection: bool  # streak just broke, within resurrection window
    resurrection_progress: int  # days completed in resurrection window
    resurrection_required: int  # days needed to revive


def calculate_streak(
    checkin_dates: list[date],
    freeze_card_interval: int = 7,
    resurrection_window: int = 3,
    resurrection_required: int = 2,
) -> StreakInfo:
    """
    Calculate streak info from a list of check-in dates.

    Key behaviors:
    - A freeze card is earned for every N consecutive days (default 7)
    - When a day is missed, a freeze card is auto-consumed if available
    - If no freeze cards, streak breaks but resurrection window opens
    - Within resurrection window (3 days), completing required days (2) revives the streak
    """
    if not checkin_dates:
        return StreakInfo(
            current_streak=0,
            longest_streak=0,
            freeze_cards_total=0,
            freeze_cards_used=0,
            freeze_cards_available=0,
            needs_resurrection=False,
            resurrection_progress=0,
            resurrection_required=resurrection_required,
        )

    today = get_today()
    sorted_dates = sorted(set(checkin_dates))

    # Build all streaks
    streaks: list[list[date]] = []
    current_run = [sorted_dates[0]]

    for i in range(1, len(sorted_dates)):
        prev = sorted_dates[i - 1]
        curr = sorted_dates[i]
        if (curr - prev).days == 1:
            current_run.append(curr)
        else:
            streaks.append(current_run)
            current_run = [curr]
    streaks.append(current_run)

    longest_streak = max(len(s) for s in streaks) if streaks else 0

    # Calculate freeze cards
    # Each streak of consecutive days earns freeze cards
    total_freeze_cards_earned = sum(len(s) // freeze_card_interval for s in streaks)

    # Now determine current streak with freeze card logic
    # Start from the most recent streak and work backwards through gaps
    current_streak = 0
    freeze_cards_available = total_freeze_cards_earned
    freeze_cards_used = 0
    needs_resurrection = False
    resurrection_progress = 0

    # Get the last streak
    last_streak = streaks[-1]

    # Check if the last streak reaches today or yesterday
    last_date = last_streak[-1]

    if last_date == today:
        # Currently active, streak continues
        current_streak = len(last_streak)
        needs_resurrection = False
    elif last_date == today - timedelta(days=1):
        # Yesterday was the last check-in, today not yet
        # But if there's a gap before that to previous streaks, we need freeze cards
        current_streak = len(last_streak)
        needs_resurrection = False
    else:
        # There's a gap between last check-in and today
        gap_days = (today - last_date).days

        # Try to use freeze cards to cover the gap
        # Each day of gap needs one freeze card
        if gap_days <= freeze_cards_available:
            freeze_cards_used = gap_days
            freeze_cards_available -= gap_days
            current_streak = len(last_streak) + gap_days  # streak continues via freeze
            needs_resurrection = False
        elif gap_days <= freeze_cards_available + resurrection_window:
            # Can't fully cover with freeze cards, but within resurrection window
            freeze_cards_used = freeze_cards_available
            freeze_cards_available = 0

            # Count days within resurrection window
            resurrection_start = last_date + timedelta(days=1)
            days_in_window = [
                d for d in sorted_dates
                if resurrection_start <= d <= today
            ]
            resurrection_progress = len(days_in_window)

            if resurrection_progress >= resurrection_required:
                # Resurrection successful!
                current_streak = len(last_streak) + gap_days
                needs_resurrection = False
            else:
                # Still in resurrection window, waiting for more check-ins
                needs_resurrection = True
                current_streak = 0  # Currently broken
        else:
            # Streak is truly broken
            current_streak = 0
            needs_resurrection = False
            freeze_cards_available = total_freeze_cards_earned  # Reset, cards come from active streak

    # Recalculate freeze cards based on current active streak
    # Only the CURRENT streak generates freeze cards
    if current_streak > 0:
        active_freeze_cards = current_streak // freeze_card_interval
        # We already used some, recalculate available
        freeze_cards_available = max(0, active_freeze_cards - freeze_cards_used)

    return StreakInfo(
        current_streak=current_streak,
        longest_streak=max(longest_streak, current_streak),
        freeze_cards_total=total_freeze_cards_earned,
        freeze_cards_used=freeze_cards_used,
        freeze_cards_available=freeze_cards_available,
        needs_resurrection=needs_resurrection,
        resurrection_progress=resurrection_progress,
        resurrection_required=resurrection_required,
    )
