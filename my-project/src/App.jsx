  import { Route, Routes } from "react-router-dom";

  import DashboardLayout from "./layoutes/DashboardLayout";
  import ProtectedRoute from "./component/ProtectedRoute";
  import RoleRedirect from "./component/RoleRedirect";

  import {
    ALL_ROLES,
    MANAGER_ROLES,
    ROLES,
  } from "./utils/auth";

  import EmployeeDetails from "./pages/EmployeeDetails";
  import Employees from "./pages/Employees";
  import Login from "./pages/Login";
  import NotFound from "./pages/NotFound";
  import OrganizationDetails from "./pages/OrganizationDetails";
  import Organizations from "./pages/Organizations";
  import Profile from "./pages/Profile";
  import Unauthorized from "./pages/Unauthorized";
  import Project from "./pages/Project";
  import AssignedProject from "./pages/AssignedProject";
  import Attendance from "./pages/Attendance"

  import {
    ToastContainer,
  } from "react-toastify";

  import "react-toastify/dist/ReactToastify.css";
  // import AllAttendence from "./component/AttendenceTable";
  import AttendenceTable from "./component/AttendenceTable";
import Dashboard from "./pages/Dashboard";

  function App() {

    return (

      <>

        {/* ROUTES */}
        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={ALL_ROLES}
              >
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
path="home"
element={
  <ProtectedRoute allowedRoles={[ROLES.ORGANIZATION_ADMIN]}>
<Dashboard />
  </ProtectedRoute>
}

/>

            <Route
              index
              element={<RoleRedirect />}
            />

            <Route
              path="employees"
              element={
                <ProtectedRoute
                  allowedRoles={MANAGER_ROLES}
                >
                  <Employees />
                </ProtectedRoute>
              }
            />

            <Route
              path="employees/view/:id"
              element={
                <ProtectedRoute
                  allowedRoles={MANAGER_ROLES}
                >
                  <EmployeeDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="organizations"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    ROLES.SUPER_ADMIN,
                  ]}
                >
                  <Organizations />
                </ProtectedRoute>
              }
            />

            <Route
              path="organizations/view/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    ROLES.SUPER_ADMIN,
                    ROLES.ORGANIZATION_ADMIN,
                  ]}
                >
                  <OrganizationDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={<Profile />}
            />

            <Route
              path="assign-project"
              element={<Project />}
            />
    <Route
              path="attendance/all"
              element={<AttendenceTable />}
            />
              

            <Route
              path="projects"
              element={<AssignedProject />}
            />


            <Route
              path="attendance"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.EMPLOYEE]}
                >
                  <Attendance />
                </ProtectedRoute>
              }
            />

            <Route
              path="attendance/:employeeId"
              element={
                <ProtectedRoute
                  allowedRoles={MANAGER_ROLES}
                >
                  <Attendance />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="*"
            element={<NotFound />}
          />




        </Routes>

        {/* GLOBAL TOASTER */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

      </>

    );
  }

  export default App;
