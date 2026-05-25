
# from fastapi import ( APIRouter,Depends)

# from sqlalchemy.orm import Session

# from typing import List

# from app.database import get_db

# from app.auth.dependencies import get_current_user

# from app.schemas.user_schema import (
#     UserCreate,
#     UserUpdate,
#     UserResponse
# )

# from app.service.organization_service import (

#     create_organization_admin,

#     get_all_organizations,

#     get_organization_by_id,

#     update_organization,

#     delete_organization,

#     get_organization_users
# )


# organization_router = APIRouter(
#     prefix="/organizations",
#     tags=["Organizations"]
# )


# # ================= CREATE ORGANIZATION ADMIN =================

# @organization_router.post(
#     "/create",
#     response_model=UserResponse
# )
# def create_org(

#     data: UserCreate,

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     return create_organization_admin(
#         db,
#         data,
#         current_user
#     )["data"]


# # ================= GET ALL ORGANIZATIONS =================

# @organization_router.get(
#     "/all",
#     response_model=List[UserResponse]
# )
# def get_orgs(

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     return get_all_organizations(
#         db,
#         current_user
#     )


# # ================= GET ORGANIZATION BY ID =================

# @organization_router.get(
#     "/{organization_id}",
#     response_model=UserResponse
# )
# def get_org(

#     organization_id: int,

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     return get_organization_by_id(
#         organization_id,
#         db,
#         current_user
#     )


# # ================= UPDATE ORGANIZATION =================

# @organization_router.put(
#     "/{organization_id}",
#     response_model=UserResponse
# )
# def update_org(

#     organization_id: int,

#     data: UserUpdate,

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     result = update_organization(
#         organization_id,
#         data,
#         db,
#         current_user
#     )

#     return result["data"]


# # ================= PATCH ORGANIZATION =================

# @organization_router.patch(
#     "/{organization_id}",
#     response_model=UserResponse
# )
# def patch_org(

#     organization_id: int,

#     data: UserUpdate,

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     result = update_organization(
#         organization_id,
#         data,
#         db,
#         current_user
#     )

#     return result["data"]


# # ================= DELETE ORGANIZATION =================

# @organization_router.delete(
#     "/{organization_id}"
# )
# def delete_org(

#     organization_id: int,

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     return delete_organization(
#         organization_id,
#         db,
#         current_user
#     )


# # ================= GET ORGANIZATION USERS =================

# @organization_router.get(
#     "/{organization_id}/users",
#     response_model=List[UserResponse]
# )
# def organization_users(

#     organization_id: int,

#     db: Session = Depends(get_db),

#     current_user=Depends(get_current_user)
# ):

#     return get_organization_users(
#         organization_id,
#         db,
#         current_user
#     )