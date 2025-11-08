import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/AdminDashboard";
import OwnerDashboard from "./components/OwnerDashboard";
import BusinessDetails from "./components/BusinessDetails";
import NavBar from "./components/NavBar";
import VisitorPage from "./components/VisitorPage";
import OwnerPage from "./components/OwnerPage";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/visitor" element={<VisitorPage />} />
          <Route path="/owner" element={<ProtectedRoute roles={["owner", "admin"]} element={<OwnerPage />} />} />
          <Route path="/dashboard/owner" element={<ProtectedRoute roles={["owner", "admin"]} element={<OwnerDashboard />} />} />
          <Route path="/dashboard/visitor" element={<ProtectedRoute roles={["visitor", "owner", "admin"]} element={<VisitorPage />} />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]} element={<AdminDashboard />} />} />
          <Route path="/business/:id" element={<BusinessDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
