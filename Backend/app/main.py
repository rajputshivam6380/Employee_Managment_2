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

# AUTO CREATE TABLES & SEED DATA IF NOT EXISTS (for Cloud DB / Neon / Supabase)
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

# CORS CONFIGURATION
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:8001",
    "https://employee-managment-2-sqcf-one.vercel.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    clean_url = frontend_url.rstrip("/")
    if clean_url not in allowed_origins:
        allowed_origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if frontend_url else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# VALIDATION ERROR
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400, content={"message": "Invalid input", "errors": exc.errors()}
    )


# HOME ROUTE
@app.get("/")
def home():
    return {"message": "Employee Management System Backend Running Successfully!"}


# SEED DATA ROUTE
@app.get("/seed")
def run_seed():
    try:
        seed_default_user()
        return {"message": "Database seeded successfully!"}
    except Exception as e:
        return {"message": "Seeding error", "error": str(e)}


