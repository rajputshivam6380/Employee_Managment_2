# app/routes/user_routes.py

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.auth.dependencies import (
    get_current_user
)

from app.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserResponse
)

from app.models.user import RoleEnum



from app.models.user import User

from app.service.user_service import (

    create_user,

    get_all_users,

    get_user_by_id,

    update_user,

    delete_user,

    get_current_user_profile,

    search_users
)

user_router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ================= CURRENT USER PROFILE =================

@user_router.get(
    "/me",
    response_model=UserResponse
)
def my_profile(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    return get_current_user_profile(
        db,
        current_user
    )


# ================= CREATE USER =================

@user_router.post(
    "/add-user",
    response_model=UserResponse
)
async def add_user(

    data: UserCreate,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    return await create_user(
        db,
        data,
        current_user
    )


# ================= GET ALL USERS =================

@user_router.get(
    "/all",
    response_model=list[UserResponse]
)
def get_all_users_route(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    return get_all_users(
        db,
        current_user
    )






# ================ FOR SEARCHING OPERATION===================
@user_router.get(
    "/search",
    response_model=list[UserResponse]
)
def search_employee(
    search: str = "",
    status: str = "",
    department: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return search_users(
    search=search,
    status=status,
    department=department,
    db=db,
    current_user=current_user,
)









# ================= GET USER BY ID =================

@user_router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(

    user_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    return get_user_by_id(
        user_id,
        db,
        current_user
    )


# ================= UPDATE USER =================

@user_router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user_data(

    user_id: int,

    data: UserUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    result = update_user(
        user_id,
        data,
        db,
        current_user
    )

    return result["data"]


# ================= PATCH USER =================

@user_router.patch(
    "/{user_id}",
    response_model=UserResponse
)
def patch_user_data(

    user_id: int,

    data: UserUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    result = update_user(
        user_id,
        data,
        db,
        current_user
    )

    return result["data"]


# ================= DELETE USER =================

@user_router.delete(
    "/{user_id}"
)
def remove_user(

    user_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)
):

    return delete_user(
        user_id,
        db,
        current_user
    )






@user_router.get("/employee/profile")
def employee_profile(
    current_user: User = Depends(get_current_user)
):

    if current_user["role"] != RoleEnum.EMPLOYEE:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return current_user
