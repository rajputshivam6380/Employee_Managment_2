from enum import Enum


class RoleEnum(str, Enum):

    SUPER_ADMIN = "super_admin"

    ORGANIZATION_ADMIN = "organization_admin"

    HR_MANAGER = "hr_manager"

    DEPARTMENT_ADMIN = "department_admin"

    EMPLOYEE = "employee"