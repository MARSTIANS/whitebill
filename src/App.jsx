import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Home from './Home';

function App() {
  const [role, setRole] = useState(null); // State to store user role

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setRole={setRole} />} /> {/* Pass setRole to Login */}
        <Route path="/home/*" element={<Home role={role} />} /> {/* Pass role to Home */}
      </Routes>
    </Router>
  );
}

export default App;
