from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Enum

import enum

from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship


# Leave Type Enum
class LeaveType(str, enum.Enum):
    sick_leave = "Sick Leave"
    casual_leave = "Casual Leave"
    paid_leave = "Paid Leave"
    emergency_leave = "Emergency Leave"
    

# Leave Status Enum
class LeaveStatus(str, enum.Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    leave_type = Column(Enum(LeaveType), nullable=False)

    reason = Column(Text, nullable=True)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    total_days = Column(Integer, nullable=False)

    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending, nullable=False)

    approved_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    employee = relationship("User", foreign_keys=[employee_id], back_populates="leaves")

    approver = relationship(
        "User", foreign_keys=[approved_by], back_populates="approved_leaves"
    )
