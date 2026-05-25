# # app/schemas/organization_schema.py

# from pydantic import BaseModel, EmailStr
# from typing import Optional


# class OrganizationCreate(BaseModel):
#     name: str
#     email: EmailStr
#     address: Optional[str] = None


# class OrganizationUpdate(BaseModel):
#     name: Optional[str] = None
#     email: Optional[EmailStr] = None
#     address: Optional[str] = None


# class OrganizationResponse(BaseModel):
#     id: int
#     name: str
#     email: EmailStr
#     address: Optional[str]

#     class Config:
#         from_attributes = True


# class OrganizationBase(BaseModel):

#     id: int
#     name: str

#     class Config:
#         from_attributes = True
