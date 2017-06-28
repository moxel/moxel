import re
from datetime import datetime
from sqlalchemy import Table, Column, String, Float, Integer, MetaData, Boolean, create_engine
from sqlalchemy.types import DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from dummy_master.config import SQL_DATABASE


engine = create_engine(SQL_DATABASE)
Session = sessionmaker(bind=engine)
Base = declarative_base()


class Model(Base):
    __tablename__ = 'model'
    uid = Column(String, primary_key=True)
    user = Column(String)
    project = Column(String)
    name = Column(String)
    description = Column(String)
