from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# from app.model.attendance_model import (
#     AttendanceStatus,
#     LeaveType,
#     LeaveStatus
# )

from app.models.attendance_model import(
    AttendanceStatus
)
from app.models.leave_model import(
    LeaveType,
    LeaveStatus
)
from app.schemas.user_schema import UserResponse


# =========================
# Attendance Schemas
# =========================

class AttendanceCreate(BaseModel):

    employee_id: int


class AttendanceCheckOut(BaseModel):

    employee_id: int


class AttendanceResponse(BaseModel):

    id: int

    attendance_date: date

    check_in: Optional[datetime]
    check_out: Optional[datetime]

    total_hours:Optional[float]=0

    status: AttendanceStatus

    remarks: Optional[str]

    employee: UserResponse

    class Config:
        from_attributes = True


