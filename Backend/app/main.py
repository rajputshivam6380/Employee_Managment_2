# app/main.py

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import os

from app.database import Base, engine
import app.models  # Import all models so Base.metadata knows about them
from app.seed import seed_default_user

from app.routes.auth_routes import auth_router
from app.routes.user_routes import user_router
from app.routes.role_routes import role_router
from app.routes.project_routes import project_router
from app.routes.attendence_router import attendence_router
from app.routes.leave_routes import leave_router

app = FastAPI(title="Employee Management System")

# CORS CONFIGURATION (Must be added BEFORE routes and endpoints)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AUTO CREATE TABLES & SEED DATA IF NOT EXISTS (on startup)
@app.on_event("startup")
def startup_db_init():
    try:
        Base.metadata.create_all(bind=engine)
        seed_default_user()
        print("✅ Database tables and seed data initialized successfully")
    except Exception as e:
        print("⚠️ Could not create database tables/seed data on startup:", str(e))



# SAFE UPLOADS DIRECTORY CREATION & MOUNTING (Handles read-only filesystem on Vercel)
uploads_dir = "/tmp/uploads" if os.getenv("VERCEL") else "uploads"
try:
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
except Exception as e:
    print(f"⚠️ Could not mount uploads directory: {e}")

# ROUTES
app.include_router(auth_router)
app.include_router(role_router)
app.include_router(user_router)
app.include_router(project_router)
app.include_router(attendence_router)
app.include_router(leave_router)




# VALIDATION ERROR
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]["msg"] if exc.errors() else "Invalid input"
    return JSONResponse(
        status_code=400,
        content={"detail": f"Validation Error: {first_error}", "errors": exc.errors()},
    )



from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import HTTPException as FastAPIHTTPException


# GLOBAL EXCEPTION HANDLER (Preserves CORS headers & status_code for HTTP exceptions)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, (FastAPIHTTPException, StarletteHTTPException)):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    print("🔥 Global Error Caught:", str(exc))
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )




# HOME ROUTE
@app.get("/")
def home():
    return {"message": "Employee Management System Backend Running Successfully!"}


# SEED DATA ROUTE
@app.get("/seed")
def run_seed():
    try:
        from app.database import SessionLocal
        from app.models.user import User
        from app.core.config import settings

        seed_default_user()
        db = SessionLocal()
        users = db.query(User).all()
        user_emails = [u.email for u in users]
        db_scheme = settings.DATABASE_URL.split(":")[0] if settings.DATABASE_URL else "none"
        db.close()
        return {
            "message": "Database seeded successfully!",
            "db_scheme": db_scheme,
            "user_count": len(users),
            "users": user_emails,
        }
    except Exception as e:
        return {"message": "Seeding error", "error": str(e)}




