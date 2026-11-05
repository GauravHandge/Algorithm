import datetime
from sqlalchemy import Column, Integer, String, DateTime
from backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    salt = Column(String, nullable=False)
    role = Column(String, default="Learner")
    avatar = Column(String, default="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
