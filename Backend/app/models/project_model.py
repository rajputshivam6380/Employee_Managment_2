from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    Date,
    Enum,
    JSON
)

import enum

from sqlalchemy.orm import relationship

from app.database import Base

from sqlalchemy.sql import func


class PriorityEnum(str, enum.Enum):
    High = "High"
    Medium = "Medium"
    Low = "Low"


class StatusEnum(str, enum.Enum):
    Pending = "Pending"
    InProgress = "In Progress"
    Completed = "Completed"


class Project(Base):

    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        Date,
        default=func.now()
    )

    deadline = Column(
        Date,
        nullable=False
    )

    # STORE MULTIPLE IDS
    assigned_to = Column(
        JSON,
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE")
    )

    priority = Column(
        Enum(
            PriorityEnum,
            name="priority_enum"
        ),
        default=PriorityEnum.Medium,
        nullable=False
    )

    status = Column(
        Enum(
            StatusEnum,
            name="status_enum"
        ),
        default=StatusEnum.Pending,
        nullable=False
    )

    file_path=Column(
        String,
        nullable=True
        )

    # ONLY THIS RELATIONSHIP WILL WORK
    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )