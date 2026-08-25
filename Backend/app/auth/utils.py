import bcrypt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback to direct bcrypt if passlib has version compatibility issues
        pwd_bytes = password.encode("utf-8")
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to direct bcrypt check
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"), hashed_password.encode("utf-8")
            )
        except Exception:
            return False

