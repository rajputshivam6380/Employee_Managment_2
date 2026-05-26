from fastapi import Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer

from app.auth.jwt_handler import decode_token

# ================= OAUTH =================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ================= CURRENT USER =================
def get_current_user(token: str = Depends(oauth2_scheme)):

    try:

        payload = decode_token(token)

        if not payload:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )

        return payload

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid"
        )


# ================= ROLE CHECKER =================
def require_roles(roles: list):

    def checker(user=Depends(get_current_user)):

        user_role = user.get("role")

        if user_role not in roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

        return user

    return checker
