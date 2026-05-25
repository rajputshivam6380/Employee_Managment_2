# # app/service/organization_service.py

# from sqlalchemy.orm import Session

# from fastapi import HTTPException

# from app.models.user import User
# from app.models.enums import RoleEnum

# from app.auth.utils import hash_password


# # ================= CREATE ORGANIZATION ADMIN =================

# def create_organization_admin(
#     db: Session,
#     data,
#     current_user
# ):

#     # ONLY SUPER ADMIN
#     if current_user["role"] != RoleEnum.SUPER_ADMIN:

#         raise HTTPException(
#             status_code=403,
#             detail="Only super admin can create organization admin"
#         )

#     existing = db.query(User).filter(
#         User.email == data.email
#     ).first()

#     if existing:

#         raise HTTPException(
#             status_code=400,
#             detail="Email already exists"
#         )

#     new_admin = User(

#         name=data.name,

#         email=data.email,

#         password=hash_password(data.password),

#         phone=data.phone,

#         role=RoleEnum.ORGANIZATION_ADMIN,

#         organization_name=data.organization_name,

#         parent_id=current_user["id"]
#     )

#     db.add(new_admin)

#     db.commit()

#     db.refresh(new_admin)

#     return {
#         "message": "Organization Admin Created Successfully",
#         "data": new_admin
#     }


# # ================= GET ALL ORGANIZATIONS =================

# def get_all_organizations(
#     db: Session,
#     current_user
# ):

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.SUPER_ADMIN:

#         organizations = db.query(User).filter(
#             User.role == RoleEnum.ORGANIZATION_ADMIN
#         ).all()

#         return organizations

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.ORGANIZATION_ADMIN:

#         organization = db.query(User).filter(
#             User.id == current_user["id"]
#         ).all()

#         return organization

#     raise HTTPException(
#         status_code=403,
#         detail="Unauthorized"
#     )


# # ================= GET ORGANIZATION BY ID =================

# def get_organization_by_id(
#     user_id: int,
#     db: Session,
#     current_user
# ):

#     organization = db.query(User).filter(
#         User.id == user_id,
#         User.role == RoleEnum.ORGANIZATION_ADMIN
#     ).first()

#     if not organization:

#         raise HTTPException(
#             status_code=404,
#             detail="Organization not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.SUPER_ADMIN:

#         return organization

#     # ORGANIZATION ADMIN
#     if current_user["role"] == RoleEnum.ORGANIZATION_ADMIN:

#         if current_user["id"] != user_id:

#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#         return organization

#     raise HTTPException(
#         status_code=403,
#         detail="Unauthorized"
#     )


# # ================= UPDATE ORGANIZATION =================

# def update_organization(
#     user_id: int,
#     data,
#     db: Session,
#     current_user
# ):

#     organization = db.query(User).filter(
#         User.id == user_id,
#         User.role == RoleEnum.ORGANIZATION_ADMIN
#     ).first()

#     if not organization:

#         raise HTTPException(
#             status_code=404,
#             detail="Organization not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.SUPER_ADMIN:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.ORGANIZATION_ADMIN:

#         if current_user["id"] != user_id:

#             raise HTTPException(
#                 status_code=403,
#                 detail="You can update only your organization"
#             )

#     else:

#         raise HTTPException(
#             status_code=403,
#             detail="Unauthorized"
#         )

#     if data.name is not None:
#         organization.name = data.name

#     if data.email is not None:
#         organization.email = data.email

#     if data.phone is not None:
#         organization.phone = data.phone

#     if data.organization_name is not None:
#         organization.organization_name = data.organization_name

#     db.commit()

#     db.refresh(organization)

#     return {
#         "message": "Organization updated successfully",
#         "data": organization
#     }


# # ================= DELETE ORGANIZATION =================

# def delete_organization(
#     user_id: int,
#     db: Session,
#     current_user
# ):

#     if current_user["role"] != RoleEnum.SUPER_ADMIN:

#         raise HTTPException(
#             status_code=403,
#             detail="Only super admin can delete organization"
#         )

#     organization = db.query(User).filter(
#         User.id == user_id,
#         User.role == RoleEnum.ORGANIZATION_ADMIN
#     ).first()

#     if not organization:

#         raise HTTPException(
#             status_code=404,
#             detail="Organization not found"
#         )

#     db.delete(organization)

#     db.commit()

#     return {
#         "message": "Organization deleted successfully"
#     }


# # ================= GET ORGANIZATION USERS =================

# def get_organization_users(
#     org_admin_id: int,
#     db: Session,
#     current_user
# ):

#     organization = db.query(User).filter(
#         User.id == org_admin_id,
#         User.role == RoleEnum.ORGANIZATION_ADMIN
#     ).first()

#     if not organization:

#         raise HTTPException(
#             status_code=404,
#             detail="Organization not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.SUPER_ADMIN:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.ORGANIZATION_ADMIN:

#         if current_user["id"] != org_admin_id:

#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#     else:

#         raise HTTPException(
#             status_code=403,
#             detail="Unauthorized"
#         )

#     users = db.query(User).filter(
#         User.parent_id == org_admin_id
#     ).all()

#     return users