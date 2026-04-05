import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import AgentAnalytics from './pages/AgentAnalytics';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// Component to handle background switching
const BackgroundController = () => {
    const location = useLocation();

    useEffect(() => {
        const body = document.body;
        // Check if path is login, register, or root
        if (['/', '/login', '/register'].includes(location.pathname)) {
            body.classList.remove('bg-dashboard');
            body.classList.add('bg-landing');
        } else {
            body.classList.remove('bg-landing');
            body.classList.add('bg-dashboard');
        }
    }, [location]);

    return null;
};

function App() {
    return (
        <AuthProvider>
            <BackgroundController />
            <Routes>
                {/* Public Routes - No Layout/Sidebar */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />

                {/* Private/Protected Routes - Application Layout (Sidebar + Navbar) */}
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/new-ticket" element={<CreateTicket />} />
                    <Route path="/create-ticket" element={<CreateTicket />} />
                    <Route path="/analytics" element={<AdminDashboard />} />
                    <Route path="/agent-analytics" element={<AgentAnalytics />} />

                    <Route path="/ticket/:id" element={<TicketDetail />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<Users />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
