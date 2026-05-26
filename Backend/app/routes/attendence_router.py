# ==========================================
# attendance_routes.py
# ==========================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db

from app.models.user import User


from app.schemas.attendence_schema import AttendanceResponse

from app.auth.dependencies import get_current_user
from app.models.enums import RoleEnum
from app.service.user_service import get_user_by_id

from typing import Optional


from app.service.attendence_service import (
    check_in_employee,
    check_out_employee,
    get_employee_attendence,
    get_attendence_by_date,
    get_today_attendance_status,
    filter_attendence,
    get_all_attendance,
    get_daily_attendance,
    get_weekly_attendance,
    get_monthly_attendance,
    get_department_attendance,
    get_project_summary,
    get_organization_dashboard,
    filter_attendence_admin_only,
    get_employee_dashboard,
)

attendence_router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ==========================================
# Check In
# ==========================================


@attendence_router.post("/check-in", response_model=AttendanceResponse)
def check_in(db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    return check_in_employee(db=db, employee_id=current_user["user_id"])


# ==========================================
# Check Out
# ==========================================


@attendence_router.put("/check-out", response_model=AttendanceResponse)
def check_out(db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    return check_out_employee(db=db, employee_id=current_user["user_id"])


# ==========================================
# Get Employee Attendance
# ==========================================


@attendence_router.get(
    "/employee/{employee_id}", response_model=list[AttendanceResponse]
)
def employee_attendance(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    get_user_by_id(user_id=employee_id, db=db, current_user=current_user)

    return get_employee_attendence(db=db, employee_id=employee_id)


# ==========================================
# Get Attendance By Date
# ==========================================


@attendence_router.get(
    "/date/{attendance_date}", response_model=list[AttendanceResponse]
)
def attendance_by_date(
    attendance_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    if current_user["role"] == RoleEnum.EMPLOYEE:
        raise HTTPException(
            status_code=403, detail="Employees cannot view company attendance"
        )

    return get_attendence_by_date(db=db, attendance_date=attendance_date)


@attendence_router.get("/today-status")
def today_attendence_status(
    db: Session = Depends(get_db), get_current_user=Depends(get_current_user)
):

    return get_today_attendance_status(db, employee_id=get_current_user["user_id"])


@attendence_router.get("/filter", response_model=list[AttendanceResponse])
def filter_attendence_route(
    search: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return filter_attendence(
        db=db,
        current_user=current_user,
        search=search,
        status=status,
        start_date=start_date,
        end_date=end_date,
        employee_id=employee_id,
    )


@attendence_router.get("/all")
def get_attendance(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return get_all_attendance(db, current_user)


@attendence_router.get("/analytics/daily")
def daily_attendance(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.ORGANIZATION_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only organization admin can see dashboard analytics",
        )

    return get_daily_attendance(db)


@attendence_router.get("/analytics/weekly")
def weekly_attendance(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.ORGANIZATION_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only organization admin can see dashboard analytics",
        )

    return get_weekly_attendance(db)


@attendence_router.get("/analytics/monthly")
def monthly_attendance(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.ORGANIZATION_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only organization admin can see dashboard analytics",
        )

    return get_monthly_attendance(db)


@attendence_router.get("/analytics/department")
def department_attendance(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.ORGANIZATION_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only organization admin can see dashboard analytics",
        )

    return get_department_attendance(db)


@attendence_router.get("/analytics/projects")
def project_summary(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user["role"] != RoleEnum.ORGANIZATION_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Only organization admin can see dashboard analytics",
        )

    return get_project_summary(db)


@attendence_router.get("/analytics/dashboard")
def dashboard_summary(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return get_organization_dashboard(db=db, current_user=current_user)


@attendence_router.get("/filter/admin")
def filter_attendence_admin_route(
    search: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    if current_user["role"] != "organization_admin":
        raise HTTPException(status_code=403, detail="Admin only access")

    return filter_attendence_admin_only(
        db=db,
        current_user=current_user,
        search=search,
        status=status,
        start_date=start_date,
        end_date=end_date,
        employee_id=employee_id,
    )


@attendence_router.get("/filter_for_admin")
def filter_attendence_admin_old_route(
    search: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return filter_attendence_admin_only(
        db=db,
        current_user=current_user,
        search=search,
        status=status,
        start_date=start_date,
        end_date=end_date,
        employee_id=employee_id,
    )


@attendence_router.get("/employee_home")
def employee_dashboard(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return get_employee_dashboard(db, current_user)
