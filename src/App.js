import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import FeedbackForm from './pages/public/FeedbackForm';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={token
            ? <RecruiterDashboard />
            : <Navigate to="/login" />}
        />
        <Route
          path="/feedback/:token"
          element={<FeedbackForm />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;