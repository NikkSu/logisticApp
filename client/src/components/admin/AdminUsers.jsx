import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const res = await fetch("http://localhost:8080/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (e) {
            console.error("Ошибка загрузки пользователей:", e);
        }
    }

    async function changeRole(id, role) {
        try {
            await fetch(`http://localhost:8080/api/admin/users/${id}/role?role=${role}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            loadUsers();
            setSelected(null);
        } catch (e) {
            console.error("Ошибка изменения роли:", e);
        }
    }

    async function deleteUser(id) {
        if (!window.confirm("Удалить этого пользователя?")) return;

        try {
            await fetch(`http://localhost:8080/api/admin/users/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            loadUsers();
        } catch (e) {
            console.error("Ошибка удаления пользователя:", e);
        }
    }

    return (
        <div className="admin-users-page">
            <h2 className="page-title">Пользователи</h2>

            <div className="users-grid">
                {users.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-header">
                            <h3>{user.username}</h3>
                            <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                {user.role}
                            </span>
                        </div>

                        <p className="email">{user.email}</p>

                        <div className="card-actions">
                            <button className="btn primary" onClick={() => setSelected(user)}>
                                Управление
                            </button>
                            <button className="btn danger" onClick={() => deleteUser(user.id)}>
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* МОДАЛКА */}
            {selected && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <button className="modal-close" onClick={() => setSelected(null)}>×</button>

                        <h3>Управление пользователем</h3>
                        <p className="modal-username">{selected.username}</p>

                        <div className="modal-actions-block">
                            <p>Изменить роль:</p>

                            <button
                                className="btn ghost"
                                onClick={() => changeRole(selected.id, "USER")}
                            >
                                USER
                            </button>
                            <button
                                className="btn primary"
                                onClick={() => changeRole(selected.id, "ADMIN")}
                            >
                                ADMIN
                            </button>
                        </div>

                        <button
                            className="btn danger full-width"
                            onClick={() => deleteUser(selected.id)}
                        >
                            Удалить пользователя
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
