import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database.init_db import seed_database
from backend.api import algorithms, ai, questions, progress
from backend.auth import auth_router
from backend.payment.router import router as payment_router
from backend.payment.admin_router import admin_router
from backend.payment.init_plans import migrate_and_seed_payment_system

app = FastAPI(
    title="Interactive Computer Science Learning & Algorithm Visualization Platform API",
    description="Backend execution engine, multi-subject database, and AI tutoring service.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Disable caching for static files during development
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Include Routers
app.include_router(auth_router)
app.include_router(payment_router)
app.include_router(admin_router)
app.include_router(algorithms.router)
app.include_router(ai.router)
app.include_router(questions.router)
app.include_router(progress.router)

# Initialize and seed database on startup
@app.on_event("startup")
def startup_event():
    print("[Server Startup] Seeding database if necessary...")
    seed_database()
    migrate_and_seed_payment_system()

# Serve static frontend files
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/")
def read_root():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "CS Learning Platform Backend is Running!"}

@app.get("/signin")
@app.get("/login")
def read_signin():
    signin_path = os.path.join(frontend_dir, "signin.html")
    if os.path.exists(signin_path):
        return FileResponse(signin_path)
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/dashboard")
def read_dashboard():
    dash_path = os.path.join(frontend_dir, "dashboard.html")
    if os.path.exists(dash_path):
        return FileResponse(dash_path)
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/checkout")
def read_checkout():
    checkout_path = os.path.join(frontend_dir, "checkout.html")
    if os.path.exists(checkout_path):
        return FileResponse(checkout_path)
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/admin")
def read_admin():
    admin_path = os.path.join(frontend_dir, "admin.html")
    if os.path.exists(admin_path):
        return FileResponse(admin_path)
    return FileResponse(os.path.join(frontend_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 AlgoVerse CS Platform Server is running!")
    print("👉 Open in browser: http://localhost:8080")
    print("="*60 + "\n")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8080, reload=True)
