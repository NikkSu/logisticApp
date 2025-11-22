import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [detailModal, setDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:8080/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setOrders(data))
            .catch(err => console.error("Ошибка загрузки заказов", err));
    }, []);

    const filtered = orders.filter(order => {
        const matchSearch =
            order.id.toString().includes(search) ||
            order.companyName.toLowerCase().includes(search.toLowerCase()) ||
            order.supplierName.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === "ALL" || order.status === statusFilter;

        return matchSearch && matchStatus;
    });

    const deleteOrder = async (id) => {
        if (!window.confirm("Удалить заказ?")) return;

        const token = localStorage.getItem("token");

        await fetch(`http://localhost:8080/api/admin/orders/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        setOrders(prev => prev.filter(o => o.id !== id));
    };

    const openDetails = async (id) => {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:8080/api/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            setSelectedOrder(data);
            setDetailModal(true);
        }
    };

    return (
        <div className="admin-users-layout">
            {/* HEADER */}
            <div className="admin-header">
                <h2 className="admin-title">Заказы</h2>
                <p className="admin-subtitle">Просмотр, фильтрация и управление заказами компаний</p>
            </div>

            {/* STATS */}
            <div className="admin-stats">

                <div
                    className={`admin-stat-card ${statusFilter === "ALL" ? "active-card" : ""}`}
                    onClick={() => setStatusFilter("ALL")}
                >
                    <div className="admin-stat-value">{orders.length}</div>
                    <div className="admin-stat-label">Всего</div>
                </div>

                <div
                    className={`admin-stat-card ${statusFilter === "CREATED" ? "active-card" : ""}`}
                    onClick={() => setStatusFilter("CREATED")}
                >
                    <div className="admin-stat-value">
                        {orders.filter(o => o.status === "CREATED").length}
                    </div>
                    <div className="admin-stat-label">Создано</div>
                </div>

                <div
                    className={`admin-stat-card ${statusFilter === "PROCESSING" ? "active-card" : ""}`}
                    onClick={() => setStatusFilter("PROCESSING")}
                >
                    <div className="admin-stat-value">
                        {orders.filter(o => o.status === "PROCESSING").length}
                    </div>
                    <div className="admin-stat-label">В процессе</div>
                </div>

                <div
                    className={`admin-stat-card ${statusFilter === "DONE" ? "active-card" : ""}`}
                    onClick={() => setStatusFilter("DONE")}
                >
                    <div className="admin-stat-value">
                        {orders.filter(o => o.status === "DONE").length}
                    </div>
                    <div className="admin-stat-label">Выполнено</div>
                </div>

                <div
                    className={`admin-stat-card ${statusFilter === "CANCELED" ? "active-card" : ""}`}
                    onClick={() => setStatusFilter("CANCELED")}
                >
                    <div className="admin-stat-value">
                        {orders.filter(o => o.status === "CANCELED").length}
                    </div>
                    <div className="admin-stat-label">Отменено</div>
                </div>
            </div>

            {/* SEARCH */}
            <div className="admin-actions-top">
                <input
                    className="admin-search"
                    placeholder="Поиск по ID, компании или поставщику..."
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
                            <th>Дата</th>
                            <th>Компания</th>
                            <th>Поставщик</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="admin-no-results">
                                    Ничего не найдено
                                </td>
                            </tr>
                        ) : (
                            filtered.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>{order.companyName}</td>
                                    <td>{order.supplierName}</td>
                                    <td>{order.status}</td>
                                    <td>{order.totalSum} ₽</td>
                                    <td className="admin-actions">
                                        <button
                                            className="admin-btn"
                                            onClick={() => openDetails(order.id)}
                                        >
                                            Открыть
                                        </button>

                                        <button
                                            className="admin-btn-danger"
                                            onClick={() => deleteOrder(order.id)}
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

            {/* DETAILS MODAL */}
            {detailModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setDetailModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>

                        <h3 className="modal-title">Детали заказа #{selectedOrder.id}</h3>

                        <p><b>Компания:</b> {selectedOrder.companyName}</p>
                        <p><b>Поставщик:</b> {selectedOrder.supplierName}</p>
                        <p><b>Дата:</b> {selectedOrder.date}</p>
                        <p><b>Статус:</b> {selectedOrder.status}</p>

                        <h4 style={{ marginTop: 20 }}>Товары:</h4>
                        <ul className="modal-items-list">
                            {selectedOrder.items.map((i, index) => (
                                <li key={index}>
                                    {i.productName} — {i.quantity} × {i.price} ₽
                                </li>
                            ))}
                        </ul>

                        <h3 style={{ marginTop: 10 }}>
                            Итого: {selectedOrder.totalSum} ₽
                        </h3>

                        <div className="modal-actions">
                            <button className="admin-btn" onClick={() => setDetailModal(false)}>
                                Закрыть
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
