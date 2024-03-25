from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from mongoengine import Document, StringField, DateTimeField, BooleanField, DictField

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    # Add more fields as needed

class UserSettings(Document):
    user_id = StringField(required=True)
    settings = DictField()
    # Add more fields as needed

class UserProfile(Document):
    user_id = StringField(required=True)
    profile_data = DictField()
    # Add more fields as needed

class Document(Document):
    user_id = StringField(required=True)
    content = StringField()
    metadata = DictField()
    created_at = DateTimeField()
    updated_at = DateTimeField()
    # Add more fields as needed