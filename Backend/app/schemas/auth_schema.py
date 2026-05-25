# app/schemas/auth_schema.py

from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginSchema(BaseModel):

    email: EmailStr

    password: str


class TokenResponse(BaseModel):

    access_token: str

    token_type: str

    user: dict
