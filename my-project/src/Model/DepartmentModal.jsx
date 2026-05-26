// import {
//   X,
//   Building2,
//   BadgeCheck,
//   Layers3,
// } from "lucide-react";

// export default function DepartmentModal({
//   department,
//   organizations = [],
//   onClose,
// }) {

//   if (!department) return null;

//   const getOrganizationName = (id) => {

//     const org = organizations.find(
//       (o) => o.id === id
//     );

//     return org?.name || "N/A";
//   };

//   return (

//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

//       <div className="bg-white w-[90%] max-w-4xl rounded-3xl shadow-2xl p-8 relative">

//         {/* CLOSE */}
//         <button
//           onClick={onClose}
//           className="absolute right-6 top-6 hover:cursor-pointer"
//         >
//           <X size={28} />
//         </button>

//         {/* HEADER */}
//         <div className="flex items-center gap-6">

//           <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center">

//             <Layers3
//               size={50}
//               className="text-indigo-600"
//             />

//           </div>

//           <div>

//             <h1 className="text-4xl font-bold capitalize">
//               {department.department}
//             </h1>

//             <div className="flex gap-3 mt-4">

//               <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-semibold">
//                 Department
//               </span>

//             </div>

//           </div>

//         </div>

//         {/* DETAILS */}
//         <div className="mt-10 border-t pt-8">

//           <h2 className="text-2xl font-semibold mb-6">
//             Department Details
//           </h2>

//           <div className="grid grid-cols-2 gap-8">

//             {/* ID */}
//             <div className="flex items-center gap-4">

//               <Layers3 className="text-indigo-500" />

//               <div>

//                 <p className="text-gray-400">
//                   Department ID
//                 </p>

//                 <p className="font-semibold text-lg">
//                   #{department.id}
//                 </p>

//               </div>

//             </div>

//             {/* DEPARTMENT ENUM */}
//             <div className="flex items-center gap-4">

//               <BadgeCheck className="text-green-500" />

//               <div>

//                 <p className="text-gray-400">
//                   Department Name
//                 </p>

//                 <p className="font-semibold text-lg capitalize">
//                   {department.department}
//                 </p>

//               </div>

//             </div>

//             {/* ORGANIZATION */}
//             <div className="flex items-center gap-4">

//               <Building2 className="text-indigo-500" />

//               <div>

//                 <p className="text-gray-400">
//                   Organization
//                 </p>

//                 <p className="font-semibold text-lg">
//                   {getOrganizationName(
//                     department.organization_id
//                   )}
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }
