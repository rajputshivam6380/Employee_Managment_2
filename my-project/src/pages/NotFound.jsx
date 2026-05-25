import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      
        <img  className="w-150 h-150" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT59SG8hEoNW5aFYaJL0Y4VaAqNbzvEoSkBfA&s" alt="Page not found"></img>

      {/* <h1 className="text-7xl font-extrabold text-indigo-600">404</h1> */}

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
      >
        Go to Home
      </button>

    </div>
  );
}

export default NotFound;
