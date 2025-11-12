import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/AdminDashboard";
import BusinessDetails from "./components/BusinessDetails";
import VisitorPage from "./visitor/pages/VisitorExplore";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import VisitorProfile from "./visitor/pages/VisitorProfile";
import VisitorToolkit from "./visitor/pages/VisitorToolkit";
import VisitorProfileEditPage from "./visitor/pages/VisitorProfileEditPage";
import VisitorHome from "./visitor/pages/VisitorHome";
import NewsList from "./components/NewsList";
import NewsDetail from "./components/NewsDetail";
import RecentActivity from "./components/RecentActivity";
import VisitorNotifications from "./visitor/pages/VisitorNotifications";
import VisitorSurveys from "./visitor/pages/VisitorSurveys";
import OwnerLayout from "./layouts/OwnerLayout";
import VisitorLayout from "./visitor/layouts/VisitorLayout";
import Dashboard from "./pages/owner/Dashboard";
import MyBusiness from "./pages/owner/MyBusiness";
import ExploreOwner from "./pages/owner/ExploreOwner";
import Surveys from "./pages/owner/Surveys";
import Notifications from "./pages/owner/Notifications";
import PublicLayout from "./layouts/PublicLayout";
import PublicOwnerProfile from "./pages/PublicOwnerProfile";
import EditOwnerProfile from "./pages/EditOwnerProfile";
import PublicVisitorProfile from "./pages/PublicVisitorProfile";
import ErrorBoundary from "./components/Shared/ErrorBoundary";
import "./App.css";

const LandingOrRedirect = () => {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  if (user.role === "visitor") return <Navigate to="/visitor/home" replace />;
  if (user.role === "owner") return <Navigate to="/owner/dashboard" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <LandingPage />;
};

function Frame() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingOrRedirect />} />
          <Route path="/explore" element={<Navigate to="/visitor/explore" replace />} />
          <Route path="/recent" element={<RecentActivity />} />
          <Route
            path="/news"
            element={<NewsList />}
          />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/profile" element={<Navigate to="/visitor/profile" replace />} />
        <Route path="/surveys" element={<Navigate to="/visitor/surveys" replace />} />
        <Route path="/notifications" element={<Navigate to="/visitor/notifications" replace />} />

        <Route
          path="/visitor/*"
          element={
            <ProtectedRoute
              roles={["visitor"]}
              element={<VisitorLayout />}
            />
          }
        >
          <Route index element={<VisitorHome />} />
          <Route path="home" element={<VisitorHome />} />
          <Route path="explore" element={<VisitorPage />} />
          <Route path="surveys" element={<VisitorSurveys />} />
          <Route path="notifications" element={<VisitorNotifications />} />
          <Route path="toolkit" element={<VisitorToolkit />} />
          <Route path="profile" element={<Navigate to="/visitor/toolkit" replace />} />
          <Route path="profile/edit" element={<VisitorProfileEditPage />} />
        </Route>

        <Route path="/dashboard/owner" element={<Navigate to="/owner/dashboard" replace />} />
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute
              roles={["owner", "admin"]}
              element={<OwnerLayout />}
            />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-business" element={<MyBusiness />} />
          <Route path="explore" element={<ExploreOwner />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={["admin"]} element={<AdminDashboard />} />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/o/:slug" element={<PublicOwnerProfile />} />
        <Route path="/owner/me/edit" element={<ProtectedRoute roles={["owner"]} element={<EditOwnerProfile />} />} />
  <Route path="/v/:slug" element={<PublicVisitorProfile />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Frame />
      </Router>
    </AuthProvider>
  );
}

export default App;
