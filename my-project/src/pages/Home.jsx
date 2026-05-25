
import { useEffect, useState } from "react";

import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

import EmpTable from "../component/EmpTable";
import OrgTable from "../component/OrgTable";


import api from "../apis/api";

export default function Home() {

  const [employees, setEmployees] =
    useState([]);

  const [organizations, setOrganizations] =
    useState([]);

 
  const [type, setType] =
    useState("employee");

 const fetchData = async () => {

  try {

    const token =
      localStorage.getItem("token");

    const usersRes = await api.get(
      "/users/all",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const employeeData =
      usersRes.data.filter(
        (user) =>
          user.role === "employee" ||
          user.role === "admin"
      );

      const orgRes = await api.get(
  "/organizations/all",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

console.log(
  "ORG API:",
  orgRes.data
);



    setEmployees(employeeData);

    setOrganizations(
      Array.isArray(orgRes.data)
        ? orgRes.data
        : orgRes.data.data || []
    );

 

    console.log(
      "Organizations:",
      orgRes.data
    );

  } catch (err) {

    console.log(
      "FETCH ERROR:",
      err
    );

  }
};
  useEffect(() => {

    fetchData();

  }, []);

  return (

    <div className="flex min-h-screen bg-gray-100">

      <Sidebar
        setType={setType}
        currentType={type}
      />

      <div className="flex-1 flex flex-col">

        <Topbar type={type} />

<div className="p-6">

  {
    type === "employee" && (
      <EmpTable
        employee={employees}
        organizations={organizations}
      />
    )
  }

{
  type === "organization" && (
    <OrgTable
      organizations={organizations}
    />
  )
}
       </div>

      </div>

    </div>
  );
}
