# app/schemas/user_schema.py

from pydantic import BaseModel, EmailStr

from typing import Optional, List

from app.models.enums import RoleEnum
from app.models.department_enum import DepartmentEnum

# ================= SUPER ADMIN =================


class SuperAdminCreate(BaseModel):

    name: str

    email: EmailStr

    password: str

    phone: str


class SuperAdminResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    country_code: str

    phone: str

    role: RoleEnum

    is_active: bool

    class Config:
        from_attributes = True


from pydantic import BaseModel, EmailStr, field_validator

class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str

    phone: Optional[str] = None

    role: RoleEnum

    department: Optional[DepartmentEnum] = None

    country_code: str = "+91"

    # Parent User ID
    parent_id: Optional[int] = None

    @field_validator("role", mode="before")
    @classmethod
    def parse_role(cls, v):
        if isinstance(v, str):
            v_clean = v.strip().lower()
            for r in RoleEnum:
                if r.value == v_clean or r.name.lower() == v_clean:
                    return r
        return v

    @field_validator("department", mode="before")
    @classmethod
    def parse_department(cls, v):
        if not v:
            return None
        if isinstance(v, str):
            v_clean = v.strip().upper()
            for d in DepartmentEnum:
                if d.value.upper() == v_clean or d.name.upper() == v_clean:
                    return d
        return v



# ================= USER UPDATE =================


class UserUpdate(BaseModel):

    name: Optional[str] = None

    email: Optional[EmailStr] = None

    phone: Optional[str] = None

    photo: Optional[str] = None

    is_active: Optional[bool] = None

    role: Optional[RoleEnum] = None

    country_code: Optional[str] = None

    department: Optional[DepartmentEnum] = None

    parent_id: Optional[int] = None


# ================= BASIC USER RESPONSE =================


class UserBaseResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    role: RoleEnum

    class Config:
        from_attributes = True


class OrganizationResponse(BaseModel):
    name: str
    country_code: str
    phone: str
    email: str


# ================= USER RESPONSE =================


class UserResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    phone: Optional[str]

    photo: Optional[str]

    is_active: bool

    role: RoleEnum

    department: Optional[DepartmentEnum]

    country_code: str

    is_present_today: bool = False
    attendance_status: str = "Absent"
    checked_out: bool = False

    parent_id: Optional[int]

    # Parent User Info
    parent: Optional[UserBaseResponse] = None

    class Config:
        from_attributes = True
