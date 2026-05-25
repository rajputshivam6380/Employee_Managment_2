export default function Unauthorized() {

  return (

    <div className="h-screen flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold text-red-500">
          403
        </h1>

        <p className="text-gray-600 mt-2">
          Unauthorized Access
        </p>

      </div>

    </div>
  );
}