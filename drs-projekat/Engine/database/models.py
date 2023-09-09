from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Boolean, Column, String, Integer, Float, create_engine

connection_string = "postgresql://docker:docker@database:5432/drsdb"

engine = create_engine(connection_string)
Base = declarative_base()
Session = sessionmaker()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer(), primary_key=True)
    email = Column(String(50), nullable=False, unique=True)
    username = Column(String(50))
    firstname = Column(String(50), nullable=False)
    lastname = Column(String(50), nullable=False)
    password = Column(String(150), nullable=False)
    address = Column(String(50), nullable=False)
    city = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    phoneNumber = Column(String(50), nullable=False)
    verified = Column(Boolean, default=False)
    social = Column(String(20), default = "regular")