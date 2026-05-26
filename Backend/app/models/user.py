from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey

from sqlalchemy.orm import relationship

from app.database import Base
from app.models.enums import RoleEnum
from app.models.department_enum import DepartmentEnum


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    password = Column(String, nullable=False)

    phone = Column(String(20), nullable=False)

    role = Column(Enum(RoleEnum), nullable=False)

    department = Column(Enum(DepartmentEnum), nullable=True)

    photo = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)

    country_code = Column(String(10), nullable=False, default="+91")

    # Self Relationship
    parent_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )

    # Parent User
    parent = relationship("User", remote_side=[id], backref="children")

    attendances = relationship(
        "Attendance", back_populates="employee", cascade="all, delete"
    )

    leaves = relationship(
        "Leave", foreign_keys="Leave.employee_id", back_populates="employee"
    )

    approved_leaves = relationship(
        "Leave", foreign_keys="Leave.approved_by", back_populates="approver"
    )
