# # app/service/department_service.py

# from sqlalchemy.orm import Session
# from fastapi import HTTPException

# from app.models.department import Department
# from app.models.organization import Organization
# from app.models.user import User
# from app.models.enums import RoleEnum

# from app.schemas.department_schema import (
#     DepartmentCreate,
#     DepartmentUpdate
# )


# # CREATE DEPARTMENT
# def create_department(
#     db: Session,
#     data: DepartmentCreate,
#     current_user
# ):

#     organization = db.query(Organization).filter(
#         Organization.id == data.organization_id
#     ).first()



    

#     if not organization:
#         raise HTTPException(
#             status_code=404,
#             detail="Organization not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         if current_user["organization_id"] != data.organization_id:
#             raise HTTPException(
#                 status_code=403,
#                 detail="You can create only in your organization"
#             )

#     else:
#         raise HTTPException(
#             status_code=403,
#             detail="Unauthorized"
#         )

#     new_department = Department(
#         name=data.name,
#         organization_id=data.organization_id
#     )

#     db.add(new_department)
#     db.commit()
#     db.refresh(new_department)

#     return new_department


# # GET ALL DEPARTMENTS
# def get_all_departments(
#     db: Session,
#     current_user
# ):

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:

#         departments = db.query(Department).all()

#         return departments

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         departments = db.query(Department).filter(
#             Department.organization_id ==
#             current_user["organization_id"]
#         ).all()

#         return departments

#     # DEPARTMENT ADMIN
#     elif current_user["role"] == RoleEnum.department_admin:

#         departments = db.query(Department).filter(
#             Department.id ==
#             current_user["department_id"]
#         ).all()

#         return departments

#     raise HTTPException(
#         status_code=403,
#         detail="Unauthorized"
#     )


# # GET DEPARTMENT BY ID
# def get_department_by_id(
#     dept_id: int,
#     db: Session,
#     current_user
# ):

#     department = db.query(Department).filter(
#         Department.id == dept_id
#     ).first()

#     if not department:
#         raise HTTPException(
#             status_code=404,
#             detail="Department not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:
#         return department

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         if (
#             current_user["organization_id"]
#             != department.organization_id
#         ):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#         return department

#     # DEPARTMENT ADMIN
#     elif current_user["role"] == RoleEnum.department_admin:

#         if (
#             current_user["department_id"]
#             != department.id
#         ):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#         return department

#     raise HTTPException(
#         status_code=403,
#         detail="Unauthorized"
#     )


# # UPDATE DEPARTMENT
# def update_department(
#     dept_id: int,
#     data: DepartmentUpdate,
#     db: Session,
#     current_user
# ):

#     department = db.query(Department).filter(
#         Department.id == dept_id
#     ).first()

#     if not department:
#         raise HTTPException(
#             status_code=404,
#             detail="Department not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         if (
#             current_user["organization_id"]
#             != department.organization_id
#         ):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#     # DEPARTMENT ADMIN
#     elif current_user["role"] == RoleEnum.department_admin:

#         if (
#             current_user["department_id"]
#             != department.id
#         ):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#     else:
#         raise HTTPException(
#             status_code=403,
#             detail="Unauthorized"
#         )

#     if data.name is not None:
#         department.name = data.name

#     db.commit()
#     db.refresh(department)

#     return {
#         "message": "Department updated successfully",
#         "data": department
#     }


# # DELETE DEPARTMENT
# def delete_department(
#     dept_id: int,
#     db: Session,
#     current_user
# ):

#     department = db.query(Department).filter(
#         Department.id == dept_id
#     ).first()

#     if not department:
#         raise HTTPException(
#             status_code=404,
#             detail="Department not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         if (
#             current_user["organization_id"]
#             != department.organization_id
#         ):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#     else:
#         raise HTTPException(
#             status_code=403,
#             detail="Unauthorized"
#         )

#     db.delete(department)
#     db.commit()

#     return {
#         "message": "Department deleted successfully"
#     }


# # GET DEPARTMENT USERS
# def get_department_users(
#     dept_id: int,
#     db: Session,
#     current_user
# ):

#     department = db.query(Department).filter(
#         Department.id == dept_id
#     ).first()

#     if not department:
#         raise HTTPException(
#             status_code=404,
#             detail="Department not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         if (
#             current_user["organization_id"]
#             != department.organization_id
#         ):
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#     # DEPARTMENT ADMIN
#     elif current_user["role"] == RoleEnum.department_admin:

#         if (
#             current_user["department_id"]
#             != department.id
#         ):
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
#         User.department_id == dept_id
#     ).all()

#     return users


# # GET DEPARTMENTS BY ORGANIZATION
# def get_departments_by_organization(
#     org_id: int,
#     db: Session,
#     current_user
# ):

#     organization = db.query(Organization).filter(
#         Organization.id == org_id
#     ).first()

#     if not organization:
#         raise HTTPException(
#             status_code=404,
#             detail="Organization not found"
#         )

#     # SUPER ADMIN
#     if current_user["role"] == RoleEnum.super_admin:
#         pass

#     # ORGANIZATION ADMIN
#     elif current_user["role"] == RoleEnum.organization_admin:

#         if current_user["organization_id"] != org_id:
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access denied"
#             )

#     else:
#         raise HTTPException(
#             status_code=403,
#             detail="Unauthorized"
#         )

#     departments = db.query(Department).filter(
#         Department.organization_id == org_id
#     ).all()

#     return departments