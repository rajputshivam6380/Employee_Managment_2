from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.department_enum import DepartmentEnum
from app.models.enums import RoleEnum
from app.auth.utils import hash_password


def seed_default_user():
    db: Session = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == "admin@gmail.com").first()

        if existing_user:
            print("User already exists")
            return

        default_user = User(
            name="Samyotech",
            email="shivam.samyotech@gmail.com",
            password=hash_password("123456"),
            phone="9754731842",
            role=RoleEnum.ORGANIZATION_ADMIN,
            is_active=True,
            country_code="+91",
        )

        db.add(default_user)
        db.commit()

        print("Default user created successfully")

    except Exception as e:
        db.rollback()
        print("Error while seeding:", e)

    finally:
        db.close()
