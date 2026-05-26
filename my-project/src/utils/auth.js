import { jwtDecode } from "jwt-decode";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORGANIZATION_ADMIN: "organization_admin",
  HR_MANAGER: "hr_manager",
  DEPARTMENT_ADMIN: "department_admin",
  EMPLOYEE: "employee",
};

export const MANAGER_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_ADMIN,
  ROLES.HR_MANAGER,
  ROLES.DEPARTMENT_ADMIN,
];

export const ALL_ROLES = [
  ...MANAGER_ROLES,
  ROLES.EMPLOYEE,
];


// export const EMPLOYEE=
//   ROLES.EMPLOYEE;

export function formatRole(role = "") {
  return role
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatName(name = "") {
  return name
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export function getTokenPayload(token) {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = getTokenPayload(token);

  if (!payload?.exp) return true;

  return payload.exp * 1000 < Date.now();
}

export function saveAuth(token, userFromApi = null) {
  const payload = getTokenPayload(token);
  const user = {
    id: userFromApi?.id ?? payload?.user_id,
    name: userFromApi?.name ?? payload?.name??"",
    email: userFromApi?.email ?? payload?.email??"",
    role: userFromApi?.role ?? payload?.role,
    organization_id: userFromApi?.organization_id ?? payload?.organization_id ?? null,
    department: userFromApi?.department ?? payload?.department ?? null,
  };

  localStorage.setItem("token", token);
  localStorage.setItem("role", user.role);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
}
