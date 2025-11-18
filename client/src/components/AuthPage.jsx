import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { loginUser, registerUser } from "../api/auth";

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email("Введите корректный email")
        .required("Введите email")
        .test("email-формат", "Email должен содержать символ @", (value) => value && value.includes("@")),
    password: yup.string().required("Введите пароль"),
});

const registerSchema = yup.object().shape({
    username: yup.string().min(3, "Имя должно быть не короче 3 символов").required("Введите имя пользователя"),
    email: yup.string().email("Введите корректный email").required("Введите email"),
    password: yup.string().min(6, "Минимум 6 символов").required("Введите пароль"),
});

export default function AuthForm() {
    const [mode, setMode] = useState("login"); // login | register
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const schema = mode === "login" ? loginSchema : registerSchema;
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        setErrorMessage("");

        try {
            const result =
                mode === "login" ? await loginUser(data) : await registerUser(data);

            const token = result.token;
            const payload = JSON.parse(atob(token.split(".")[1]));

            const role = payload.role || "USER";

            if (role === "ADMIN") {
                navigate("/dashboard?admin=true");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            console.error("Ошибка:", error);
            setErrorMessage(error.message || "Ошибка при запросе к серверу");
        }
    };



    return (
        <div className="auth-container">
            {/* === Тоггл === */}
            <div className="auth-toggle">
                <div className={`toggle-indicator ${mode === "register" ? "right" : ""}`}></div>
                <div
                    className={`toggle-btn ${mode === "login" ? "active" : ""}`}
                    onClick={() => setMode("login")}
                >
                    Вход
                </div>
                <div
                    className={`toggle-btn ${mode === "register" ? "active" : ""}`}
                    onClick={() => setMode("register")}
                >
                    Регистрация
                </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {mode === "register" && (
                    <div className="auth-input-group">
                        <input
                            className={`auth-input ${errors.username ? "error" : ""}`}
                            placeholder="Имя пользователя"
                            {...register("username")}
                        />
                        <p className="auth-error">{errors.username?.message || "\u00A0"}</p>
                    </div>
                )}

                <div className="auth-input-group">
                    <input
                        className={`auth-input ${errors.email ? "error" : ""}`}
                        placeholder="Email"
                        type="email"
                        {...register("email")}
                    />
                    <p className="auth-error">{errors.email?.message || "\u00A0"}</p>
                </div>

                <div className="auth-input-group">
                    <input
                        className={`auth-input ${errors.password ? "error" : ""}`}
                        placeholder="Пароль"
                        type="password"
                        {...register("password")}
                    />
                    <p className="auth-error">{errors.password?.message || "\u00A0"}</p>
                </div>

                <button type="submit" className="auth-submit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M10 17l5-5-5-5v10z" />
                    </svg>
                </button>

                {/* OAuth-кнопки */}
                <button
                    type="button"
                    className="social-btn discord"
                    onClick={() =>
                        (window.location.href = "http://localhost:8080/oauth2/authorization/discord")
                    }
                >
                    <img src="/images/discord.svg" alt="Discord" />
                </button>
                <button
                    type="button"
                    className="social-btn google"
                    onClick={() =>
                        (window.location.href = "http://localhost:8080/oauth2/authorization/google")
                    }
                >
                    <img src="/images/google.svg" alt="Google" />
                </button>

                {mode === "login" && (
                    <p className="forgot-password" onClick={() => navigate("/forgot-password")}>
                        Забыли пароль?
                    </p>
                )}

                {/* Ошибка от сервера */}
                {errorMessage && <div className="auth-server-error">{errorMessage}</div>}
            </form>
        </div>
    );
}
