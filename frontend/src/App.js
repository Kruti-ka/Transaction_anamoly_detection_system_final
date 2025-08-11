import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardPage from './pages/DashboardPage';
import AnomalyListPage from './pages/AnomalyListPage';
import NetworkPage from './pages/NetworkPage';
import MonitorPage from './pages/MonitorPage';
import ErrorBoundary from './components/ErrorBoundary';
import { apiService } from './services/api';

function App() {
  const handleRunDetection = async () => {
    try {
      const response = await apiService.runDetection();
      toast.success(response.message);
    } catch (err) {
      toast.error('Failed to run detection: ' + err.message);
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b p-4">
              <div className="container mx-auto flex justify-between items-center">
                <div className="space-x-4">
                  <Link to="/" className="text-lg font-semibold hover:text-primary">Dashboard</Link>
                  <Link to="/anomalies" className="text-lg font-semibold hover:text-primary">Anomalies</Link>
                  <Link to="/network" className="text-lg font-semibold hover:text-primary">Network</Link>
                  <Link to="/monitor" className="text-lg font-semibold hover:text-primary">Monitor</Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={handleRunDetection}>
                    Run Detection
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </nav>
            <main className="container mx-auto p-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/anomalies" element={<AnomalyListPage />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/monitor" element={<MonitorPage />} />
              </Routes>
            </main>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;