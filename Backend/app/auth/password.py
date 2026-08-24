from pydantic import BaseModel, Field, model_validator


class ChangePassword(BaseModel):
    old_password:str
    new_password:str=Field(
        min_length=8,
        max_length=20
    )
    
    confirm_password:str=Field(min_length=8,
                               max_length=20)
    
    @model_validator(mode="after")
    def validate_passwords(self):
        if self.new_password != self.confirm_password:
            raise ValueError(
                "New password and confirm password are not matched"
            )
        if self.old_password==self.new_password:
            raise ValueError("New password must be different from old password")
        return self    