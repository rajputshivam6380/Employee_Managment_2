# app/routes/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import func


from app.database import get_db

from app.models.user import User
from app.schemas.user_schema import UserCreate

from app.schemas.user_schema import (
    SuperAdminCreate,
    SuperAdminResponse,
    OrganizationResponse,
)

from app.schemas.auth_schema import LoginSchema, TokenResponse

from app.service.auth_service import create_super_admin, create_organization_admin

from app.auth.utils import verify_password

from app.auth.jwt_handler import create_access_token

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


# ================= CREATE SUPER ADMIN =================


@auth_router.post("/create-super-admin", response_model=SuperAdminResponse)
def add_super_admin(data: SuperAdminCreate, db: Session = Depends(get_db)):

    return create_super_admin(db, data)


@auth_router.post("/create-organization-admin", response_model=OrganizationResponse)
def add_organization_admin(data: UserCreate, db: Session = Depends(get_db)):

    return create_organization_admin(db, data)


# ================= LOGIN =================


@auth_router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):

    # ================= FIND USER =================
    clean_email = data.email.strip().lower() if data.email else ""
    user = (
        db.query(User)
        .filter(func.lower(User.email) == clean_email)
        .first()
    )

    # ================= EMAIL CHECK =================
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # ================= PASSWORD CHECK =================
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # ================= ACTIVE CHECK =================
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")

    # ================= CREATE TOKEN =================
    token = create_access_token(user)

    # ================= RESPONSE =================
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "parent_id": user.parent_id,
            "is_active": user.is_active,
        },
    }

