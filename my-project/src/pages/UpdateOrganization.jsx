import { useState } from "react";

import api from "../apis/api";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { X } from "lucide-react";

export default function UpdateOrganization({
  open,
  handleClose,
  organization,
  fetchOrganizations,
}) {
  // ================= STATES =================
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  // ================= AUTO FILL =================
  // useEffect(() => {

  //   if (organization) {

  //     setFormData({
  //       name:
  //         organization.name || "",

  //       email:
  //         organization.email || "",

  //       address:
  //         organization.address || "",
  //     });
  //   }

  // }, [organization]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= RESET =================
  const resetForm = () => {
    if (organization) {
      setFormData({
        name: "",

        email: "",

        address: "",
      });
    }
  };

  // ================= UPDATE ORGANIZATION =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ================= PATCH DATA =================
      const updatedData = {};

      if (formData.name.trim() !== "") {
        updatedData.name = formData.name;
      }

      if (formData.email.trim() !== "") {
        updatedData.email = formData.email;
      }

      if (formData.address.trim() !== "") {
        updatedData.address = formData.address;
      }

      console.log("PATCH DATA:", updatedData);

      // ================= API =================
      await api.patch(`/organizations/${organization.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Organization Updated Successfully");

      // ================= REFRESH =================
      if (fetchOrganizations) {
        fetchOrganizations();
      }

      // ================= CLOSE =================
      handleClose();
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data);

      alert(err.response?.data?.detail || "Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          outline: "none",
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-500">
            Update Organization
          </h1>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black transition hover:cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Organization Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          {/* ADDRESS */}
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          {/* BUTTONS */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            {/* RESET */}

            <button
              type="button"
              onClick={() => {
                resetForm();
                handleClose();
              }}
              className="px-5 py-2 bg-red-500 text-white rounded-lg"
            >
              Cancel
            </button>

            {/* UPDATE */}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              {loading ? "Updating..." : "Update Organization"}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
