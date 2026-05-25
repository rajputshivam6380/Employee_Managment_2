from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query

)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.project_model import Project

from app.models.user import User

from app.schemas.project_schema import ProjectCreate,ProjectResponse

from app.auth.dependencies import require_roles

from app.models.enums import RoleEnum

from app.models.project_model import PriorityEnum,StatusEnum

import shutil

import os

import json

from uuid import uuid4

project_router= APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@project_router.post("/assign-project")
async def assign_project(

    title: str = Form(...),

    description: str = Form(None),

    assigned_to: str = Form(...),

    deadline: str = Form(...),

    priority: PriorityEnum = Form(...),

    status: StatusEnum = Form(...),

    file: UploadFile = File(None),

    db: Session = Depends(get_db),

    current_user = Depends(
        require_roles([
            RoleEnum.ORGANIZATION_ADMIN
        ])
    )
):

    # ================= CONVERT STRING TO LIST =================
    assigned_to = json.loads(assigned_to)

    # ================= CHECK EMPLOYEE =================
    employees = db.query(User).filter(
        User.id.in_(assigned_to)
    ).all()

    if len(employees) != len(assigned_to):

        raise HTTPException(
            status_code=404,
            detail="One or more employees not found"
        )

    for emp in employees:

        if emp.role != RoleEnum.EMPLOYEE:

            raise HTTPException(
                status_code=400,
                detail="Project can only be assigned to employees"
            )

    # ================= FILE UPLOAD =================
    file_path = None

    if file:

        # ALLOWED FILE TYPES
        allowed_extensions = [
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
            ".jpg",
            ".jpeg",
            ".png",
            ".zip",
            ".txt"
        ]

        # GET FILE EXTENSION
        file_ext = os.path.splitext(
            file.filename
        )[1].lower()

        # VALIDATE FILE TYPE
        if file_ext not in allowed_extensions:

            raise HTTPException(
                status_code=400,
                detail="File type not allowed"
            )

        # RANDOM FILE NAME
        random_number = str(uuid4())[:8]

        filename = (
            f"{random_number}_{file.filename}"
        )

        # SAVE PATH
        save_path = os.path.join(
            "uploads",
            filename
        )
        if file:
            os.makedirs("uploads", exist_ok=True)
        # SAVE FILE
        with open(save_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        file_path = save_path

    # ================= CREATE PROJECT =================
    project = Project(

        title=title,

        description=description,

        assigned_to=assigned_to,

        priority=priority,

        status=status,

        deadline=deadline,

        created_by=current_user["user_id"],

        file_path=file_path
    )

    db.add(project)

    db.commit()

    db.refresh(project)

    return {

        "message": "Project assigned successfully",

        "project": {

            "id": project.id,

            "title": project.title,

            "description": project.description,

            "assigned_to": project.assigned_to,

            "file_path": project.file_path
        }
    }














# @project_router.post("/assign-project")
# def assign_project(

#     data: ProjectCreate,

#     db: Session = Depends(get_db),

#     current_user = Depends(
#         require_roles([
#             RoleEnum.ORGANIZATION_ADMIN
#         ])
#     )
# ):

#     # ================= CHECK EMPLOYEE =================
#     employees = db.query(User).filter(
#     User.id.in_(data.assigned_to)
# ).all()

#     if len(employees) != len(data.assigned_to):
#         raise HTTPException(
#         status_code=404,
#         detail="One or more employees not found"
#     )

#     for emp in employees:
#         if emp.role != RoleEnum.EMPLOYEE:
#             raise HTTPException(
#             status_code=400,
#             detail="Project can only be assigned to employees"
#         )

#     # ================= CREATE PROJECT =================
#     project = Project(

#         title=data.title,

#         description=data.description,

#         assigned_to=data.assigned_to,

#         # organization admin id
#         # organization_id=current_user["user_id"],


#         # created_at = data.created_at,

#         priority= data.priority,

#         status= data.status,

#         deadline = data.deadline,


#         # who assigned project
#         created_by=current_user["user_id"]
#     )

#     db.add(project)

#     db.commit()

#     db.refresh(project)

#     return {

#         "message": "Project assigned successfully",

#         "project": {
#             "id": project.id,
#             "title": project.title,
#             "description": project.description,
#             "assigned_to": project.assigned_to
#         }
#     }


@project_router.get("/my-projects")
def get_my_project(
    db: Session = Depends(get_db),
    current_user = Depends(
        require_roles([
            RoleEnum.EMPLOYEE
        ])
    )
):

    projects = db.query(Project).all()

    final_projects = []

    for project in projects:

        if current_user["user_id"] in project.assigned_to:

            employees = db.query(User).filter(
                User.id.in_(project.assigned_to)
            ).all()

            final_projects.append({
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "priority": project.priority,
                "status": project.status,
                "deadline": project.deadline,
                "file_path": project.file_path,
                "employees": employees
            })

    return final_projects


@project_router.get("/all"
                    # , response_model=list[ProjectResponse]
                    )
def get_projects(
    db: Session = Depends(get_db),
    current_user = Depends(
        require_roles([
            RoleEnum.ORGANIZATION_ADMIN
        ])
    )
):

    projects = db.query(Project).all()

    final_projects = []

    for project in projects:

        employees = db.query(User).filter(
            User.id.in_(project.assigned_to)
        ).all()

        final_projects.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "priority": project.priority,
            "status": project.status,
            "deadline": project.deadline,
            "file_path": project.file_path,
            "created_at": project.created_at,
            "employees": employees
        })

    return final_projects








@project_router.get("/filter-by-department")
def filter_by_department(
    departments: str = Query(...),
    db: Session = Depends(get_db),
    current_user = Depends(
        require_roles([
            RoleEnum.ORGANIZATION_ADMIN
        ])
    )
):

    # convert string to list
    department_list = departments.split(",")

    employees = db.query(User).filter(
        User.department.in_(department_list),
        User.role == RoleEnum.EMPLOYEE
    ).all()

    return employees


@project_router.delete("/delete/{project_id}")
def delete_task(
        project_id:int,
        db:Session=Depends(get_db),
        current_user=Depends(
            require_roles([
            RoleEnum.ORGANIZATION_ADMIN
            ])
        )
):
    
    project=db.query(Project).filter(
        Project.id==project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
    if project.file_path and os.path.exists(project.file_path):
        os.remove(project.file_path)

    db.delete(project)
    db.commit()

    return {
        "Message" : "Project deleted succesfully"
    }
    


@project_router.put("/update-status/{project_id}")
def update_project_status(
    project_id:int,
    status:StatusEnum=Form(...),
    db:Session=Depends(get_db),
    current_user=Depends(
        require_roles([
            RoleEnum.EMPLOYEE
        ])
    )
):
    
    project=db.query(Project).filter(
        Project.id==project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
    if current_user["user_id"] not in project.assigned_to:
        raise HTTPException(
            status_code=403,
            detail="You arenot assigned to this project"
        )
    
    project.status=status

    db.commit()

    db.refresh(project)


    return {
    "message": "Project status updated successfully",
    "status": project.status
}