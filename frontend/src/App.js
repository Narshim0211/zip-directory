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
import ToolkitPage from "./features/toolkit/pages/ToolkitPage";
import StyleAdvisorPage from "./features/toolkit/pages/StyleAdvisorPage";
import HairGoalsPage from "./features/toolkit/pages/HairGoalsPage";
import TimeManagerToolkitPage from "./features/toolkit/pages/TimeManagerToolkitPage";
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
import OwnerProfilePageV2 from "./pages/OwnerProfilePageV2";
import EditOwnerProfile from "./pages/EditOwnerProfile";
import PublicVisitorProfile from "./pages/PublicVisitorProfile";
import VisitorProfilePageV2 from "./pages/VisitorProfilePageV2";
import VisitorProfilePage from "./pages/VisitorProfilePage";
import ErrorBoundary from "./components/Shared/ErrorBoundary";
import "./App.css";
import TimeManagerPage from "./features/timeManager/pages/TimeManagerPage";
import TimeManagerOwnerPage from "./features/timeManager/pages/owner/TimeManagerOwnerPage";
import OwnerProfilePage from "./pages/owner/Profile";
import OwnerBookingManager from "./pages/owner/BookingManager";
import MicroservicesRoutes from "./routes/MicroservicesRoutes";

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
          <Route path="toolkit">
            <Route index element={<ToolkitPage />} />
            <Route path="time/*" element={<TimeManagerToolkitPage />} />
            <Route path="style-advisor" element={<StyleAdvisorPage />} />
            <Route path="goals" element={<HairGoalsPage />} />
          </Route>
          <Route path="profile" element={<VisitorProfilePage />} />
          <Route path="profile/edit" element={<VisitorProfileEditPage />} />
          <Route path="time/*" element={<TimeManagerPage />} />
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
          <Route path="profile/me" element={<OwnerProfilePage />} />
          <Route path="time/*" element={<TimeManagerOwnerPage />} />
          <Route path="booking" element={<OwnerBookingManager />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={["admin"]} element={<AdminDashboard />} />} />
        <Route path="/business/:id" element={<BusinessDetails />} />

        {/* Microservices Routes - Protected for all authenticated users */}
        <Route 
          path="/microservices/*" 
          element={
            <ProtectedRoute 
              roles={["owner", "visitor", "admin"]} 
              element={<MicroservicesRoutes />} 
            />
          } 
        />

        {/* V2 Profile Routes - Facebook Style */}
        <Route path="/o/:slug" element={<OwnerProfilePageV2 />} />
        <Route path="/v/:slug" element={<VisitorProfilePageV2 />} />

        {/* Legacy Profile Routes (for reference) */}
        <Route path="/o-legacy/:slug" element={<PublicOwnerProfile />} />
        <Route path="/v-legacy/:slug" element={<PublicVisitorProfile />} />

        {/* Edit Profile Routes */}
        <Route path="/owner/me/edit" element={<ProtectedRoute roles={["owner"]} element={<EditOwnerProfile />} />} />
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
