import {
  X,
  Mail,
  Building2,
  MapPin,
} from "lucide-react";

export default function OrganizationModal({
  organization,
  onClose,
}) {

  if (!organization) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[90%] max-w-4xl rounded-3xl shadow-2xl p-8 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 hover:cursor-pointer"
        >
          <X size={28} />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-6">

          <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center">

            <Building2
              size={50}
              className="text-indigo-600"
            />

          </div>

          <div>

            <h1 className="text-4xl font-bold">
              {organization.name}
            </h1>

            <div className="flex gap-3 mt-4">

              <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-semibold">
                Organization
              </span>

            </div>

          </div>

        </div>

        {/* DETAILS */}
        <div className="mt-10 border-t pt-8">

          <h2 className="text-2xl font-semibold mb-6">
            Organization Details
          </h2>

          <div className="grid grid-cols-2 gap-8">

            {/* EMAIL */}
            <div className="flex items-center gap-4">

              <Mail className="text-blue-500" />

              <div>

                <p className="text-gray-400">
                  Email
                </p>

                <p className="font-semibold text-lg">
                  {organization.email}
                </p>

              </div>

            </div>

            {/* ADDRESS */}
            <div className="flex items-center gap-4">

              <MapPin className="text-red-500" />

              <div>

                <p className="text-gray-400">
                  Address
                </p>

                <p className="font-semibold text-lg">
                  {organization.address || "N/A"}
                </p>

              </div>

            </div>

            {/* ID */}
            <div className="flex items-center gap-4">

              <Building2 className="text-indigo-500" />

              <div>

                <p className="text-gray-400">
                  Organization ID
                </p>

                <p className="font-semibold text-lg">
                  #{organization.id}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}