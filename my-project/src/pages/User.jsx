import axios from "axios";
import { useEffect, useState } from "react";

function User() {
  const [users, setUsers] = useState(null);

  const getUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:8000/super_admin/get_super_admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(res.data);
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUsers();
    }
  }, []);
  return (
    <>
      <div className="bg-amber-100">
        <h2>User</h2>

        {users && (
          <div>
            <p>Name: {users.name}</p>
            <p>Email: {users.email}</p>
            <p>Role: {users.role}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default User;
