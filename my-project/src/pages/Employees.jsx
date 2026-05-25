import { useEffect, useState } from "react";

import api from "../apis/api";
import EmpTable from "../component/EmpTable";
import { getStoredUser, ROLES } from "../utils/auth";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const user = getStoredUser();
      const usersRes = await api.get("/users/all");
      setEmployees(usersRes.data);

      if (user?.role === ROLES.SUPER_ADMIN) {
        const orgRes = await api.get("/organizations/all");
        setOrganizations(orgRes.data);
      } else {
        const orgMap = new Map();

        usersRes.data.forEach((employee) => {
          if (employee.organization) {
            orgMap.set(employee.organization.id, employee.organization);
          }
        });

        setOrganizations(Array.from(orgMap.values()));
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-semibold text-gray-500">
          Loading Employees...
        </h1>
      </div>
    );
  }

  return (
    <EmpTable
      employee={employees}
      organizations={organizations}
      fetchEmployees={fetchData}
    />
  );
}
