from sqlalchemy.orm import Session
from sqlalchemy import and_

from datetime import date

from app.models.leave_model import Leave,LeaveStatus

from app.models.user import User

from fastapi import HTTPException



def apply_leave(
        db:Session,
        employee_id:int,
        leave_data
):
    employee=db.query(User).filter(User.id==employee_id).first()

    if not employee:
        raise HTTPException(
    status_code=404,
    detail="Employee not found"
)
    if leave_data.start_date>leave_data.end_date:
        raise HTTPException(
    status_code=400,
    detail="Date cant greter than end date"
)
    

    existing_leave= db.query(Leave).filter(
        and_(
            Leave.employee_id==employee_id,
            Leave.start_date<=leave_data.end_date,
            Leave.end_date>=leave_data.start_date
        )
    ).first()


    if existing_leave:
        raise HTTPException(
    status_code=400,
    detail="Leave already applied for selected dates"
)
    total_days=(
        leave_data.end_date-leave_data.start_date
    ).days+1


    leave=Leave(
        employee_id=employee_id,
        leave_type=leave_data.leave_type,
        reason=leave_data.reason,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        total_days=total_days,
        status=LeaveStatus.pending
    )


    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


def approve_leave(
        db:Session,
        leave_id:int,
        approved_by:int
):
    leave=db.query(Leave).filter(
        Leave.id==leave_id
    ).first()

    if not leave:
        raise HTTPException(
    status_code=400,
    detail="Leave not found"
)
    
    if leave.status==LeaveStatus.approved:
        raise HTTPException(
    status_code=400,
    detail="Leave already approved"
)
    
    leave.status=LeaveStatus.approved
    leave.approved_by=approved_by

    db.commit()
    db.refresh(leave)

    return leave


def reject_leave(
        db:Session,
        leave_id:int,
        approved_by:int
):
    leave=db.query(Leave).filter(
        Leave.id==leave_id
    ).first()


    if not leave:
        raise HTTPException(
    status_code=400,
    detail="Leave not found"
)
    
    if leave.status==LeaveStatus.rejected:
        raise HTTPException(
    status_code=400,
    detail="Leave already rejected"
)
    

    leave.status=LeaveStatus.rejected
    leave.approved_by=approved_by


    db.commit()
    db.refresh(leave)

    return leave


def get_employee_leaves(
        db:Session,
        employee_id:int
):
    leaves=db.query(Leave).filter(
        Leave.employee_id==employee_id
    ).order_by(
        Leave.created_at.desc()
    ).all()


    return leaves


def get_all_leaves(
        db:Session
):
    leaves=db.query(Leave).order_by(
        Leave.created_at.desc()
    ).all()

    return leaves

def get_leave_by_id(
        db:Session,
        leave_id:int
):
    
    leave=db.query(Leave).filter(
        Leave.id==leave_id
    ).first()

    if not leave:
        raise HTTPException(
    status_code=404,
    detail="Leave not found"
)
    
    return leave
