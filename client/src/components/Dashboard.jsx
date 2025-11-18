import React, { useState, useEffect } from "react";
import { Menu, X, Home, Package, Truck, BarChart3, User, LogOut, Building2, MailPlus, Bell,  } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/dashboard.css";
import Profile from "./Profile";
import Orders from "./Orders";
import AnalyticsPie from "./AnalyticsPie";
import AdminCompanies from "./admin/AdminCompanies";
import AdminNotifications from "./admin/AdminNotifications";
import AdminOrders from "./admin/AdminOrders";
import AdminSupplierRequests from "./admin/AdminSupplierRequests";
import AdminSuppliers from "./admin/AdminSuppliers";
import AdminUsers from "./admin/AdminUsers";

function safeDecodeJWT(token) {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.warn("JWT decode failed:", e);
        return null;
    }
}

export default function Dashboard() {
    const [notifications, setNotifications] = useState([]);
    const [username, setUsername] = useState("Пользователь");
    const [greeting, setGreeting] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("home");
    const [orderStats, setOrderStats] = useState(null);
    const [role, setRole] = useState(null);
    const [orderError, setOrderError] = useState(null);


    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Доброе утро");
        else if (hour < 18) setGreeting("Добрый день");
        else setGreeting("Добрый вечер");

        const token = localStorage.getItem("token");
        if (!token) {
            setUsername("Гость");
            return;
        }

        const decoded = safeDecodeJWT(token);
        if (decoded?.username) {
            setUsername(decoded.username);
        }
        if (decoded?.role) {
            setRole(decoded.role);
        }
        // fallback: запрос к /api/users/me
        fetch("http://localhost:8080/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setUsername(data.username || data.email || "Пользователь");
                setRole(data.role || "USER");
                console.log(username, role)

            })
            .catch(() => {});
    }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        async function fetchNotifications() {
            try {
                const res = await fetch("http://localhost:8080/api/notifications", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setNotifications(await res.json());
            } catch {}
        }

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);

        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setOrderError("Вы не авторизованы.");
            return;
        }

        async function loadStats() {
            try {
                const res = await fetch("http://localhost:8080/api/orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    setOrderStats({
                        total: 0,
                        created: 0,
                        sent: 0,
                        received: 0,
                        cancelled: 0
                    });
                    return;
                }


                const orders = await res.json();

                if (!Array.isArray(orders) || orders.length === 0) {
                    setOrderStats({
                        total: 0,
                        created: 0,
                        sent: 0,
                        received: 0,
                        cancelled: 0
                    });
                    return;
                }

                const stats = {
                    total: orders.length,
                    created: orders.filter(o => o.status === "CREATED").length,
                    sent: orders.filter(o => o.status === "SENT").length,
                    received: orders.filter(o => o.status === "RECEIVED").length,
                    cancelled: orders.filter(o => o.status === "CANCELLED").length,
                };

                setOrderStats(stats);

            } catch (e) {
                console.error("Ошибка загрузки статистики", e);
                setOrderError("Произошла ошибка при загрузке данных.");
            }
        }

        loadStats();
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };
    const adminItems = [
        { key: "admin_users", label: "Пользователи", icon: <User size={18} /> },
        { key: "admin_companies", label: "Компании", icon: <Building2 size={18} /> },
        { key: "admin_suppliers", label: "Поставщики", icon: <Truck size={18} /> },
        { key: "admin_requests", label: "Заявки поставщиков", icon: <MailPlus size={18} /> },
        { key: "admin_orders", label: "Заказы", icon: <Package size={18} /> },
        { key: "admin_notifications", label: "Уведомления", icon: <Bell size={18} /> },
    ];
    const userItems = [
        { key: "home", label: "Главная", icon: <Home size={18} /> },
        { key: "orders", label: "Заказы", icon: <Package size={18} /> },
        { key: "suppliers", label: "Поставщики", icon: <Truck size={18} /> },
        { key: "analytics", label: "Аналитика", icon: <BarChart3 size={18} /> },
        { key: "profile", label: "Аккаунт", icon: <User size={18} /> },
    ];
    const items = role === "ADMIN"
        ? adminItems
        : userItems;
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <div className="dashboard-home">

                        <div className="analytics-small-block" onClick={() => setActiveTab("analytics")}>
                            <h3>Аналитика заказов</h3>

                            {!orderStats ? (
                                <p className="small-loader">Загрузка...</p>
                            ) : (
                                <>
                                    <div className="small-stats">
                                        <div><span>{orderStats.total}</span><label>Всего</label></div>
                                        <div><span>{orderStats.created}</span><label>Создано</label></div>
                                        <div><span>{orderStats.sent}</span><label>Отправлено</label></div>
                                        <div><span>{orderStats.received}</span><label>Получено</label></div>
                                        <div><span>{orderStats.cancelled}</span><label>Отменено</label></div>
                                    </div>

                                    <div className="small-chart-wrapper">
                                        <AnalyticsPie stats={orderStats} small />
                                    </div>
                                </>
                            )}
                        </div>

                        <p className="click-hint">Нажмите, чтобы открыть полную аналитику</p>
                    </div>
                );


            case "orders":
                return <Orders/>;
            case "suppliers":
                return <div>Список поставщиков.</div>;
            case "analytics":
                return <div>Аналитика закупок.</div>;
            case "profile":
                return <Profile onUserUpdate={(newUsername) => setUsername(newUsername)} />;
            case "admin_users":
                return <AdminUsers />;

            case "admin_companies":
                return <AdminCompanies />;

            case "admin_suppliers":
                return <AdminSuppliers />;

            case "admin_requests":
                return <AdminSupplierRequests />;

            case "admin_orders":
                return <AdminOrders />;

            case "admin_notifications":
                return <AdminNotifications />;

            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">

            <button
                className="floating-menu-btn"
                onClick={() => setMenuOpen((s) => !s)}
                aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            >
                {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>

            {/* Выпадающее меню — позиция справа от кнопки: left calc(7% + 56px) */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.aside
                        className="top-dropdown"
                        initial={{y: -250, opacity: 0}}
                        animate={{y: 0, opacity: 1}}
                        exit={{y: -250, opacity: 0}}
                        transition={{duration: 0.35, ease: "easeInOut"}}
                    >
                        <nav className="sidebar-nav">
                            {items.map(({key, label, icon}) => (
                                <motion.button
                                    key={key}
                                    className={`sidebar-btn ${activeTab === key ? "active" : ""}`}
                                    whileTap={{scale: 0.98}}
                                    onClick={() => {
                                        setActiveTab(key);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {icon}
                                    <span className="btn-label">{label}</span>
                                </motion.button>
                            ))}

                            <div style={{marginTop: 8}}>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <LogOut size={16}/> <span className="btn-label">Выйти</span>
                                </button>
                            </div>
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>
            <div className="notifications-wrapper">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            className="notification-card"
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.3}}
                        >
                            <p>{n.message}</p>
                            <button
                                className="close-btn"
                                onClick={async () => {
                                    try {
                                        await fetch(`http://localhost:8080/api/notifications/${n.id}`, {
                                            method: "DELETE",
                                            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
                                        });
                                        setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                                    } catch (e) {
                                        console.error("Ошибка при удалении уведомления:", e);
                                    }
                                }}
                            >
                                ✕
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>
                        {greeting}, <span className="username">{username}</span>!
                    </h1>
                </header>

                <motion.div
                    key={activeTab}
                    className="tab-content"
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -8}}
                    transition={{duration: 0.28}}
                >
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
}
