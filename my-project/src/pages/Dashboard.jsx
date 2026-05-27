import { useEffect, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Users,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDashboardSummary } from "../api/dashboardApi";
import dayjs from "dayjs";

const chartColors = [
  "#4f46e5",
  "#14b8a6",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const emptyDashboard = {
  cards: {
    total_employees: 0,
    daily_leaves: 0,
    total_projects: 0,
    assigned_project_count: 0,
  },
  daily_attendance: [],
  weekly_attendance: [],
  monthly_department_average: [],
  daily_department_average: [],
  project_summary: {
    pending: 0,
    in_progress: 0,
    completed: 0,
  },
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboardSummary();

        setDashboard(response.data || emptyDashboard);
      } catch (err) {
        console.log(err);

        setError(err.response?.data?.detail || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Employees",
      value: dashboard.cards.total_employees,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Today's Leaves",
      value: dashboard.cards.daily_leaves || 0,
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Projects",
      value: dashboard.cards.total_projects,
      icon: Briefcase,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Assigned Project Count",
      value: dashboard.cards.assigned_project_count,
      icon: ClipboardList,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
  ];

  const projectChartData = [
    {
      name: "Pending",
      value: dashboard.project_summary.pending,
    },
    {
      name: "In Progress",
      value: dashboard.project_summary.in_progress,
    },
    {
      name: "Completed",
      value: dashboard.project_summary.completed,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl bg-white px-6 py-4 text-gray-600 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          <AlertCircle size={22} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-600">
            Organization Dashboard
          </h1>

          {/* <p className="mt-1 text-sm text-gray-500">
            Attendance, department averages, and assigned project summary.
          </p> */}
        </div>

        <div className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          {new Date().toDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-gray-900">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <Icon size={26} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Daily Attendance For All Employees
            </h2>

            <BarChart3 className="text-indigo-500" />
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dashboard.daily_attendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => dayjs(value).format("DD-MM-YYYY")}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => dayjs(value).format("DD-MM-YYYY")}
              />
              <Legend />
              <Bar
                dataKey="present"
                name="Present"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Project Status
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={projectChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={4}
              >
                {projectChartData.map((_, index) => (
                  <Cell key={index} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Weekly Attendance Average
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.weekly_attendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis unit="%" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="average"
                name="Average"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Daily Department Attendance Average
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.daily_department_average}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar
                dataKey="average"
                name="Daily Avg"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Monthly Department Attendance Average
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={dashboard.monthly_department_average}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis unit="%" />
            <Tooltip />
            <Bar
              dataKey="average"
              name="Monthly Avg"
              fill="#f97316"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
