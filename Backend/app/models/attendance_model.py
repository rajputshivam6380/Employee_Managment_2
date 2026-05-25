from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    DECIMAL,
    ForeignKey,
    Text,
    Enum
)

from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship



import enum


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent = "Absent"
    late = "Late"
    half_day = "Half Day"
    leave = "Leave"
    complete = "Completed"

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    attendance_date = Column(Date, nullable=False)

    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)

    total_hours = Column(
        DECIMAL(5, 2),
        default=0
    )

    status = Column(
    Enum(AttendanceStatus),
    default=AttendanceStatus.present,
    nullable=False
)

    remarks = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    employee = relationship(
    "User",
    back_populates="attendances"
)