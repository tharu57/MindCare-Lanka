import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './components/custom/Home';
import About from './components/custom/About';
import Contact from './components/custom/contact';
import Doctors from './components/custom/Doctorslist';
import Treatments from './components/custom/Treatments';
import Appointments from './components/custom/Appointments';
import Navbar from './components/custom/Navbar';
import DoctorInfo from './components/custom/DoctorInfo';
import Footer from './components/custom/Footer';
import TreatmentInfo from './components/custom/TreatmentInfo';
import { Toaster } from 'sonner';
import ChatbotSheet from './components/custom/Chatbot';
import Chatbot from './components/custom/Chatbot';
import { AuthProvider } from './contexts/AuthContext';
// Create a QueryClient instance
const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: { fontSize: '16px', padding: '16px' },
            success: { icon: '✅', style: { fontWeight: 'bold' } },
            error: { icon: '❌', style: { fontWeight: 'bold' } },
          }}
        />
        <Router>
          <div className="App">
            <Navbar />
            <main className="container mx-auto bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/treatments" element={<Treatments />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/doctors/:id" element={<DoctorInfo />} />
                <Route path="/treatments/:id" element={<TreatmentInfo />} />
              </Routes>
            </main>
            <Chatbot />
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;