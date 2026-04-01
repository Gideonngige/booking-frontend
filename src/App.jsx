import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ForgotPassword from './Pages/Forgotpassword';
import CreateEvent from './Pages/Create-event';
import CreatorDashboard from './Pages/Creator-dashboard';

function App() {
  return (
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/creator-dashboard" element={<CreatorDashboard />} />
        
        {/* Add more routes as needed */}
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;