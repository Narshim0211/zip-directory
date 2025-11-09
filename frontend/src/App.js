import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/AdminDashboard";
import OwnerHome from "./components/OwnerHome";
import BusinessDetails from "./components/BusinessDetails";
import NavbarPublic from "./components/NavbarPublic";
import NavbarPrivate from "./components/NavbarPrivate";
import VisitorPage from "./components/VisitorPage";
import OwnerPage from "./components/OwnerPage";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import VisitorProfile from "./components/VisitorProfile";
import VisitorHome from "./components/VisitorHome";
import NewsList from "./components/NewsList";
import NewsDetail from "./components/NewsDetail";
import RecentActivity from "./components/RecentActivity";
 

function Frame() {
  const { user } = useAuth();
  return (
    <>
      {user ? <NavbarPrivate /> : <NavbarPublic />}
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/visitor" element={<VisitorPage />} />
          <Route path="/explore" element={<VisitorPage />} />
          <Route path="/recent" element={<RecentActivity />} />
          <Route path="/owner" element={<ProtectedRoute roles={["owner", "admin"]} element={<OwnerPage />} />} />
          <Route path="/owner/home" element={<ProtectedRoute roles={["owner", "admin"]} element={<OwnerHome />} />} />
          <Route path="/visitor/home" element={<ProtectedRoute roles={["visitor"]} element={<VisitorHome />} />} />
          <Route path="/dashboard/owner" element={<ProtectedRoute roles={["owner", "admin"]} element={<OwnerHome />} />} />
          <Route path="/dashboard/visitor" element={<ProtectedRoute roles={["visitor"]} element={<VisitorHome />} />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]} element={<AdminDashboard />} />} />
          <Route path="/business/:id" element={<BusinessDetails />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute roles={["visitor","owner","admin"]} element={<VisitorProfile />} />} />
      </Routes>
    </>
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








