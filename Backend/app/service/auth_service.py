from fastapi import HTTPException

from app.models.user import User
from app.models.enums import RoleEnum

from app.auth.utils import hash_password


def create_super_admin(db, data):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:

        raise HTTPException(status_code=400, detail="Email already exists")

    admin = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        phone=data.phone,
        country_code="+91",
        role=RoleEnum.SUPER_ADMIN,
    )

    db.add(admin)

    db.commit()

    db.refresh(admin)

    return {"message": "Super Admin Created Successfully", "data": admin}


def create_organization_admin(db, data):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:

        raise HTTPException(status_code=400, detail="Email already exists")

    admin = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        phone=data.phone,
        country_code=data.country_code,
        role=RoleEnum.ORGANIZATION_ADMIN,
    )

    db.add(admin)

    db.commit()

    db.refresh(admin)

    return {"message": "Organization Admin Created Successfully", "data": admin}
