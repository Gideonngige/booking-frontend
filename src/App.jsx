import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import Layout from './Components/Layout';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/Forgotpassword';
import CreateEvent from './Pages/Create-event';
import CreatorDashboard from './Pages/Creator-dashboard';
import AdminDashboard from './Pages/Admin-dashboard';
import EventDetail from './Pages/EventDetail';
import VerifyTickets from './Pages/VerifyTickets';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/creator-dashboard" element={<ProtectedRoute requiredRole="organizer"><CreatorDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/verify-tickets/:eventId" element={<ProtectedRoute requiredRole="organizer"><VerifyTickets /></ProtectedRoute>} />

        {/* Add more routes as needed */}
      </Routes>
      </Layout>
    </Router>
    </AuthProvider>
  );
}

export default App;