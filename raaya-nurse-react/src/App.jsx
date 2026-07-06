import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard';
import Patients from './Patients';
import Calendar from './Calendar';
import Earnings from './Earnings';
import './index.css';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/earnings" element={<Earnings />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
