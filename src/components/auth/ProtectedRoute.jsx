// src/components/auth/ProtectedRoute.jsx

// Gatekeeper component that wraps a route and redirects to login if not authenticated

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        // Still checking session -> show neutral splash
        return (
            <div className=" flex items-cmin-h-screenenter justify-center">
                Loading...
            </div>
        );
    }

    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />

    // Logged in -> render the protected component
    return children;
}