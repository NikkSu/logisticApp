import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");

    const [createModal, setCreateModal] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: "",
        message: "",
        userId: null
    });

    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadNotifications();
        loadUsers();
    }, []);

    const loadNotifications = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/admin/notifications", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(await res.json());
    };

    const loadUsers = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(await res.json());
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("Удалить уведомление?")) return;

        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/admin/notifications/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const createNotification = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/admin/notifications/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newNotification)
        });

        if (res.ok) {
            const created = await res.json();
            setNotifications(prev => [...prev, created]);
            setCreateModal(false);
        } else {
            alert("Ошибка создания уведомления");
        }
    };

    const filtered = notifications.filter(n =>
        n.message.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-users-layout">
            <div className="admin-header">
                <h2 className="admin-title">Уведомления</h2>
                <p className="admin-subtitle">Просмотр логов и отправка собственных уведомлений</p>
            </div>

            <div className="admin-actions-top">
                <input
                    className="admin-search"
                    placeholder="Поиск по тексту..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    className="admin-btn"
                    onClick={() => {
                        setNewNotification({ title: "", message: "", userId: null });
                        setCreateModal(true);
                    }}
                >
                    + Создать уведомление
                </button>
            </div>

            <div className="admin-scrollable">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Текст</th>
                            <th>Пользователь</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="admin-no-results">
                                    Ничего не найдено
                                </td>
                            </tr>
                        ) : (
                            filtered.map(n => (
                                <tr key={n.id}>
                                    <td>{n.id}</td>
                                    <td>{n.message}</td>
                                    <td>{n.userId ? n.username : "Все"}</td>


                                    <td className="admin-actions">
                                        <button
                                            className="admin-btn-danger"
                                            onClick={() => deleteNotification(n.id)}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {createModal && (
                <div className="modal-overlay" onClick={() => setCreateModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Создать уведомление</h3>


                        <textarea
                            className="modal-select"
                            placeholder="Сообщение"
                            style={{ height: "120px", resize: "none" }}
                            value={newNotification.message}
                            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                        />

                        <select
                            className="modal-select"
                            value={newNotification.userId ?? ""}
                            onChange={(e) =>
                                setNewNotification({ ...newNotification, userId: e.target.value || null })
                            }
                        >
                            <option value="">Отправить всем</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.email})
                                </option>
                            ))}
                        </select>

                        <div className="modal-actions">
                            <button className="admin-btn" onClick={() => setCreateModal(false)}>
                                Отмена
                            </button>
                            <button className="admin-btn" onClick={createNotification}>
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}