# from sqlalchemy import Column, Integer, String
# from sqlalchemy.orm import relationship

# from app.database import Base


# class Organization(Base):

#     __tablename__ = "organizations"

#     id = Column(Integer, primary_key=True, index=True)

#     name = Column(String(100), nullable=False)

#     email = Column(
#         String(100),
#         unique=True,
#         nullable=False
#     )

#     address = Column(
#         String(255),
#         nullable=True
#     )

#     users = relationship(
#         "User",
#         back_populates="organization",
#         cascade="all, delete"
#     )