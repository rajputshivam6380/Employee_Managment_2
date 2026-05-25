from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import and_,or_, cast, String
from datetime import date, datetime, time, timedelta

from app.models.user import User
from app.models.enums import RoleEnum
from app.models.attendance_model import (
    Attendance,
    AttendanceStatus
)


from app.models.attendance_model import Attendance

from app.models.project_model import Project, StatusEnum

from typing import Optional
# ==========================================
# CHECK IN
# ==========================================
def check_in_employee(
    db: Session,
    employee_id: int
):

    # CHECK EMPLOYEE EXISTS
    employee = db.query(User).filter(
        User.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    today = date.today()

    # CHECK ALREADY CHECKED IN
    existing_attendance = db.query(Attendance).filter(
        and_(
            Attendance.employee_id == employee_id,
            Attendance.attendance_date == today
        )
    ).first()

    if existing_attendance:
        raise HTTPException(
            status_code=400,
            detail="Attendance already marked for today"
        )

    current_time = datetime.now()

    check_in_time = current_time.time()

    # ================= STATUS =================

    # BEFORE 10:30 => PRESENT

    if check_in_time is None:
        status = AttendanceStatus.absent

    elif check_in_time <= time(10, 30):
        status = AttendanceStatus.present

    elif check_in_time <= time(15, 30):
        status = AttendanceStatus.late

    else:
        status = AttendanceStatus.half_day
    # if check_in_time <= time(10, 30):
    #     status = AttendanceStatus.present


    # elif check_in_time <= time(15,30):
    #     status= AttendanceStatus.half_day

    # # AFTER 10:30 => LATE

    # elif check_in_time >= (10,30):
    #     if check_in_time >= time(10,30) and check_in_time <= time(15,29):
    #         status= AttendanceStatus.half_day
        
    # else:
    #     status = AttendanceStatus.absent

    # CREATE ATTENDANCE
    attendance = Attendance(
        employee_id=employee_id,
        attendance_date=today,
        check_in=current_time,
        status=status
    )

    db.add(attendance)

    db.commit()

    db.refresh(attendance)

    return attendance



# ==========================================
# CHECK OUT
# ==========================================
def check_out_employee(
    db: Session,
    employee_id: int
):

    today = date.today()

    attendance = db.query(Attendance).filter(
        and_(
            Attendance.employee_id == employee_id,
            Attendance.attendance_date == today
        )
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Check-in not found"
        )

    if attendance.check_out:
        raise HTTPException(
            status_code=400,
            detail="Already checked out"
        )

    current_time = datetime.now()

    attendance.check_out = current_time

    # ================= TOTAL HOURS =================

    total_seconds = (
        attendance.check_out -
        attendance.check_in
    ).total_seconds()

    total_hours = round(
        total_seconds / 3600,
        2
    )

    attendance.total_hours = total_hours

    # ================= STATUS UPDATE =================

    # LESS THAN 2 HOURS => LEAVE
    if total_hours < 2:

        attendance.status = AttendanceStatus.leave

    # LESS THAN 5 HOURS => HALF DAY
    elif total_hours < 5:

        attendance.status = AttendanceStatus.half_day

    # 5 TO 8 HOURS
    elif total_hours >= 5 and total_hours < 8:

        # KEEP PRESENT OR LATE
        if attendance.status == AttendanceStatus.late:
            attendance.status = AttendanceStatus.late
        else:
            attendance.status = AttendanceStatus.complete

    # 8+ HOURS => COMPLETED
    elif total_hours >= 8:

        attendance.status = AttendanceStatus.complete

    db.commit()

    db.refresh(attendance)

    return attendance


# ==========================================
# GET EMPLOYEE ATTENDANCE
# ==========================================
def get_employee_attendence(
    db: Session,
    employee_id: int
):

    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee_id
    ).order_by(
        Attendance.attendance_date.desc()
    ).all()

    return attendance


# ==========================================
# GET ATTENDANCE BY DATE
# ==========================================
def get_attendence_by_date(
    db: Session,
    attendance_date: date
):

    attendence = db.query(Attendance).filter(
        Attendance.attendance_date == attendance_date
    ).all()

    if not attendence:
        raise HTTPException(
            status_code=404,
            detail="Attendence not found"
        )

    return attendence










# ==========================================
# GET TODAY ATTENDANCE STATUS
# ==========================================
def get_today_attendance_status(
    db: Session,
    employee_id: int
):

    today = date.today()

    attendance = db.query(Attendance).filter(
        and_(
            Attendance.employee_id == employee_id,
            Attendance.attendance_date == today
        )
    ).first()

    # NO ATTENDANCE FOUND

    if not attendance:

        return {
            "checked_in": False,
            "checked_out": False,
            "attendance": None
        }

    return {
        "checked_in":
            attendance.check_in is not None,

        "checked_out":
            attendance.check_out is not None,

        "attendance": {
            "id": attendance.id,
            "date": attendance.attendance_date,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
            "status": attendance.status,
            "total_hours": attendance.total_hours
        }
    }




def filter_attendence(
    db: Session,
    current_user,
    search: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    employee_id: Optional[int] = None,
):

    query = db.query(Attendance)

    role = current_user["role"].lower()

    # EMPLOYEE => ONLY OWN DATA
    if role == "employee":

        query = query.filter(
            Attendance.employee_id ==
            current_user["user_id"]
        )

    # ORGANIZATION ADMIN VIEWING EMPLOYEE
    elif role == "organization_admin" and employee_id:

        query = query.filter(
            Attendance.employee_id ==
            employee_id
        )

    # SEARCH
    if search:

        from sqlalchemy import cast, String

        query = query.filter(
            cast(
                Attendance.status,
                String
            ).ilike(f"%{search}%")
        )

    # STATUS FILTER
    if status:

        query = query.filter(
            Attendance.status == status
        )

    # DATE FILTER
    if start_date and end_date:

        query = query.filter(
            Attendance.attendance_date.between(
                start_date,
                end_date
            )
        )

    attendance = query.order_by(
        Attendance.attendance_date.desc()
    ).all()

    return attendance








def get_all_attendance(
    db: Session,
    current_user
):

    role = current_user["role"].lower()

    if role != "organization_admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can see all attendance"
        )

    attendance = (
        db.query(
            Attendance,
            User.name,
            User.email,
            # User.profile_image
        )
        .join(
            User,
            User.id == Attendance.employee_id
        )
        # .filter(
        #     User.organization_id ==
        #     current_user["organization_id"]
        # )
        .order_by(
            Attendance.attendance_date.desc()
        )
        .all()
    )

    result = []

    for att, name, email in attendance:

        result.append({
            "id": att.id,
            "employee_id": att.employee_id,
            "employee_name": name,
            "email": email,
            # "photo": image,

            "attendance_date":
            att.attendance_date,

            "check_in":
            att.check_in,

            "check_out":
            att.check_out,

            "total_hours":
            att.total_hours,

            "status":
            att.status
        })

    return result





def get_daily_attendance(db: Session, days: int = 7):

    query = """
        SELECT
            attendance_date,
            COUNT(*) FILTER (WHERE status = 'present') AS present,
            COUNT(*) FILTER (WHERE status != 'present') AS absent
        FROM attendance
        WHERE attendance_date >= CURRENT_DATE - INTERVAL '%s days'
        GROUP BY attendance_date
        ORDER BY attendance_date;
    """ % days

    return db.execute(query).mappings().all()






def get_weekly_attendance(db: Session):

    query = """
        SELECT
            DATE_TRUNC('week', attendance_date) AS week,
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'present') * 100.0)
                / NULLIF(COUNT(*), 0),
                2
            ) AS attendance_percentage
        FROM attendance
        GROUP BY week
        ORDER BY week;
    """

    return db.execute(query).mappings().all()




def get_monthly_attendance(db: Session):

    query = """
        SELECT
            DATE_TRUNC('month', attendance_date) AS month,
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'present') * 100.0)
                / NULLIF(COUNT(*), 0),
                2
            ) AS attendance_percentage
        FROM attendance
        GROUP BY month
        ORDER BY month;
    """

    return db.execute(query).mappings().all()





def get_department_attendance(db: Session):

    query = """
        SELECT
            u.department,
            COUNT(a.id) AS total,
            COUNT(a.id) FILTER (WHERE a.status = 'present') AS present,
            ROUND(
                (COUNT(a.id) FILTER (WHERE a.status = 'present') * 100.0)
                / NULLIF(COUNT(a.id), 0),
                2
            ) AS percentage
        FROM attendance a
        JOIN users u ON u.id = a.employee_id
        GROUP BY u.department
        ORDER BY percentage DESC;
    """

    return db.execute(query).mappings().all()




def get_project_summary(db: Session):

    query = """
        SELECT
            COUNT(*) AS total_projects,
            COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
            COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
            COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress
        FROM projects;
    """

    return db.execute(query).mappings().first()


def get_organization_dashboard(
    db: Session,
    current_user
):

    if current_user["role"] != "organization_admin":
        raise HTTPException(
            status_code=403,
            detail="Only organization admin can see dashboard"
        )

    today = date.today()
    month_start = today.replace(day=1)
    analytics_start = min(
        month_start,
        today - timedelta(days=34)
    )
    admin_id = current_user["user_id"]

    employees = db.query(User).filter(
        User.role == RoleEnum.EMPLOYEE,
        User.parent_id == admin_id
    ).all()

    employee_ids = [
        employee.id
        for employee in employees
    ]

    total_employees = len(employees)

    if not employee_ids:
        return {
            "cards": {
                "total_employees": 0,
                "daily_attendance_average": 0,
                "total_projects": 0,
                "assigned_project_count": 0,
            },
            "daily_attendance": [],
            "weekly_attendance": [],
            "monthly_department_average": [],
            "daily_department_average": [],
            "project_summary": {
                "pending": 0,
                "in_progress": 0,
                "completed": 0,
            },
        }

    attendance_records = db.query(Attendance).filter(
        Attendance.employee_id.in_(employee_ids),
        Attendance.attendance_date >= analytics_start
    ).all()

    attended_statuses = {
        AttendanceStatus.present,
        AttendanceStatus.late,
        AttendanceStatus.half_day,
        AttendanceStatus.leave,
        AttendanceStatus.complete,
    }

    today_attended = {
        record.employee_id
        for record in attendance_records
        if (
            record.attendance_date == today
            and record.status in attended_statuses
        )
    }

    daily_attendance_average = round(
        (len(today_attended) * 100) / total_employees,
        2
    )

    daily_attendance = []

    for index in range(6, -1, -1):
        current_date = today - timedelta(days=index)

        attended_ids = {
            record.employee_id
            for record in attendance_records
            if (
                record.attendance_date == current_date
                and record.status in attended_statuses
            )
        }

        daily_attendance.append({
            "date": current_date.isoformat(),
            "present": len(attended_ids),
            "absent": total_employees - len(attended_ids),
            "average": round(
                (len(attended_ids) * 100) / total_employees,
                2
            )
        })

    weekly_attendance = []

    for index in range(4, -1, -1):
        period_end = today - timedelta(days=index * 7)
        period_start = period_end - timedelta(days=6)

        period_records = [
            record
            for record in attendance_records
            if period_start <= record.attendance_date <= period_end
            and record.status in attended_statuses
        ]

        working_days = (
            period_end - period_start
        ).days + 1

        possible_attendance = total_employees * working_days

        weekly_attendance.append({
            "week": f"{period_start.strftime('%d %b')} - {period_end.strftime('%d %b')}",
            "average": round(
                (len(period_records) * 100) / possible_attendance,
                2
            ) if possible_attendance else 0
        })

    department_map = {}

    for employee in employees:
        department = (
            employee.department.value
            if employee.department
            else "No Department"
        )

        department_map.setdefault(
            department,
            []
        ).append(employee.id)

    days_elapsed = today.day
    monthly_department_average = []
    daily_department_average = []

    for department, department_employee_ids in department_map.items():
        department_records = [
            record
            for record in attendance_records
            if (
                record.employee_id in department_employee_ids
                and record.attendance_date >= month_start
                and record.status in attended_statuses
            )
        ]

        possible_monthly = (
            len(department_employee_ids) *
            days_elapsed
        )

        today_department_attended = {
            record.employee_id
            for record in department_records
            if record.attendance_date == today
        }

        monthly_department_average.append({
            "department": department,
            "average": round(
                (len(department_records) * 100) / possible_monthly,
                2
            ) if possible_monthly else 0
        })

        daily_department_average.append({
            "department": department,
            "average": round(
                (
                    len(today_department_attended) *
                    100
                ) / len(department_employee_ids),
                2
            ) if department_employee_ids else 0
        })

    projects = db.query(Project).filter(
        Project.created_by == admin_id
    ).all()

    project_summary = {
        "pending": 0,
        "in_progress": 0,
        "completed": 0,
    }

    assigned_project_count = 0

    for project in projects:
        assigned_project_count += len(
            project.assigned_to or []
        )

        if project.status == StatusEnum.Pending:
            project_summary["pending"] += 1
        elif project.status == StatusEnum.InProgress:
            project_summary["in_progress"] += 1
        elif project.status == StatusEnum.Completed:
            project_summary["completed"] += 1

    return {
        "cards": {
            "total_employees": total_employees,
            "daily_attendance_average": daily_attendance_average,
            "total_projects": len(projects),
            "assigned_project_count": assigned_project_count,
        },
        "daily_attendance": daily_attendance,
        "weekly_attendance": weekly_attendance,
        "monthly_department_average": monthly_department_average,
        "daily_department_average": daily_department_average,
        "project_summary": project_summary,
    }




def filter_attendence_admin_only(
    db:Session,
    current_user,
    search:Optional[str]=None,
    status:Optional[str]=None,
    start_date:Optional[date]=None,
    end_date:Optional[date]=None,
    employee_id:Optional[int]=None,

):
    role = current_user["role"].lower()

    if role != "organization_admin":
        raise HTTPException(
            status_code=403,
            detail='Only organization admin can access filter'
        )

    admin_id = current_user["user_id"]

    query = (
        db.query(
            Attendance,
            User.name,
            User.email
        )
        .join(
            User,
            User.id == Attendance.employee_id
        )
        .filter(
            User.role == RoleEnum.EMPLOYEE,
            User.parent_id == admin_id
        )
    )

    if employee_id:
        query = query.filter(
            Attendance.employee_id == employee_id
        )

    if search:
        search_filter = f"%{search.strip()}%"

        query = query.filter(
            or_(
                User.name.ilike(search_filter),
                User.email.ilike(search_filter),
                cast(
                    Attendance.status,
                    String
                ).ilike(search_filter),
            )
        )

    if status:

        status_map = {
            "present": AttendanceStatus.present,
            "Present": AttendanceStatus.present,
            "late": AttendanceStatus.late,
            "Late": AttendanceStatus.late,
            "half_day": AttendanceStatus.half_day,
            "Half Day": AttendanceStatus.half_day,
            "leave": AttendanceStatus.leave,
            "Leave": AttendanceStatus.leave,
            "complete": AttendanceStatus.complete,
            "completed": AttendanceStatus.complete,
            "Completed": AttendanceStatus.complete,
            "absent": AttendanceStatus.absent,
            "Absent": AttendanceStatus.absent,
        }

        query = query.filter(
            Attendance.status ==
            status_map.get(status, status)
        )

    if start_date and end_date:
        query = query.filter(
            Attendance.attendance_date.between(
                start_date,
                end_date
            )
        )

    elif start_date:
        query = query.filter(
            Attendance.attendance_date >= start_date
        )

    elif end_date:
        query = query.filter(
            Attendance.attendance_date <= end_date
        )

    rows = query.order_by(
        Attendance.attendance_date.desc()
    ).all()

    result = []

    for attendance, name, email in rows:
        result.append({
            "id": attendance.id,
            "employee_id": attendance.employee_id,
            "employee_name": name,
            "email": email,
            "attendance_date": attendance.attendance_date,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
            "total_hours": attendance.total_hours,
            "status": attendance.status.value,
        })

    return result
