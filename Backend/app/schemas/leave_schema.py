from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


from app.models.attendance_model import AttendanceStatus

from app.models.leave_model import(
    LeaveType,
    LeaveStatus
)

from app.schemas.user_schema import UserResponse
from app.schemas.project_schema import UserMiniResponse







# =========================
# Leave Schemas
# =========================

class LeaveCreate(BaseModel):

    leave_type: LeaveType

    reason: Optional[str] = None

    start_date: date
    end_date: date


class LeaveUpdate(BaseModel):

    status: LeaveStatus


class LeaveResponse(BaseModel):

    id: int

    leave_type: LeaveType

    reason: Optional[str]

    start_date: date
    end_date: date

    total_days: int

    status: LeaveStatus

    approved_by: Optional[int]

    employee: UserMiniResponse

    created_at: datetime

    class Config:
        from_attributes = True