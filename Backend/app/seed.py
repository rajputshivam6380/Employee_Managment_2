from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.enums import RoleEnum
from app.auth.utils import hash_password
from fastapi import HTTPException


def seed_default_user():
    db: Session = SessionLocal()

    try:
        users = [
            {
                "name": "Samyotech",
                "email": "shivam.samyotech@gmail.com",
                "phone": "9754731842",
            },
            {
                "name": "Amazone",
                "email": "amazone@gmail.com",
                "phone": "9876543210",
            },
        ]

        for user_data in users:

            existing_user = (
                db.query(User).filter(User.email == user_data["email"]).first()
            )

            if existing_user:
                print(f"{user_data['email']} already exists")
                # raise HTTPException(status_code=404,detail="Email exists")
                continue

            new_user = User(
                name=user_data["name"],
                email=user_data["email"],
                password=hash_password("123456"),
                phone=user_data["phone"],
                role=RoleEnum.ORGANIZATION_ADMIN,
                is_active=True,
                country_code="+91",
            )

            db.add(new_user)

        db.commit()

        print("Default users created successfully")
        return True

    except Exception as e:
        db.rollback()
        print("Error while seeding:", e)
        raise e

    finally:
        db.close()

