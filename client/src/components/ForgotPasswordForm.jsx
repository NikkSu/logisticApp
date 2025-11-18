import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("⏳ Отправка...");
        try {
            const res = await axios.post("http://localhost:8080/api/auth/reset-password", { email });
            setMessage("✅ " + res.data.message);
        } catch (err) {
            const msg = err.response?.data?.error || "⚠️ Ошибка: не удалось отправить письмо";
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>Восстановление пароля</h2>

            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    className="auth-input"
                    placeholder="Введите свой Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <button type="submit" className="auth-submit" disabled={loading}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M10 17l5-5-5-5v10z" />
                    </svg>
                </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            {/* === Кнопка "Назад" === */}
            <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/auth")}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                <span>Назад</span>
            </button>
        </div>
    );
}
