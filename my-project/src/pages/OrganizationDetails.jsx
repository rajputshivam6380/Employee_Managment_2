import { useCallback, useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import api from "../apis/api";
import OrganizationModel from "../Model/OrganizationModel";

// import OrganizationModal from "../Model/OrganizationModal";

export default function OrganizationDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [organization, setOrganization] =
    useState(null);

  // FETCH ORGANIZATION
  const fetchOrganization = useCallback(async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        `/organizations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrganization(response.data);

    } catch (err) {

      console.log(err);

    }
  }, [id]);

  useEffect(() => {

    fetchOrganization();

  }, [fetchOrganization]);

  if (!organization) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (

    <div className="p-6">

      <OrganizationModel
        organization={organization}
        onClose={() => navigate(-1)}
      />

    </div>
  );
}
