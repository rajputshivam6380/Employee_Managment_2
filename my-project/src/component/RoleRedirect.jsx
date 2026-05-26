import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../utils/auth";

export default function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    switch (role) {
      case ROLES.ORGANIZATION_ADMIN:
        navigate("/dashboard/home", { replace: true });
        break;

      case ROLES.SUPER_ADMIN:
        navigate("/dashboard/organizations", { replace: true });
        break;

      case ROLES.EMPLOYEE:
        navigate("/dashboard/employee_home", { replace: true });
        break;

      default:
        navigate("/unauthorized", { replace: true });
    }
  }, [navigate]);

  return null;
}