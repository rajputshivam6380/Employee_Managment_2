# app/routes/user_routes.py

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db

from app.auth.dependencies import get_current_user

from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse

from app.models.user import RoleEnum


from app.models.user import User
from app.auth.password import ChangePassword
from app.auth.utils import hash_password, verify_password


from app.service.user_service import (
    create_user,
    get_all_users,
    get_user_by_id,
    update_user,
    delete_user,
    get_current_user_profile,
    search_users,
)

from app.service.email_service import send_test_email

user_router = APIRouter(prefix="/users", tags=["Users"])


# ================= CURRENT USER PROFILE =================


@user_router.get("/me", response_model=UserResponse)
def my_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    return get_current_user_profile(db, current_user)


# ================= CREATE USER =================


@user_router.post("/add-user", response_model=UserResponse)
async def add_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return await create_user(db, data, current_user)


# ================= GET ALL USERS =================


@user_router.get("/all", response_model=list[UserResponse])
def get_all_users_route(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    return get_all_users(db, current_user)


# ================ FOR SEARCHING OPERATION===================
@user_router.get("/search", response_model=list[UserResponse])
def search_employee(
    search: str = "",
    status: str = "",
    department: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return search_users(
        search=search,
        status=status,
        department=department,
        db=db,
        current_user=current_user,
    )


# ================= GET USER BY ID =================


@user_router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    return get_user_by_id(user_id, db, current_user)



@user_router.put("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = (
        db.query(User)
        .filter(User.id == current_user["user_id"])
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not verify_password(data.old_password, user.password):
        raise HTTPException(
            status_code=400,
            detail="Old password is incorrect",
        )

    user.password = hash_password(data.new_password)

    db.commit()
    db.refresh(user)

    return {
        "message": "Password changed successfully"
    }


# ================= UPDATE USER =================


@user_router.put("/{user_id}", response_model=UserResponse)
def update_user_data(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    result = update_user(user_id, data, db, current_user)

    return result["data"]


# ================= PATCH USER =================


@user_router.patch("/{user_id}", response_model=UserResponse)
def patch_user_data(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    result = update_user(user_id, data, db, current_user)

    return result["data"]


# ================= DELETE USER =================


@user_router.delete("/{user_id}")
def remove_user(
    user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    return delete_user(user_id, db, current_user)


@user_router.get("/employee/profile")
def employee_profile(current_user: User = Depends(get_current_user)):

    if current_user["role"] != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Access denied")

    return current_user


# ================= TEST EMAIL ENDPOINT =================


@user_router.post("/test-email/{recipient_email}")
async def test_email(
    recipient_email: str,
    current_user=Depends(get_current_user),
):
    """
    Test email endpoint - sends a test email to verify SMTP configuration
    Only accessible to authenticated users (mainly for admins to test)
    """
    try:
        await send_test_email(recipient_email)
        return {
            "success": True,
            "message": f"Test email sent successfully to {recipient_email}",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to send test email: {str(e)}"
        )
