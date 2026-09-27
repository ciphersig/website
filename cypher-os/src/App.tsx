import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Events } from './pages/Events';
import { Academy } from './pages/Academy';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/about"
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />
          <Route
            path="/events"
            element={
              <MainLayout>
                <Events />
              </MainLayout>
            }
          />
          <Route
            path="/academy"
            element={
              <MainLayout>
                <Academy />
              </MainLayout>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </Router>
  );
};

export default App;
