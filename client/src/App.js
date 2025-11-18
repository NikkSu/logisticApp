import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/AuthPage";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import OAuthSuccess from "./components/OAuthSuccess";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/auth" />} />
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} /> {/* <── вот это */}
            </Routes>
        </Router>
    );
}
