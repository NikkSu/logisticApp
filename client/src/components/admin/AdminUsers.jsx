import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [editModal, setEditModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [newRole, setNewRole] = useState("");

    const [createModal, setCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        role: "USER"
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setUsers(await res.json());
        }
    };

    /** ---------------------------
     *   ФИЛЬТР ПОИСКА + ФИЛЬТР РОЛИ
     ------------------------------*/
    const filtered = users
        .filter(u =>
            filter === "ALL" ? true : u.role === filter
        )
        .filter(u => {
            if (search.trim() === "") return true;
            const s = search.toLowerCase();
            return (
                (u.username || "").toLowerCase().includes(s) ||
                (u.email || "").toLowerCase().includes(s) ||
                (u.role || "").toLowerCase().includes(s)
            );
        });

    const openEdit = (u) => {
        setSelected(u);
        setNewRole(u.role);
        setEditModal(true);
    };

    const saveRole = async () => {
        const token = localStorage.getItem("token");
        await fetch(
            `http://localhost:8080/api/admin/users/${selected.id}/role?role=${newRole}`,
            {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setEditModal(false);
        loadUsers();
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Удалить пользователя?")) return;
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        loadUsers();
    };

    const createUser = async () => {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:8080/api/admin/users/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newUser)
        });

        setCreateModal(false);
        setNewUser({ username: "", email: "", role: "USER" });
        loadUsers();
    };

    return (
        <div className="admin-users-layout">

            {/* HEADER */}
            <div className="admin-header">
                <h2 className="admin-title">Пользователи системы</h2>
                <p className="admin-subtitle">Управление аккаунтами, ролями и активностью</p>
            </div>

            {/* STATS */}
            <div className="admin-stats">
                <div
                    className={`admin-stat-card ${filter === "ALL" ? "active-card" : ""}`}
                    onClick={() => setFilter("ALL")}
                >
                    <div className="admin-stat-value">{users.length}</div>
                    <div className="admin-stat-label">Всего</div>
                </div>

                <div
                    className={`admin-stat-card ${filter === "ADMIN" ? "active-card" : ""}`}
                    onClick={() => setFilter("ADMIN")}
                >
                    <div className="admin-stat-value">
                        {users.filter(u => u.role === "ADMIN").length}
                    </div>
                    <div className="admin-stat-label">Администраторы</div>
                </div>

                <div
                    className={`admin-stat-card ${filter === "USER" ? "active-card" : ""}`}
                    onClick={() => setFilter("USER")}
                >
                    <div className="admin-stat-value">
                        {users.filter(u => u.role === "USER").length}
                    </div>
                    <div className="admin-stat-label">Пользователи</div>
                </div>

                <div
                    className={`admin-stat-card ${filter === "SUPPLIER" ? "active-card" : ""}`}
                    onClick={() => setFilter("SUPPLIER")}
                >
                    <div className="admin-stat-value">
                        {users.filter(u => u.role === "SUPPLIER").length}
                    </div>
                    <div className="admin-stat-label">Поставщики</div>
                </div>
            </div>

            {/* SEARCH + CREATE */}
            <div className="admin-actions-top"
                 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <input
                    className="admin-search"
                    placeholder="Поиск по имени или email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button className="admin-btn" onClick={() => setCreateModal(true)}>
                    + Создать пользователя
                </button>
            </div>

            {/* TABLE WITH SCROLL */}
            <div className="admin-table-scroll">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Роль</th>
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
                            filtered.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>

                                    <td className="admin-actions">
                                        <button className="admin-btn" onClick={() => openEdit(u)}>
                                            Изменить
                                        </button>
                                        <button className="admin-btn-danger" onClick={() => deleteUser(u.id)}>
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

            {/* EDIT MODAL */}
            {editModal && selected && (
                <div className="modal-overlay" onClick={() => setEditModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Редактирование пользователя</h3>

                        <p><b>ID:</b> {selected.id}</p>
                        <p><b>Имя:</b> {selected.username}</p>
                        <p><b>Email:</b> {selected.email}</p>

                        <select
                            className="modal-select"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPPLIER">SUPPLIER</option>
                        </select>

                        <div className="modal-actions">
                            <button className="admin-btn" onClick={saveRole}>
                                Сохранить
                            </button>
                            <button className="admin-btn-danger" onClick={() => setEditModal(false)}>
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {createModal && (
                <div className="modal-overlay" onClick={() => setCreateModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Создать пользователя</h3>

                        <input
                            className="modal-select"
                            placeholder="Имя"
                            value={newUser.username}
                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                        />

                        <input
                            className="modal-select"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        />

                        <select
                            className="modal-select"
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPPLIER">SUPPLIER</option>
                        </select>

                        <div className="modal-actions">
                            <button className="admin-btn" onClick={createUser}>
                                Создать
                            </button>
                            <button className="admin-btn-danger" onClick={() => setCreateModal(false)}>
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
