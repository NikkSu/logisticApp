import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");

    const [editModal, setEditModal] = useState(false);
    const [selected, setSelected] = useState(null);

    const [editData, setEditData] = useState({
        name: "",
        address: "",
        description: ""
    });

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/companies/", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            setCompanies(await res.json());
        }
    };

    const openEdit = (c) => {
        setSelected(c);
        setEditData({
            name: c.name,
            address: c.address,
            description: c.description
        });
        setEditModal(true);
    };

    const saveUpdate = async () => {
        const token = localStorage.getItem("token");

        await fetch(`http://localhost:8080/api/companies/${selected.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(editData)
        });

        setEditModal(false);
        loadCompanies();
    };

    const deleteCompany = async (id) => {
        if (!window.confirm("Удалить компанию?")) return;

        const token = localStorage.getItem("token");

        await fetch(`http://localhost:8080/api/companies/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        loadCompanies();
    };

    const filtered = companies.filter(c =>
        (c.name || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-users-layout">

            {/* HEADER */}
            <div className="admin-header">
                <h2 className="admin-title">Компании</h2>
                <p className="admin-subtitle">Управление компаниями поставщиков</p>
            </div>

            {/* SEARCH */}
            <div className="admin-actions-top">
                <input
                    className="admin-search"
                    placeholder="Поиск по названию..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* TABLE */}
            <div className="admin-scrollable">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Адрес</th>
                            <th>Владелец</th>
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
                            filtered.map(c => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.name}</td>
                                    <td>{c.address}</td>
                                    <td>{c.ownerName || "—"}</td>

                                    <td className="admin-actions">
                                        <button
                                            className="admin-btn"
                                            onClick={() => openEdit(c)}
                                        >
                                            Редактировать
                                        </button>

                                        <button
                                            className="admin-btn-danger"
                                            onClick={() => deleteCompany(c.id)}
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

            {/* EDIT MODAL */}
            {editModal && (
                <div className="modal-overlay" onClick={() => setEditModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Изменение компании</h3>

                        <input
                            className="modal-select"
                            placeholder="Название"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />

                        <input
                            className="modal-select"
                            placeholder="Адрес"
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        />

                        <textarea
                            className="modal-select"
                            rows="4"
                            placeholder="Описание"
                            value={editData.description}
                            onChange={(e) =>
                                setEditData({ ...editData, description: e.target.value })
                            }
                        />

                        <div className="modal-actions">
                            <button className="admin-btn" onClick={() => setEditModal(false)}>
                                Отмена
                            </button>

                            <button className="admin-btn" onClick={saveUpdate}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
