# app/main.py

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import os

from app.routes.auth_routes import auth_router
from app.routes.user_routes import user_router

# from app.routes.organization_routes import organization_router
# from app.routes.department_routes import department_router
from app.routes.role_routes import role_router
from app.routes.project_routes import project_router
from app.routes.attendence_router import attendence_router
from app.routes.leave_routes import leave_router

app = FastAPI(title="Employee Management System")


# CREATE UPLOADS FOLDER
if not os.path.exists("uploads"):
    os.makedirs("uploads")


# STATIC FILES
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ROUTES
app.include_router(auth_router)

app.include_router(role_router)

# app.include_router(organization_router)

app.include_router(user_router)

app.include_router(project_router)

app.include_router(attendence_router)

app.include_router(leave_router)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# VALIDATION ERROR
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):

    return JSONResponse(
        status_code=400, content={"message": "Invalid input", "errors": exc.errors()}
    )


# HOME ROUTE
@app.get("/")
def home():

    return {"message": "Employee Management System Running"}
