from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enums import RoleEnum

from app.auth.dependencies import require_roles

role_router = APIRouter(prefix="/roles", tags=["Roles"])


@role_router.get("/all")
def get_roles():

    return [role.value for role in RoleEnum]
