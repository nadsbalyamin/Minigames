// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PhysicsGame from './components/PhysicsGame';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/car-sim" element={<PhysicsGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
