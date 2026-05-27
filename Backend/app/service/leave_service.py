from sqlalchemy import String, or_, and_
from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.models.leave_model import (
    Leave,
    LeaveStatus,
)

from app.models.user import (
    User,
    RoleEnum,
)

# ====================================
# APPLY LEAVE
# ====================================


def apply_leave(db: Session, employee_id: int, leave_data):

    employee = (
        db.query(User)
        .filter(User.id == employee_id, User.role == RoleEnum.EMPLOYEE)
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if leave_data.start_date > leave_data.end_date:
        raise HTTPException(
            status_code=400, detail="Start date cannot be greater than end date"
        )

    overlapping = (
        db.query(Leave)
        .filter(
            and_(
                Leave.employee_id == employee_id,
                Leave.status.in_(
                    [
                        LeaveStatus.pending,
                        LeaveStatus.approved,
                    ]
                ),
                Leave.start_date <= leave_data.end_date,
                Leave.end_date >= leave_data.start_date,
            )
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=400, detail="Leave already exists for selected dates"
        )

    total_days = (leave_data.end_date - leave_data.start_date).days + 1

    leave = Leave(
        employee_id=employee_id,
        leave_type=leave_data.leave_type,
        reason=leave_data.reason,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        total_days=total_days,
        status=LeaveStatus.pending,
    )

    db.add(leave)

    db.commit()

    db.refresh(leave)

    return leave


# ====================================
# APPROVE LEAVE
# ====================================


def approve_leave(db: Session, leave_id: int, current_user):

    allowed_roles = ["organization_admin", "hr_manager"]

    if current_user["role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="Only admin can approve leave")

    leave = db.query(Leave).filter(Leave.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Leave already processed")

    leave.status = LeaveStatus.approved

    leave.approved_by = current_user["user_id"]

    db.commit()

    db.refresh(leave)

    return leave


# ====================================
# REJECT LEAVE
# ====================================


def reject_leave(db: Session, leave_id: int, current_user):

    allowed_roles = ["organization_admin", "hr_manager"]

    if current_user["role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="Only admin can reject leave")

    leave = db.query(Leave).filter(Leave.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Leave already processed")

    leave.status = LeaveStatus.rejected

    leave.approved_by = current_user["user_id"]

    db.commit()

    db.refresh(leave)

    return leave


# ====================================
# EMPLOYEE LEAVES
# ====================================


def get_employee_leaves(db: Session, current_user):

    return (
        db.query(Leave)
        .filter(Leave.employee_id == current_user["user_id"])
        .order_by(Leave.created_at.desc())
        .all()
    )


# ====================================
# ALL LEAVES
# ====================================


def get_all_leaves(db: Session, current_user, search=None, status=None):

    allowed = ["organization_admin", "hr_manager"]

    if current_user["role"] not in allowed:
        raise HTTPException(status_code=403, detail="Unauthorized")

    query = db.query(Leave).join(User, User.id == Leave.employee_id)

    if current_user["role"] == "organization_admin":
        query = query.filter(User.parent_id == current_user["user_id"])

    if search:
        search_value = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_value),
                User.email.ilike(search_value),
                Leave.leave_type.cast(String).ilike(search_value),
            )
        )

    if status:
        try:
            leave_status = LeaveStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid leave status")

        query = query.filter(Leave.status == leave_status)

    return query.order_by(Leave.created_at.desc()).all()


def get_leave_notification_count(db: Session, current_user):
    role = current_user["role"]
    user_id = current_user["user_id"]

    if role == "employee":
        return (
            db.query(Leave)
            .filter(
                Leave.employee_id == user_id,
                Leave.status.in_([LeaveStatus.approved, LeaveStatus.rejected]),
            )
            .count()
        )

    if role in ["organization_admin", "hr_manager"]:
        query = (
            db.query(Leave)
            .join(User, User.id == Leave.employee_id)
            .filter(Leave.status == LeaveStatus.pending)
        )

        if role == "organization_admin":
            query = query.filter(User.parent_id == user_id)

        return query.count()

    return 0


# ====================================
# LEAVE BY ID
# ====================================


def get_leave_by_id(db: Session, leave_id: int, current_user):

    leave = db.query(Leave).filter(Leave.id == leave_id).first()

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    role = current_user["role"]

    user_id = current_user["user_id"]

    # Employee → own leave only
    if role == "employee":

        if leave.employee_id != user_id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Admin / HR → only approved by them
    elif role in ["organization_admin", "hr_manager"]:

        if role == "organization_admin":
            employee = db.query(User).filter(User.id == leave.employee_id).first()

            if not employee or employee.parent_id != user_id:
                raise HTTPException(status_code=403, detail="Access denied")

    else:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return leave


def delete_leave(db: Session, leave_id: int, current_user):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Only employee can delete leave")

    leave = (
        db.query(Leave)
        .filter(Leave.id == leave_id, Leave.employee_id == current_user["user_id"])
        .first()
    )

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    db.delete(leave)
    db.commit()

    return True
