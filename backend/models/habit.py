from datetime import datetime, date

from sqlalchemy import String, Integer, Text, Boolean, Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    emoji: Mapped[str] = mapped_column(String(10), default="🌱")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_count_per_day: Mapped[int] = mapped_column(Integer, default=1)
    mini_version_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    color: Mapped[str] = mapped_column(String(7), default="#4CAF50")
    tree_species: Mapped[str] = mapped_column(String(20), default="oak")
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    check_ins: Mapped[list["CheckIn"]] = relationship(
        "CheckIn", back_populates="habit", cascade="all, delete-orphan"
    )


class CheckIn(Base):
    __tablename__ = "check_ins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    habit_id: Mapped[int] = mapped_column(Integer, ForeignKey("habits.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    is_mini: Mapped[bool] = mapped_column(Boolean, default=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    habit: Mapped["Habit"] = relationship("Habit", back_populates="check_ins")
