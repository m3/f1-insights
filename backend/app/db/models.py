from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, func
from app.core.database import Base

class Race(Base):
    __tablename__ = "races"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True) # e.g. '2026-11'
    season = Column(Integer, nullable=False)
    round = Column(Integer, nullable=False)
    race_name = Column(String, nullable=False)
    circuit_id = Column(String, nullable=False)
    circuit_name = Column(String, nullable=False)
    locality = Column(String, nullable=False)
    country = Column(String, nullable=False)
    race_date = Column(String, nullable=False)
    race_time_utc = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Driver(Base):
    __tablename__ = "drivers"
    __table_args__ = {'extend_existing': True}

    driver_id = Column(String, primary_key=True) # e.g. 'norris'
    code = Column(String, unique=True, nullable=False) # e.g. 'NOR'
    number = Column(Integer, nullable=True)
    given_name = Column(String, nullable=False)
    family_name = Column(String, nullable=False)
    nationality = Column(String, nullable=True)
    current_team = Column(String, nullable=True)

class DriverStandingModel(Base):
    __tablename__ = "driver_standings"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    season = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    points = Column(Float, nullable=False)
    wins = Column(Integer, nullable=False)
    driver_code = Column(String, nullable=False)
    driver_name = Column(String, nullable=False)
    team_name = Column(String, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ConstructorStandingModel(Base):
    __tablename__ = "constructor_standings"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    season = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    points = Column(Float, nullable=False)
    wins = Column(Integer, nullable=False)
    team_name = Column(String, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class PenaltyPointModel(Base):
    __tablename__ = "penalty_points"
    __table_args__ = {'extend_existing': True}

    driver_code = Column(String, primary_key=True)
    driver_name = Column(String, nullable=False)
    points = Column(Integer, default=0)
    max_points = Column(Integer, default=12)
    is_at_risk = Column(Boolean, default=False)
    next_expiry = Column(String, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class BriefModel(Base):
    __tablename__ = "briefs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    race_id = Column(String, nullable=False)
    brief_type = Column(String, nullable=False) # 'PRE_RACE' or 'POST_RACE'
    title = Column(String, nullable=False)
    markdown_content = Column(Text, nullable=False)
    facts_json = Column(Text, nullable=False) # Serialized JSON array of facts
    created_at = Column(DateTime, server_default=func.now())

class MasterOverviewCache(Base):
    __tablename__ = "overview_cache"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default="latest")
    payload_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
