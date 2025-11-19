import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/AdminDashboard";
import BusinessDetails from "./components/BusinessDetails";
import VisitorPage from "./visitor/pages/VisitorExplore";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ToolkitPage from "./features/toolkit/pages/ToolkitPage";
import StyleAdvisorPage from "./features/toolkit/pages/StyleAdvisorPage";
import HairGoalsPage from "./features/toolkit/pages/HairGoalsPage";
import HairGoalsPhotoTimelinePage from "./features/toolkit/pages/HairGoalsPhotoTimelinePage";
import WeeklyReportPage from "./features/toolkit/pages/WeeklyReportPage";
import HairGoalsJourneyHistoryPage from "./features/toolkit/pages/HairGoalsJourneyHistoryPage";
import HairGoalsJourneyDetailPage from "./features/toolkit/pages/HairGoalsJourneyDetailPage";
import TimeManagerToolkitPage from "./features/toolkit/pages/TimeManagerToolkitPage";
import VisitorProfileEditPage from "./visitor/pages/VisitorProfileEditPage";
import VisitorHome from "./visitor/pages/VisitorHome";
import VisitorFeedback from "./visitor/pages/VisitorFeedback";
import NewsList from "./components/NewsList";
import NewsDetail from "./components/NewsDetail";
import RecentActivity from "./components/RecentActivity";
import VisitorNotifications from "./visitor/pages/VisitorNotifications";
import VisitorSurveys from "./visitor/pages/VisitorSurveys";
import OwnerLayout from "./layouts/OwnerLayout";
import VisitorLayout from "./visitor/layouts/VisitorLayout";
import Dashboard from "./pages/owner/Dashboard";
import OwnerHome from "./pages/owner/OwnerHome";
import MyBusiness from "./pages/owner/MyBusiness";
import ExploreOwner from "./pages/owner/ExploreOwner";
import Surveys from "./pages/owner/Surveys";
import Notifications from "./pages/owner/Notifications";
import PublicLayout from "./layouts/PublicLayout";
import PublicOwnerProfile from "./pages/PublicOwnerProfile";
import OwnerProfilePageV2 from "./pages/OwnerProfilePageV2";
import EditOwnerProfile from "./pages/EditOwnerProfile";
import DirectorySearchResults from "./pages/public/DirectorySearchResults";
import VisitorBusinessProfile from "./pages/visitor/BusinessProfile";
import PublicVisitorProfile from "./pages/PublicVisitorProfile";
import VisitorProfilePageV2 from "./pages/VisitorProfilePageV2";
import VisitorProfilePage from "./pages/VisitorProfilePage";
import ErrorBoundary from './components/SharedComponents/ErrorBoundary';
import "./App.css";
import TimeManagerPage from "./features/timeManager/pages/TimeManagerPage";
import TimeManagerOwnerPage from "./features/timeManager/pages/owner/TimeManagerOwnerPage";
import OwnerProfilePage from "./pages/owner/Profile";
import BookingPublicProfile from "./pages/owner/BookingPublicProfile";
import OwnerBookingManager from "./pages/owner/BookingManager";
import StaffManagement from "./pages/owner/StaffManagement";
import OwnerFeedback from "./pages/owner/OwnerFeedback";
import PublicProfile from "./pages/PublicProfile";
import PublicBooking from "./pages/PublicBooking";
import MicroservicesRoutes from "./routes/MicroservicesRoutes";
import VisitorNewsletterSettings from "./visitor/pages/VisitorNewsletterSettings";
import OwnerNewsletterSettings from "./pages/owner/OwnerNewsletterSettings";

const LandingOrRedirect = () => {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  if (user.role === "visitor") return <Navigate to="/visitor/home" replace />;
  if (user.role === "owner") return <Navigate to="/owner/home" replace />;
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
          
          {/* Public Booking Profile & Booking Pages */}
          <Route path="/profile/:slug" element={<PublicProfile />} />
          <Route path="/book/:slug" element={<PublicBooking />} />
          
          {/* Public Directory Search Results (Search form is on landing page) */}
          <Route path="/directory/search" element={<DirectorySearchResults />} />
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
          <Route path="business/:id" element={<VisitorBusinessProfile />} />
          <Route path="surveys" element={<VisitorSurveys />} />
          <Route path="notifications" element={<VisitorNotifications />} />
          <Route path="feedback" element={<VisitorFeedback />} />
          <Route path="settings/newsletter" element={<VisitorNewsletterSettings />} />
            <Route path="toolkit">
              <Route index element={<ToolkitPage />} />
              <Route path="time/*" element={<TimeManagerToolkitPage />} />
              <Route path="style-advisor" element={<StyleAdvisorPage />} />
              <Route path="goals" element={<HairGoalsPage />} />
              <Route path="goals/photos" element={<HairGoalsPhotoTimelinePage />} />
              <Route path="goals/history" element={<HairGoalsJourneyHistoryPage />} />
              <Route path="goals/history/:journeyId" element={<HairGoalsJourneyDetailPage />} />
              <Route path="goals/report/:reportId" element={<WeeklyReportPage />} />
            </Route>
          <Route path="profile" element={<VisitorProfilePage />} />
          <Route path="profile/edit" element={<VisitorProfileEditPage />} />
          <Route path="time/*" element={<TimeManagerPage />} />
        </Route>

        <Route path="/dashboard/owner" element={<Navigate to="/owner/dashboard" replace />} />
        <Route
          path="/owner/*"
          element={
            <ErrorBoundary fallbackTitle="Owner Dashboard Error" fallbackMessage="There was an error loading the owner dashboard. Other sections should still work.">
              <ProtectedRoute
                roles={["owner", "admin"]}
                element={<OwnerLayout />}
              />
            </ErrorBoundary>
          }
        >
          <Route index element={<ErrorBoundary><OwnerHome /></ErrorBoundary>} />
          <Route path="home" element={<ErrorBoundary><OwnerHome /></ErrorBoundary>} />
          <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="my-business" element={<ErrorBoundary><MyBusiness /></ErrorBoundary>} />
          <Route path="explore" element={<ErrorBoundary><ExploreOwner /></ErrorBoundary>} />
          <Route path="surveys" element={<ErrorBoundary><Surveys /></ErrorBoundary>} />
          <Route path="notifications" element={<ErrorBoundary><Notifications /></ErrorBoundary>} />
          <Route path="profile/me" element={<ErrorBoundary><OwnerProfilePage /></ErrorBoundary>} />
          <Route path="booking/public-profile" element={<ErrorBoundary fallbackTitle="Booking Profile Error"><BookingPublicProfile /></ErrorBoundary>} />
          <Route path="booking/staff" element={<ErrorBoundary><StaffManagement /></ErrorBoundary>} />
          <Route path="time/*" element={<ErrorBoundary><TimeManagerOwnerPage /></ErrorBoundary>} />
          <Route path="booking" element={<ErrorBoundary><OwnerBookingManager /></ErrorBoundary>} />
          <Route path="feedback" element={<ErrorBoundary><OwnerFeedback /></ErrorBoundary>} />
          <Route path="settings/newsletter" element={<ErrorBoundary><OwnerNewsletterSettings /></ErrorBoundary>} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={["admin"]} element={<AdminDashboard />} />} />
        <Route path="/business/:id" element={<BusinessDetails />} />

        {/* Microservices Routes - Protected for all authenticated users */}
        <Route 
          path="/microservices/*" 
          element={
            <ErrorBoundary fallbackTitle="Service Error" fallbackMessage="This service is temporarily unavailable.">
              <ProtectedRoute 
                roles={["owner", "visitor", "admin"]} 
                element={<MicroservicesRoutes />} 
              />
            </ErrorBoundary>
          } 
        />

        {/* V2 Profile Routes - Facebook Style */}
        <Route path="/o/:slug" element={<ErrorBoundary><OwnerProfilePageV2 /></ErrorBoundary>} />
        <Route path="/v/:slug" element={<ErrorBoundary><VisitorProfilePageV2 /></ErrorBoundary>} />

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
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Frame />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
