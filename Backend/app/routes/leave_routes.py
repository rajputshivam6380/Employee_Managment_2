# ==========================================
# leave_routes.py
# ==========================================

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.auth.dependencies import get_current_user

from app.schemas.leave_schema import LeaveCreate, LeaveResponse

from app.service.leave_service import (
    apply_leave,
    approve_leave,
    reject_leave,
    get_employee_leaves,
    get_all_leaves,
    get_leave_by_id,
    get_leave_notification_count,
    delete_leave,
)

leave_router = APIRouter(prefix="/leave", tags=["Leave"])


# ==========================================
# APPLY LEAVE
# Employee only
# ==========================================


@leave_router.post("/apply", response_model=LeaveResponse)
def apply_leave_route(
    leave_data: LeaveCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return apply_leave(
        db=db, employee_id=current_user["user_id"], leave_data=leave_data
    )


# ==========================================
# APPROVE LEAVE
# Admin / HR only
# ==========================================


@leave_router.put("/approve/{leave_id}", response_model=LeaveResponse)
def approve_leave_route(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return approve_leave(db=db, leave_id=leave_id, current_user=current_user)


# ==========================================
# REJECT LEAVE
# Admin / HR only
# ==========================================


@leave_router.put("/reject/{leave_id}", response_model=LeaveResponse)
def reject_leave_route(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return reject_leave(db=db, leave_id=leave_id, current_user=current_user)


# ==========================================
# MY LEAVES
# Employee only
# ==========================================


@leave_router.get("/my-leaves", response_model=list[LeaveResponse])
def employee_leaves_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return get_employee_leaves(db=db, current_user=current_user)


# ==========================================
# GET ALL LEAVES
# Admin only
# ==========================================


@leave_router.get("/all", response_model=list[LeaveResponse])
def all_leaves_route(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return get_all_leaves(
        db=db, current_user=current_user, search=search, status=status
    )


@leave_router.get("/notification-count")
def leave_notification_count_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return {"count": get_leave_notification_count(db=db, current_user=current_user)}


# ==========================================
# GET SINGLE LEAVE
# ==========================================


@leave_router.get("/{leave_id}", response_model=LeaveResponse)
def leave_by_id_route(
    leave_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    return get_leave_by_id(db=db, leave_id=leave_id, current_user=current_user)


@leave_router.delete("/{leave_id}")
def delete_leave_route(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    delete_leave(db=db, leave_id=leave_id, current_user=current_user)

    return {"message": "Leave deleted successfully"}
