# app/service/user_service.py

import secrets
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.user import User

from app.models.enums import RoleEnum

from app.schemas.user_schema import UserCreate, UserUpdate

from app.models.attendance_model import Attendance, AttendanceStatus

from datetime import datetime, date

from sqlalchemy import and_, cast, String, or_, func


from app.auth.utils import hash_password

from app.service.email_service import send_employee_welcome_email

from app.core.config import settings

import asyncio

from typing import Optional

from fastapi import Depends

from app.database import get_db


# ================= CREATE USER =================


async def create_user(db: Session, user_data: UserCreate, current_user):

    raw_role = current_user.get("role")
    if isinstance(raw_role, str):
        try:
            current_role = RoleEnum(raw_role.lower())
        except ValueError:
            current_role = raw_role
    else:
        current_role = raw_role


    # ================= EMPLOYEE BLOCK =================

    if current_role == RoleEnum.EMPLOYEE:

        raise HTTPException(status_code=403, detail="Employees cannot create users")

    # ================= EMAIL CHECK =================
    clean_email = user_data.email.strip().lower() if user_data.email else ""
    existing_user = db.query(User).filter(func.lower(User.email) == clean_email).first()

    if existing_user:

        raise HTTPException(status_code=400, detail="Email already exists")


    # ================= ROLE ACCESS =================

    # ONLY SUPER ADMIN CAN CREATE ORGANIZATION ADMIN
    if (
        user_data.role == RoleEnum.ORGANIZATION_ADMIN
        and current_role != RoleEnum.SUPER_ADMIN
    ):

        raise HTTPException(
            status_code=403, detail="Only super admin can create organization admin"
        )

    # HR MANAGER CAN CREATE ONLY EMPLOYEE
    if current_role == RoleEnum.HR_MANAGER and user_data.role != RoleEnum.EMPLOYEE:

        raise HTTPException(
            status_code=403, detail="HR manager can create only employees"
        )

    # DEPARTMENT ADMIN CAN CREATE ONLY EMPLOYEE
    if (
        current_role == RoleEnum.DEPARTMENT_ADMIN
        and user_data.role != RoleEnum.EMPLOYEE
    ):

        raise HTTPException(
            status_code=403, detail="Department admin can create only employees"
        )

    # ================= SUPER ADMIN CHECK =================

    if user_data.role == RoleEnum.SUPER_ADMIN:

        existing_super_admin = (
            db.query(User).filter(User.role == RoleEnum.SUPER_ADMIN).first()
        )

        if existing_super_admin:

            raise HTTPException(status_code=400, detail="Super admin already exists")

    # ================= PARENT ID =================

    if current_role == RoleEnum.SUPER_ADMIN:

        parent_id = current_user["user_id"]

    elif current_role == RoleEnum.ORGANIZATION_ADMIN:

        parent_id = current_user["user_id"]

    elif current_role == RoleEnum.HR_MANAGER:

        parent_id = current_user["user_id"]

    elif current_role == RoleEnum.DEPARTMENT_ADMIN:

        parent_id = current_user["user_id"]

    else:

        parent_id = None

    # ================= DEPARTMENT ADMIN CHECK =================

    if user_data.role == RoleEnum.DEPARTMENT_ADMIN:

        existing_department_admin = (
            db.query(User)
            .filter(
                User.role == RoleEnum.DEPARTMENT_ADMIN,
                User.department == user_data.department,
            )
            .first()
        )

        if existing_department_admin:

            raise HTTPException(
                status_code=400, detail="Department admin already exists"
            )

    hashed_password = hash_password(user_data.password)
    # ================= CREATE USER =================

    user = User(
        name=user_data.name,
        email=clean_email,
        password=hashed_password,

        # hash_password(user_data.password),
        phone=user_data.phone,
        role=user_data.role,
        country_code=user_data.country_code,
        department=user_data.department,
        parent_id=parent_id,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        print("❌ Error creating user in DB:", str(e))
        raise HTTPException(
            status_code=400, detail=f"Could not create user: {str(e)}"
        )

    # ================= SEND WELCOME EMAIL FOR EMPLOYEES =================
    if user.role == RoleEnum.EMPLOYEE:
        try:
            await asyncio.wait_for(
                send_employee_welcome_email(
                    employee_email=user.email,
                    employee_name=user.name,
                    employee_password=user_data.password,
                    frontend_url=settings.FRONTEND_URL,
                ),
                timeout=3.0,
            )
        except Exception as e:
            print(f"⚠️ Welcome email task error/timeout: {str(e)}")

    return user




# ================= GET ALL USERS =================


def build_user_attendance_response(user, db: Session, today):

    today_attendance = (
        db.query(Attendance)
        .filter(Attendance.employee_id == user.id, Attendance.attendance_date == today)
        .first()
    )

    attendance_status = "Absent"
    checked_out = False
    is_present_today = False

    if today_attendance:

        attendance_status = today_attendance.status.value

        checked_out = today_attendance.check_out is not None

        is_present_today = today_attendance.check_in is not None

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "photo": user.photo,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
        "country_code": user.country_code,
        "parent_id": user.parent_id,
        "is_present_today": is_present_today,
        "attendance_status": attendance_status,
        "checked_out": checked_out,
    }


def get_all_users(db: Session, current_user):

    current_role = current_user["role"]

    today = date.today()

    # SUPER ADMIN
    if current_role == RoleEnum.SUPER_ADMIN:

        users = (
            db.query(User)
            .filter(User.role == RoleEnum.EMPLOYEE)
            .order_by(User.id.asc())
            .all()
        )

    # ORGANIZATION ADMIN
    elif current_role == RoleEnum.ORGANIZATION_ADMIN:

        users = (
            db.query(User)
            .filter(
                User.parent_id == current_user["user_id"],
                User.role == RoleEnum.EMPLOYEE,
            )
            .order_by(User.id.asc())
            .all()
        )

    # HR MANAGER
    elif current_role == RoleEnum.HR_MANAGER:

        users = (
            db.query(User)
            .filter(
                # User.organization_name ==
                # current_user["organization_name"],
                User.role
                == RoleEnum.EMPLOYEE
            )
            .order_by(User.id.asc())
            .all()
        )

    # DEPARTMENT ADMIN
    elif current_role == RoleEnum.DEPARTMENT_ADMIN:

        users = (
            db.query(User)
            .filter(
                # User.organization_name ==
                # current_user["organization_name"],
                User.department == current_user["department"],
                User.role == RoleEnum.EMPLOYEE,
            )
            .order_by(User.id.asc())
            .all()
        )
    # EMPLOYEE
    elif current_role == RoleEnum.EMPLOYEE:

        users = (
            db.query(User)
            .filter(User.id == current_user["user_id"])
            .order_by(User.id.asc())
            .all()
        )

    else:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return [build_user_attendance_response(user, db, today) for user in users]


# ================= GET USER BY ID =================


def get_user_by_id(user_id: int, db: Session, current_user):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    current_role = current_user["role"]

    # SUPER ADMIN
    if current_role == RoleEnum.SUPER_ADMIN:

        return user

    # ORGANIZATION ADMIN
    elif current_role == RoleEnum.ORGANIZATION_ADMIN:

        if user.parent_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        return user

    # HR MANAGER
    elif current_role == RoleEnum.HR_MANAGER:

        # if (
        #     current_user["organization_name"]
        #     != user.organization_name
        # ):

        #     raise HTTPException(
        #         status_code=403,
        #         detail="Access denied"
        #     )

        return user

    # DEPARTMENT ADMIN
    elif current_role == RoleEnum.DEPARTMENT_ADMIN:

        if current_user["department"] != user.department:
            raise HTTPException(status_code=403, detail="Access denied")

        return user

    # EMPLOYEE
    elif current_role == RoleEnum.EMPLOYEE:

        if current_user["user_id"] != user.id:

            raise HTTPException(status_code=403, detail="Access denied")

        return user

    raise HTTPException(status_code=403, detail="Unauthorized")


# ================= UPDATE USER =================


def update_user(user_id: int, data: UserUpdate, db: Session, current_user):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    current_role = current_user["role"]

    # SUPER ADMIN
    if current_role == RoleEnum.SUPER_ADMIN:
        pass

    # ORGANIZATION ADMIN / HR
    elif current_role in [RoleEnum.ORGANIZATION_ADMIN, RoleEnum.HR_MANAGER]:

        if user.parent_id != current_user["user_id"]:

            raise HTTPException(status_code=403, detail="Access denied")

    # DEPARTMENT ADMIN
    elif current_role == RoleEnum.DEPARTMENT_ADMIN:

        if (
            # current_user["organization"]
            # != user.organization
            # or
            current_user["department"]
            != user.department
        ):

            raise HTTPException(status_code=403, detail="Access denied")

    # EMPLOYEE
    elif current_role == RoleEnum.EMPLOYEE:

        if current_user["user_id"] != user.id:

            raise HTTPException(status_code=403, detail="Access denied")

    # ================= UPDATE FIELDS =================

    if data.name is not None:
        user.name = data.name

    if data.email is not None:
        user.email = data.email

    if data.phone is not None:
        user.phone = data.phone

    if data.photo is not None:
        user.photo = data.photo

    if data.department is not None:
        user.department = data.department

    if data.is_active is not None:
        user.is_active = data.is_active

    if data.country_code is not None:
        user.country_code = data.country_code

    # ONLY SUPER ADMIN CAN CHANGE ROLE
    if data.role is not None:

        if current_role != RoleEnum.SUPER_ADMIN:

            raise HTTPException(
                status_code=403, detail="Only super admin can change role"
            )

        user.role = data.role

    db.commit()

    db.refresh(user)

    return {"message": "User updated successfully", "data": user}


# ================= DELETE USER =================


def delete_user(user_id: int, db: Session, current_user):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    current_role = current_user["role"]

    # SUPER ADMIN
    if current_role == RoleEnum.SUPER_ADMIN:
        pass

    # ORGANIZATION ADMIN / HR
    elif current_role in [RoleEnum.ORGANIZATION_ADMIN, RoleEnum.HR_MANAGER]:

        if user.parent_id != current_user["user_id"]:

            raise HTTPException(status_code=403, detail="Access denied")

    # DEPARTMENT ADMIN
    elif current_role == RoleEnum.DEPARTMENT_ADMIN:

        if current_user["department"] != user.department:

            raise HTTPException(status_code=403, detail="Access denied")

    else:

        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        # Reset parent_id for any users managed by this user
        db.query(User).filter(User.parent_id == user.id).update({"parent_id": None})

        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        print("❌ Error deleting user:", str(e))
        raise HTTPException(
            status_code=500, detail=f"Could not delete user: {str(e)}"
        )



# ================= CURRENT USER PROFILE =================


def get_current_user_profile(db: Session, current_user):

    user = db.query(User).filter(User.id == current_user["user_id"]).first()

    if not user:

        raise HTTPException(status_code=404, detail="User not found")

    return user


def search_users(
    search: Optional[str] = None,
    status: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=None,
):

    query = db.query(User).filter(User.role == RoleEnum.EMPLOYEE)

    if current_user:

        current_role = current_user["role"]

        if current_role == RoleEnum.ORGANIZATION_ADMIN:

            query = query.filter(User.parent_id == current_user["user_id"])

        elif current_role == RoleEnum.DEPARTMENT_ADMIN:

            query = query.filter(User.department == current_user["department"])

        elif current_role == RoleEnum.EMPLOYEE:

            query = query.filter(User.id == current_user["user_id"])

    # SEARCH FILTER
    if search:

        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.phone.ilike(f"%{search}%"),
                cast(User.role, String).ilike(f"%{search}%"),
            ),
            User.role == RoleEnum.EMPLOYEE,
        )

    # STATUS FILTER
    if status:

        if status == "active":
            query = query.filter(User.is_active == True)

        elif status == "inactive":
            query = query.filter(User.is_active == False)

    # DEPARTMENT FILTER
    if department:

        query = query.filter(User.department == department)

    users = query.order_by(User.id.asc()).all()

    today = date.today()

    return [build_user_attendance_response(user, db, today) for user in users]
