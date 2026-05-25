import { useState } from "react";

import api from "../apis/api";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { X } from "lucide-react";

export default function AddOrganization({
  open,
  handleClose,
  fetchOrganizations,
}) {

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      address: "",
      is_active: true,
    });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= RESET FORM =================
  const resetForm = () => {

    setFormData({
      name: "",
      email: "",
      address: "",
      is_active: true,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const sendData = {
        ...formData,
      };

      await api.post(
        "/organizations/create",
        sendData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Organization Added Successfully"
      );

      // REFRESH ORGANIZATIONS
      if (fetchOrganizations) {

        fetchOrganizations();

      }

      // RESET FORM
      resetForm();

      // CLOSE MODAL
      handleClose();

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.detail ||
        "Failed to add organization"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <Modal
      open={open}
      onClose={handleClose}
    >

      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform:
            "translate(-50%, -50%)",
          width: 700,
          bgcolor: "white",
          borderRadius: 3,
          p: 4,
          outline: "none",
        }}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <h1 className="text-3xl font-bold text-indigo-500">
            Add Organization
          </h1>

          <button
            onClick={handleClose}
            className="hover:cursor-pointer"
          >
            <X size={28} />
          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >

          {/* ORGANIZATION NAME */}
          <input
            type="text"
            name="name"
            placeholder="Organization Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Organization Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          {/* ADDRESS */}
          <input
            type="text"
            name="address"
            placeholder="Organization Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-3 rounded-lg col-span-2"
          />

          {/* STATUS */}
          {/* <select
            name="is_active"
            value={formData.is_active.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_active:
                  e.target.value === "true",
              }))
            }
            className="border p-3 rounded-lg"
          >

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>

          </select> */}

          {/* BUTTONS */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">

           
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

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >

              {loading
                ? "Creating..."
                : "Create Organization"}

            </button>

          </div>

        </form>

      </Box>

    </Modal>
  );
}



