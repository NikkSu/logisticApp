import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

const API = "http://localhost:8080/api";

function getAuth() {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function SupplierOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        try {
            const res = await fetch(`${API}/supplier/orders`, { headers: getAuth() });
            const data = await res.json();
            console.log("ORDERS RESPONSE:", data);

            if (Array.isArray(data)) setOrders(data);
            else {
                setOrders([]);
                console.error("Expected array but got:", data);
            }

            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function openDetails(id) {
        setSelected(id);
        const res = await fetch(`${API}/supplier/orders/${id}`, { headers: getAuth() });
        const d = await res.json();
        setDetail(d);
    }

    return (
        <div className="supplier-products-layout">

            <div className="admin-header">
                <h2 className="admin-title">Заказы</h2>
                <p className="admin-subtitle">Все заказы, оформленные на ваши товары</p>
            </div>

            <div className="admin-scrollable">
                <div className="admin-table-wrapper" style={{ minHeight: "300px" }}>
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Компания заказчика</th>
                            <th>Дата</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="admin-no-results">
                                    Загрузка...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="admin-no-results">
                                    Заказов нет
                                </td>
                            </tr>
                        ) : (
                            orders.map(o => (
                                <tr key={o.id}>
                                    <td>{o.id}</td>
                                    <td>{o.supplierName}</td>
                                    <td>{o.date}</td>
                                    <td>{o.totalSum} ₽</td>
                                    <td>{o.status}</td>

                                    <td className="admin-actions">
                                        <button className="admin-btn" onClick={() => openDetails(o.id)}>
                                            Подробнее
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
            {detail && (
                <div className="modal-overlay show" onClick={() => setDetail(null)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>

                        <button className="modal-close" onClick={() => setDetail(null)}>✕</button>

                        <h2 className="modal-title">Заказ #{detail.id}</h2>

                        <div className="modal-section">
                            <p><b>Дата:</b> {detail.date}</p>
                            <p><b>Статус:</b> {detail.status}</p>
                            <p><b>Сумма:</b> {detail.totalSum} ₽</p>
                        </div>

                        <h3 className="modal-subtitle">Позиции:</h3>
                        <ul className="order-items-list">
                            {detail.items.map((i, idx) => (
                                <li key={idx} className="order-item-row">
                                    <div>{i.productName}</div>
                                    <div>×{i.quantity}</div>
                                    <div>{i.price} ₽</div>
                                </li>
                            ))}
                        </ul>
                        <div className="buttons-block">
                        {/* кнопка смены статуса */}
                        {detail.status === "CREATED" && (
                            <button
                                className="btn-sent"
                                onClick={async () => {
                                    await fetch(`${API}/orders/supplier/orders/${detail.id}/status?status=SENT`, {
                                        method: "PATCH",
                                        headers: getAuth(),
                                    });


                                    // Обновляем данные
                                    await loadOrders();
                                    await openDetails(detail.id);
                                }}

                            >
                                Отметить как отправлено
                            </button>

                        )}
                        {detail.status === "CREATED" && (
                            <button
                                className="btn-cancell"
                                onClick={async () => {
                                    await fetch(`${API}/orders/supplier/orders/${detail.id}/status?status=CANCELLED`, {
                                        method: "PATCH",
                                        headers: getAuth(),
                                    });


                                    // Обновляем данные
                                    await loadOrders();
                                    await openDetails(detail.id);
                                }}

                            >
                                Отклонить заказ
                            </button>

                        )}
                        </div>
                    </div>

                </div>
            )}


        </div>
    );
}
