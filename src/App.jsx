import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Home from './Pages/Home';

function App() {
  return (
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Add more routes as needed */}
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;