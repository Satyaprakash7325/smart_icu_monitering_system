import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Monitor from './pages/Monitor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitor" element={<Monitor />} />
      </Routes>
    </Router>
  );
}

export default App;
