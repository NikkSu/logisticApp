import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token.trim().replace(/\s/g, ""));
            navigate("/dashboard");
        } else {
            navigate("/auth");
        }
    }, [navigate]);

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#8c5eff",
            fontSize: "1.3rem",
            fontWeight: "600",
        }}>
            Авторизация через OAuth...
        </div>
    );
}
