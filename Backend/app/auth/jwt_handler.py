from jose import jwt, JWTError

from datetime import (
    datetime,
    timedelta
)

from fastapi import HTTPException

from app.core.config import Settings


SECRET_KEY = Settings.SECRET_KEY

ALGORITHM = Settings.ALGORITHM


# ================= CREATE ACCESS TOKEN =================

def create_access_token(user):

    department = (
        user.department.value
        if user.department else None
    )

    payload = {

        "user_id": user.id,

        "name": user.name,

        "email": user.email,

        "role": user.role.value,


        "organization_id": user.parent_id,

        "department": department,

        "exp": datetime.utcnow() + timedelta(days=1)
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ================= DECODE TOKEN =================

def decode_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )