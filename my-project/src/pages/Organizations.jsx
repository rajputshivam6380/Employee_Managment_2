import { useEffect, useState } from "react";

import api from "../apis/api";

import OrgTable from "../component/OrgTable";

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);

  // ================= FETCH ORGANIZATIONS =================
  const fetchOrganizations = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/organizations/all",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrganizations(response.data);
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.detail || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-semibold text-gray-500">
          Loading Organizations...
        </h1>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="p-6">
      <OrgTable
        organizations={organizations}
        fetchOrganizations={fetchOrganizations}
      />
    </div>
  );
}
