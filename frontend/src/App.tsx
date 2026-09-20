import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { restoreSession } from "./features/auth/authSlice";
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TasksPage } from "./pages/TasksPage";
import { TeamPage } from "./pages/TeamPage";
import { HomePage } from "./pages/HomePage";
const Protected = (): React.JSX.Element => {
  const { user, initialized } = useAppSelector((state) => state.auth);
  const location = useLocation();
  if (!initialized)
    return <div className="loading-screen">Restoring session…</div>;
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};
const AdminOnly = (): React.JSX.Element =>
  useAppSelector((state) => state.auth.user?.role) === "ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
export const App = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route element={<Protected />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          <Route element={<AdminOnly />}>
            <Route path="team" element={<TeamPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
