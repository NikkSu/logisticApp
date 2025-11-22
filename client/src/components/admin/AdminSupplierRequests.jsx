import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminSupplierRequests() {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("PENDING");


    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/admin/supplier-requests", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            setRequests(await res.json());
        }
    };

    const approve = async (id) => {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8080/api/admin/supplier-requests/${id}/approve`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const reject = async () => {
        const token = localStorage.getItem("token");

        await fetch(
            `http://localhost:8080/api/admin/supplier-requests/${selected.id}/reject?reason=${encodeURIComponent(rejectReason)}`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        setRequests(prev => prev.filter(r => r.id !== selected.id));
        setRejectModal(false);
        setRejectReason("");
        setSelected(null);
    };

    const filtered = requests
        .filter(r =>
            filter === "ALL" ? true : true // пока только PENDING, все заявки — pending
        )
        .filter(r =>
            (r.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.userName || "").toLowerCase().includes(search.toLowerCase())
        );


    return (
        <div className="admin-users-layout">

            {/* HEADER */}
            <div className="admin-header">
                <h2 className="admin-title">Заявки поставщиков</h2>
                <p className="admin-subtitle">Обработка запросов на роль поставщика</p>
            </div>

            {/* STATS */}
            <div className="admin-stats">
                <div
                    className={`admin-stat-card ${filter === "ALL" ? "active-card" : ""}`}
                    onClick={() => setFilter("ALL")}
                >
                    <div className="admin-stat-value">{requests.length}</div>
                    <div className="admin-stat-label">Все</div>
                </div>

                <div
                    className={`admin-stat-card ${filter === "PENDING" ? "active-card" : ""}`}
                    onClick={() => setFilter("PENDING")}
                >
                    <div className="admin-stat-value">{requests.length}</div>
                    <div className="admin-stat-label">Ожидают проверки</div>
                </div>
            </div>


            {/* SEARCH */}
            <div className="admin-actions-top">
                <input
                    className="admin-search"
                    placeholder="Поиск по имени или компании..."
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
                            <th>Пользователь</th>
                            <th>Компания</th>
                            <th>ИНН</th>
                            <th>Телефон</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="admin-no-results">Ничего не найдено</td>
                            </tr>
                        ) : (
                            filtered.map(req => (
                                <tr key={req.id}>
                                    <td>{req.id}</td>
                                    <td>{req.userName}</td>
                                    <td>{req.companyName}</td>
                                    <td>{req.inn}</td>
                                    <td>{req.phone}</td>

                                    <td className="admin-actions">
                                        <button
                                            className="admin-btn"
                                            onClick={() => approve(req.id)}
                                        >
                                            Одобрить
                                        </button>

                                        <button
                                            className="admin-btn-danger"
                                            onClick={() => {
                                                setSelected(req);
                                                setRejectReason("");
                                                setRejectModal(true);
                                            }}
                                        >
                                            Отклонить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REJECT MODAL */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Причина отклонения</h3>

                        <p style={{ color: "#ccc", marginBottom: 12 }}>
                            Заявка: <b>{selected.companyName}</b>
                        </p>

                        <textarea
                            className="modal-select"
                            rows={4}
                            placeholder="Укажите причину..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button className="admin-btn" onClick={() => setRejectModal(false)}>
                                Отмена
                            </button>
                            <button className="admin-btn-danger" onClick={reject}>
                                Отклонить
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
