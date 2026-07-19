from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DATABASE_URL = f"sqlite+aiosqlite:///{DATA_DIR / 'tobyhabit.db'}"
SYNC_DATABASE_URL = f"sqlite:///{DATA_DIR / 'tobyhabit.db'}"

# Tree growth milestones
MILESTONES = [7, 21, 66, 100, 200, 365]

# Streak freeze: every N consecutive days = 1 freeze card
FREEZE_CARD_INTERVAL = 7

# Resurrection: within N days of breaking streak, complete M days to revive
RESURRECTION_WINDOW_DAYS = 3
RESURRECTION_REQUIRED_DAYS = 2
