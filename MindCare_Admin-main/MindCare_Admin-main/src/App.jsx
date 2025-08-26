import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/custom/Sidebar';
import Therapist from './components/custom/Therapist';
import Treatments from './components/custom/Treatments';
import Customers from './components/custom/Customers';
import Appointments from './components/custom/Appointments';
import Login from './components/custom/Login'; // Import your Login component
import { Toaster } from 'sonner';
import { isAuthenticated } from './utils/auth'; // Import auth utility

// Create a QueryClient instance
const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // Wrap the app in QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: { fontSize: '16px', padding: '16px' },
          success: { icon: '✅', style: { fontWeight: 'bold' } },
          error: { icon: '❌', style: { fontWeight: 'bold' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 p-4 ml-56">
                    < Therapist /> {/* Add your dashboard content */}
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/therapist"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 p-4 ml-56">
                    <Therapist />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatments"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 p-4 ml-56">
                    <Treatments />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 p-4 ml-56">
                    <Appointments />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 p-4 ml-56">
                    <Customers />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect to login for any other route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;