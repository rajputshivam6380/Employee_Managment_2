# ==========================================
# leave_routes.py
# ==========================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.leave_schema import LeaveCreate, LeaveResponse


from app.auth.dependencies import get_current_user

# from app.services.leave_service import (
#     apply_leave,
#     approve_leave,
#     reject_leave,
#     get_employee_leaves,
#     get_all_leaves,
#     get_leave_by_id
# )


from app.service.leave_service import (
    apply_leave,
    approve_leave,
    reject_leave,
    get_employee_leaves,
    get_all_leaves,
    get_leave_by_id,
)

leave_router = APIRouter(prefix="/leave", tags=["Leave"])


# ==========================================
# Apply Leave
# ==========================================


@leave_router.post("/apply", response_model=LeaveResponse)
def apply_leave_route(
    leave_data: LeaveCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return apply_leave(
        db=db, leave_data=leave_data, employee_id=current_user["user_id"]
    )


# ==========================================
# Approve Leave
# ==========================================


@leave_router.put("/approve/{leave_id}/{approved_by}", response_model=LeaveResponse)
def approve_leave_route(leave_id: int, approved_by: int, db: Session = Depends(get_db)):

    return approve_leave(db=db, leave_id=leave_id, approved_by=approved_by)


# ==========================================
# Reject Leave
# ==========================================


@leave_router.put("/reject/{leave_id}/{approved_by}", response_model=LeaveResponse)
def reject_leave_route(leave_id: int, approved_by: int, db: Session = Depends(get_db)):

    return reject_leave(db=db, leave_id=leave_id, approved_by=approved_by)


# ==========================================
# Get Employee Leaves
# ==========================================


@leave_router.get("/employee/{employee_id}", response_model=list[LeaveResponse])
def employee_leaves(employee_id: int, db: Session = Depends(get_db)):

    return get_employee_leaves(db=db, employee_id=employee_id)


# ==========================================
# Get All Leaves
# ==========================================


@leave_router.get("/all", response_model=list[LeaveResponse])
def all_leaves(db: Session = Depends(get_db)):

    return get_all_leaves(db=db)


# ==========================================
# Get Leave By ID
# ==========================================


@leave_router.get("/{leave_id}", response_model=LeaveResponse)
def leave_by_id(leave_id: int, db: Session = Depends(get_db)):

    return get_leave_by_id(db=db, leave_id=leave_id)
