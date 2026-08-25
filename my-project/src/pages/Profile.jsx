import api, { API_BASE_URL } from "../apis/api";
import { formatRole, ROLES, saveAuth } from "../utils/auth";
import { Phone } from "lucide-react";
import { KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setProfile(res.data);

        const token = localStorage.getItem("token");
        if (token) saveAuth(token, res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-semibold text-indigo-500">
          Loading Profile...
        </h1>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-semibold text-red-500">
          Failed to load profile
        </h1>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mb-4 flex justify-end">
        {profile.role === ROLES.EMPLOYEE && (
          <button
            type="button"
            onClick={() => navigate("/dashboard/change-password")}
            className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            <KeyRound
              size={18}
              className="transition-transform duration-200 group-hover:rotate-12"
            />
            Change Password
          </button>
        )}
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-500 h-32 relative">
          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2">
            <img
              src={
                profile.photo
                  ? profile.photo.startsWith("http")
                    ? profile.photo
                    : `${API_BASE_URL}${profile.photo}`
                  : "https://img.pikbest.com/png-images/20241128/man-avatar-3d-icon-isolated-on-transparent-background-_11144108.png!sw800"
              }

              alt="profile"
              className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
            />
          </div>
        </div>

        <div className="pt-16 pb-10 px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>

            <p className="text-gray-500 mt-2">{profile.email}</p>

            <span className="inline-block mt-4 bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-semibold">
              {formatRole(profile.role)}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-gray-50 p-6 rounded-xl flex items-center gap-4 shadow-sm">
              <Mail className="text-indigo-500" size={28} />
              <div>
                <p className="text-gray-400 text-sm">Email Address</p>
                <p className="font-semibold break-all">{profile.email}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl flex items-center gap-4 shadow-sm">
              <ShieldCheck className="text-green-500" size={28} />
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="font-semibold">{formatRole(profile.role)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl flex items-center gap-4 shadow-sm">
              <Phone className="text-blue-500" size={28} />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="font-semibold">
                  {profile.country_code} {profile.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
