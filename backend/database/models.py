import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from backend.database.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    order = Column(Integer, default=0)

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, index=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    subject = relationship("Subject", back_populates="topics")
    algorithms = relationship("Algorithm", back_populates="topic", cascade="all, delete-orphan")

class Algorithm(Base):
    __tablename__ = "algorithms"

    id = Column(String, primary_key=True, index=True)
    topic_id = Column(String, ForeignKey("topics.id"), nullable=False)
    name = Column(String, nullable=False)
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    category = Column(String, nullable=False) # e.g., Graph, Sorting, Crypto, CPU Scheduling, ML
    difficulty = Column(String, default="Easy") # Easy, Medium, Hard
    time_complexity = Column(String, nullable=True)
    space_complexity = Column(String, nullable=True)
    pseudocode = Column(Text, nullable=True)
    visualizer_type = Column(String, default="array") # graph, array, grid, crypto, ml
    default_input = Column(JSON, nullable=True)
    is_free_preview = Column(Boolean, default=False) # True = Free for all learners, False = Requires Premium Access

    topic = relationship("Topic", back_populates="algorithms")
    questions = relationship("Question", back_populates="algorithm", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    algorithm_id = Column(String, ForeignKey("algorithms.id"), nullable=True)
    subject_id = Column(String, ForeignKey("subjects.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="mcq") # mcq, predict_step, complexity
    options = Column(JSON, nullable=True) # list of options
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="Medium")

    algorithm = relationship("Algorithm", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, default="default_user")
    subject_id = Column(String, nullable=True)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, default="default_user")
    algorithm_id = Column(String, nullable=False)
    completed = Column(Integer, default=0) # 1 if completed, 0 if viewed
    last_viewed = Column(DateTime, default=datetime.datetime.utcnow)
