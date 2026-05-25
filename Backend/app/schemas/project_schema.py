from pydantic import BaseModel
from typing import Optional,List
from datetime import date
from app.models.project_model import PriorityEnum,StatusEnum
from app.schemas.user_schema import UserResponse

class ProjectCreate(BaseModel):

    title: str
    description: Optional[str] = None
    assigned_to: List[int]
    created_at:Optional[date]=None
    deadline: date
    priority:PriorityEnum
    status:StatusEnum


class ProjectResponse(BaseModel):

    id: int
    title: str
    description: Optional[str]
    status: StatusEnum
    assigned_to: List[int]
    priority:PriorityEnum
    deadline: date
    created_at:date

    # employee: UserResponse
    class Config:
        from_attributes = True


        
class UserMiniResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True